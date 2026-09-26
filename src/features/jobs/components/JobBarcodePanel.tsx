import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useJobActions } from '../hooks/useJobActions';
import { useJobResolvedLabels } from '../hooks/useJobResolvedLabels';
import type { Job } from '../types/job.types';
import { downloadJobBarcodePdf } from '../utils/downloadJobBarcodePdf';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  jobBarcodeLabelTitle,
  resolveJobBarcodeValue,
} from '../utils/resolveJobBarcode';
import {
  Code128Barcode,
  printCode128Label,
  renderCode128PngBytes,
} from './Code128Barcode';

/** Job-detail barcode: CODE128 + formatted PDF matching quotation / invoice. */
export function JobBarcodePanel({ job }: { job: Job }) {
  const actions = useJobActions(job.id);
  const labels = useJobResolvedLabels(job);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pdfPending, setPdfPending] = useState(false);
  const code = resolveJobBarcodeValue(job);
  const title = jobBarcodeLabelTitle(job);

  const onBarcodeError = useCallback((message: string) => {
    setErr(message);
  }, []);

  const queueLabel = async () => {
    setErr(null);
    setMsg(null);
    try {
      await actions.generateBarcodeLabel.mutateAsync({});
      setMsg('Barcode label PDF queued on server. Check Documents when ready.');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const downloadPng = async () => {
    setErr(null);
    setMsg(null);
    if (!code) {
      setErr('No scannable barcode value.');
      return;
    }
    try {
      const bytes = await renderCode128PngBytes(code, { displayValue: true });
      const blob = new Blob([bytes], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${title.replace(/[^\w.-]+/g, '_')}.png`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setMsg('Scannable PNG downloaded.');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const downloadPdf = async (openPreview: boolean) => {
    setErr(null);
    setMsg(null);
    setPdfPending(true);
    try {
      await downloadJobBarcodePdf({
        job,
        labels,
        svg: svgHostRef.current?.querySelector('svg'),
        openPreview,
      });
      setMsg(openPreview ? 'Sticker preview opened.' : 'Sticker PDF downloaded (100×50 mm).');
    } catch (e) {
      setErr(getErrorMessage(e) || 'Could not generate barcode PDF.');
    } finally {
      setPdfPending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Barcode</CardTitle>
        <Link to="/jobs/barcode-scan" className="text-xs underline">
          Scan station
        </Link>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Print-and-paste sticker (100×50&nbsp;mm). CODE128 is print-grade (black bars, quiet
          zone) so gate scanners can read it.
        </p>
        <div
          ref={svgHostRef}
          className="flex justify-center rounded-md border border-[var(--color-neutral-200)] bg-white p-4"
        >
          <Code128Barcode value={code} onError={onBarcodeError} />
        </div>
        <p className="text-center font-mono text-xs text-[var(--color-neutral-600)]">{code}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pdfPending}
            onClick={() => void downloadPdf(false)}
          >
            {pdfPending ? 'Building sticker…' : 'Download sticker PDF'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pdfPending}
            onClick={() => void downloadPdf(true)}
          >
            Preview sticker
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              printCode128Label({
                value: code,
                title,
                subtitle: job.job_type,
                svg: svgHostRef.current?.querySelector('svg'),
                lines: [
                  labels.shipperLabel || job.shipper_name || '',
                  [
                    job.pieces != null ? `Pcs ${job.pieces}` : '',
                    job.gross_weight != null ? `Wt ${job.gross_weight} kg` : '',
                    job.volume_cbm != null ? `CBM ${job.volume_cbm}` : '',
                  ]
                    .filter(Boolean)
                    .join(' · '),
                ].filter(Boolean),
              })
            }
          >
            Print sticker
          </Button>
          <Button type="button" variant="secondary" onClick={() => void downloadPng()}>
            Download PNG
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={actions.generateBarcodeLabel.isPending}
            onClick={() => void queueLabel()}
          >
            {actions.generateBarcodeLabel.isPending ? 'Queuing…' : 'Queue server PDF'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard?.writeText(code).then(
                () => setMsg('Copied.'),
                () => setErr('Could not copy.'),
              );
            }}
          >
            Copy value
          </Button>
        </div>
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
      </div>
    </Card>
  );
}
