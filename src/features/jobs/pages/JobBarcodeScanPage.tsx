import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { BarcodeCameraScanner } from '../components/BarcodeCameraScanner';
import { JobBarcodeScanResult } from '../components/JobBarcodeScanResult';
import { useFindJobByBarcode, useScanJobBarcode } from '../hooks/useJobBarcode';
import { jobService } from '../services/job.service';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobDetailPath, jobDisplayNumber } from '../utils/jobRoute';
import { normalizeCode128Value } from '../utils/scannableBarcode';

async function enrichJob(job: Job): Promise<Job> {
  if (!job?.id || !isUuid(job.id)) return job;
  try {
    // Always load full job so every device sees complete details after scan.
    return await jobService.getById(job.id);
  } catch {
    return job;
  }
}

export default function JobBarcodeScanPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const findByBarcode = useFindJobByBarcode();
  const scanBarcode = useScanJobBarcode();
  const autoRanRef = useRef<string | null>(null);

  const [barcode, setBarcode] = useState(() => searchParams.get('code') ?? '');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [job, setJob] = useState<Job | null>(null);
  const [mode, setMode] = useState<'lookup' | 'scan' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const busy = findByBarcode.isPending || scanBarcode.isPending;
  const code = normalizeCode128Value(barcode);

  const focusInput = () => {
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const showFullDetails = useCallback((found: Job, nextMode: 'lookup' | 'scan', msg: string) => {
    setJob(found);
    setMode(nextMode);
    setMessage(msg);
    const value = normalizeCode128Value(
      found.barcode || found.barcode_value || found.job_number || '',
    );
    if (value) autoRanRef.current = value;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('code', value);
        return next;
      },
      { replace: true },
    );
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [setSearchParams]);

  const onLookup = useCallback(async (override?: string) => {
    const lookupCode = normalizeCode128Value(override ?? barcode);
    if (!lookupCode) return;
    setBarcode(lookupCode);
    setError(null);
    setMessage(null);
    setJob(null);
    setMode('lookup');
    try {
      const found = await enrichJob(await findByBarcode.mutateAsync(lookupCode));
      showFullDetails(
        found,
        'lookup',
        `Found ${jobDisplayNumber(found)} — full job details issued below (works on phone, tablet, desktop).`,
      );
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      focusInput();
    }
  }, [barcode, findByBarcode, showFullDetails]);

  const onScan = useCallback(async (override?: string) => {
    const scanCode = normalizeCode128Value(override ?? barcode);
    if (!scanCode) return;
    setBarcode(scanCode);
    setError(null);
    setMessage(null);
    setJob(null);
    setMode('scan');
    try {
      const found = await enrichJob(
        await scanBarcode.mutateAsync({
          barcode: scanCode,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      );
      showFullDetails(
        found,
        'scan',
        `Scan recorded for ${jobDisplayNumber(found)} — full job details issued below.`,
      );
      setBarcode('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      focusInput();
    }
  }, [barcode, location, notes, scanBarcode, showFullDetails]);

  const onCameraDetected = useCallback(
    (detected: string) => {
      void onScan(detected);
    },
    [onScan],
  );

  // Deep-link / shareable URL: /jobs/barcode-scan?code=JOBWH… opens details on any device.
  useEffect(() => {
    const fromUrl = normalizeCode128Value(searchParams.get('code') ?? '');
    if (!fromUrl || autoRanRef.current === fromUrl) return;
    autoRanRef.current = fromUrl;
    setBarcode(fromUrl);
    void onLookup(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per distinct ?code=
  }, [searchParams]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 pb-8 sm:px-4">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Job barcode — scan station</h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Scan on any device (USB gun, phone camera, or typed code). The app issues the{' '}
          <strong className="font-medium text-[var(--color-neutral-700)]">full job details</strong>{' '}
          for that barcode immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan / lookup</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <Input
            ref={inputRef}
            label="Barcode *"
            placeholder="Scan sticker, use camera, or type CODE128 value"
            value={barcode}
            autoFocus
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
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
              {scanBarcode.isPending ? 'Scanning…' : 'Scan (record + show details)'}
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

          <div className="border-t border-[var(--color-neutral-100)] pt-3">
            <p className="mb-2 text-xs font-medium text-[var(--color-neutral-600)]">
              Phone / tablet camera
            </p>
            <BarcodeCameraScanner onDetected={onCameraDetected} disabled={busy} />
          </div>

          <p className="text-xs text-[var(--color-neutral-400)]">
            Enter submits Scan. Share this page with{' '}
            <code className="rounded bg-[var(--color-neutral-100)] px-1">?code=…</code> to open the
            same job details on another device.
          </p>
          {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
        </div>
      </Card>

      {job ? (
        <div ref={resultRef} id="job-scan-details" className="scroll-mt-4">
          <JobBarcodeScanResult
            job={job}
            mode={mode}
            onOpenJob={() => navigate(jobDetailPath(job))}
          />
        </div>
      ) : null}
    </div>
  );
}
