import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Code128Barcode } from '../components/Code128Barcode';
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from '../constants/job.constants';
import { useFindJobByBarcode, useScanJobBarcode } from '../hooks/useJobBarcode';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { resolveJobBarcodeValue } from '../utils/resolveJobBarcode';

export default function JobBarcodeScanPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const findByBarcode = useFindJobByBarcode();
  const scanBarcode = useScanJobBarcode();

  const [barcode, setBarcode] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [job, setJob] = useState<Job | null>(null);
  const [mode, setMode] = useState<'lookup' | 'scan' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const busy = findByBarcode.isPending || scanBarcode.isPending;
  const code = barcode.trim();

  const focusInput = () => {
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onLookup = async () => {
    if (!code) return;
    setError(null);
    setMessage(null);
    setJob(null);
    setMode('lookup');
    try {
      const found = await findByBarcode.mutateAsync(code);
      setJob(found);
      setMessage(`Found ${jobDisplayNumber(found)} (lookup only — no scan event).`);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      focusInput();
    }
  };

  const onScan = async () => {
    if (!code) return;
    setError(null);
    setMessage(null);
    setJob(null);
    setMode('scan');
    try {
      const found = await scanBarcode.mutateAsync({
        barcode: code,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setJob(found);
      setMessage(`Scan recorded for ${jobDisplayNumber(found)}.`);
      setBarcode('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      focusInput();
    }
  };

  const openJob = () => {
    if (!job) return;
    navigate(jobDetailPath(job));
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Job barcode</h1>
          <p className="text-sm text-[var(--color-neutral-500)]">
            Lookup any job by barcode, or scan to record an event (universal — all job types).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan / lookup</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <Input
            ref={inputRef}
            label="Barcode *"
            placeholder="Scan or type CODE128 value"
            value={barcode}
            autoFocus
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void onScan();
              }
            }}
          />
          <Input
            label="Location (optional)"
            placeholder="e.g. Warehouse dock A"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="Notes (optional)"
            placeholder="Scan notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy || !code} onClick={() => void onScan()}>
              {scanBarcode.isPending ? 'Scanning…' : 'Scan (record event)'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy || !code}
              onClick={() => void onLookup()}
            >
              {findByBarcode.isPending ? 'Looking up…' : 'Lookup only'}
            </Button>
          </div>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Enter submits Scan. Lookup uses GET /jobs/by-barcode/:code · Scan uses POST /jobs/scan.
          </p>
          {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
        </div>
      </Card>

      {job ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>{jobDisplayNumber(job)}</CardTitle>
            {mode ? (
              <span className="text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                {mode}
              </span>
            ) : null}
          </CardHeader>
          <div className="space-y-2 px-4 pb-4 text-sm">
            <p>
              <span className="text-[var(--color-neutral-500)]">Type · </span>
              {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
            </p>
            <p>
              <span className="text-[var(--color-neutral-500)]">Status · </span>
              {JOB_STATUS_LABELS[job.status] ?? job.status}
            </p>
            {job.shipper_name ? (
              <p>
                <span className="text-[var(--color-neutral-500)]">Shipper · </span>
                {job.shipper_name}
              </p>
            ) : null}
            <div className="flex justify-center rounded-md border border-[var(--color-neutral-200)] bg-white p-3">
              <Code128Barcode value={resolveJobBarcodeValue(job)} height={56} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" onClick={openJob}>
                Open job
              </Button>
              <Link
                to={`${jobDetailPath(job)}?tab=overview`}
                className="inline-flex items-center text-sm underline"
              >
                Print / download label
              </Link>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
