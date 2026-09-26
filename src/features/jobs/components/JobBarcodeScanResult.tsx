import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from '../constants/job.constants';
import { useJobResolvedLabels } from '../hooks/useJobResolvedLabels';
import type { Job } from '../types/job.types';
import { downloadJobBarcodePdf } from '../utils/downloadJobBarcodePdf';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { resolveJobBarcodeValue } from '../utils/resolveJobBarcode';
import { Code128Barcode } from './Code128Barcode';
import { JobOverviewPanel } from './JobOverviewPanel/JobOverviewPanel';

type ScanMode = 'lookup' | 'scan' | null;

/**
 * Issued after every successful scan / lookup on any device:
 * summary strip + full JobOverviewPanel (parties, route, cargo, mode details).
 */
export function JobBarcodeScanResult({
  job,
  mode,
  onOpenJob,
}: {
  job: Job;
  mode?: ScanMode;
  onOpenJob?: () => void;
}) {
  const svgHostRef = useRef<HTMLDivElement>(null);
  const labels = useJobResolvedLabels(job);
  const [pdfPending, setPdfPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const code = resolveJobBarcodeValue(job);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/jobs/barcode-scan?code=${encodeURIComponent(code)}`
      : `/jobs/barcode-scan?code=${encodeURIComponent(code)}`;

  const runPdf = async (openPreview: boolean) => {
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
      setMsg(openPreview ? 'Sticker preview opened.' : 'Sticker PDF downloaded.');
    } catch (e) {
      setErr(getErrorMessage(e) || 'Could not generate barcode PDF.');
    } finally {
      setPdfPending(false);
    }
  };

  const copyShare = () => {
    void navigator.clipboard?.writeText(shareUrl).then(
      () => setMsg('Link copied — open on any logged-in device to see these details.'),
      () => setErr('Could not copy link.'),
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-[var(--color-success-200)] bg-[var(--color-success-50)]/40">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-success-700)]">
              {mode === 'scan' ? 'Scan recorded — details issued' : 'Lookup — details issued'}
            </p>
            <CardTitle className="mt-1 break-all text-lg sm:text-xl">
              {jobDisplayNumber(job)}
            </CardTitle>
            <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
              {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
              {' · '}
              {JOB_STATUS_LABELS[job.status] ?? job.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onOpenJob}>
              Open full job
            </Button>
            <Link
              to={`${jobDetailPath(job)}?tab=overview`}
              className="inline-flex items-center rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-sm"
            >
              Overview tab
            </Link>
            <Button type="button" variant="secondary" onClick={copyShare}>
              Copy link for other device
            </Button>
          </div>
        </CardHeader>

        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCell label="Shipper" value={labels.shipperLabel || job.shipper_name} />
          <SummaryCell label="Consignee" value={labels.consigneeLabel || job.consignee_name} />
          <SummaryCell
            label="Pieces / weight"
            value={[
              job.pieces != null ? `${job.pieces} pcs` : null,
              job.gross_weight != null ? `${job.gross_weight} kg` : null,
            ]
              .filter(Boolean)
              .join(' · ') || undefined}
          />
          <SummaryCell label="Barcode" value={code} mono />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Barcode on goods</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <div
            ref={svgHostRef}
            className="flex justify-center overflow-x-auto rounded-md border border-[var(--color-neutral-200)] bg-white p-3 sm:p-4"
          >
            <Code128Barcode value={code} />
          </div>
          <p className="text-center font-mono text-xs break-all text-[var(--color-neutral-600)]">
            {code}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={pdfPending} onClick={() => void runPdf(false)}>
              {pdfPending ? 'Building…' : 'Download sticker PDF'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pdfPending}
              onClick={() => void runPdf(true)}
            >
              Preview sticker
            </Button>
          </div>
          {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
          {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        </div>
      </Card>

      <div>
        <h2 className="mb-2 text-base font-semibold text-[var(--color-neutral-800)]">
          All job details
        </h2>
        <p className="mb-3 text-xs text-[var(--color-neutral-500)]">
          Complete record for this barcode — basic, parties, route, cargo, and mode fields. Readable
          on phone, tablet, and desktop.
        </p>
        <JobOverviewPanel job={job} />
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-[var(--color-neutral-100)] bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-medium break-words text-[var(--color-neutral-800)] ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value?.trim() ? value : '—'}
      </p>
    </div>
  );
}
