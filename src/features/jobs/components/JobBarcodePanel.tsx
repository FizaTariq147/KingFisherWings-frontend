import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useJobActions } from '../hooks/useJobActions';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  jobBarcodeLabelTitle,
  resolveJobBarcodeValue,
} from '../utils/resolveJobBarcode';
import {
  Code128Barcode,
  downloadCode128Png,
  printCode128Label,
} from './Code128Barcode';

/** Job-detail barcode: render CODE128 in-browser + optional server PDF queue. */
export function JobBarcodePanel({ job }: { job: Job }) {
  const actions = useJobActions(job.id);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
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
    const svg = svgHostRef.current?.querySelector('svg');
    if (!svg) {
      setErr('Barcode not ready yet.');
      return;
    }
    try {
      await downloadCode128Png(svg, `barcode-${title.replace(/[^\w.-]+/g, '_')}`);
      setMsg('PNG downloaded.');
    } catch (e) {
      setErr(getErrorMessage(e));
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
            onClick={() =>
              printCode128Label({
                value: code,
                title,
                subtitle: job.job_type,
                svg: svgHostRef.current?.querySelector('svg'),
              })
            }
          >
            Print label
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
