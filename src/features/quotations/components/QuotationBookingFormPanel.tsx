import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { ModeBookingFormPanel } from '@/features/jobs/components/ModeBookingFormPanel';
import { staffBookingFormModeFromJob } from '@/features/jobs/hooks/useStaffBookingForm';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { extractBookingFormDocuments } from '@/features/booking-documents/utils/bookingFormDocuments';
import {
  BOOKING_DOCUMENT_KIND_LABELS,
} from '@/features/booking-documents/constants/bookingDocumentKinds';
import { quotationService } from '../services/quotation.service';
import { quotationKeys } from '../hooks/useQuotations';
import type { Quotation } from '../types/quotation.types';
import { usesModeBookingFormConvertFlow } from '../utils/quotationStatus';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickJobIdFromBookingForm(raw: unknown): string | undefined {
  const r = asRecord(raw);
  if (!r) return undefined;
  const form = asRecord(r.form) ?? asRecord(r.booking_form) ?? r;
  for (const key of [
    'converted_job_id',
    'convertedJobId',
    'job_id',
    'jobId',
    'provisional_job_id',
    'provisionalJobId',
  ]) {
    const v = String(r[key] ?? form?.[key] ?? '').trim();
    if (isUuid(v)) return v;
  }
  const nestedJob = asRecord(r.job) ?? asRecord(r.converted_job) ?? asRecord(form?.job);
  const nestedId = String(nestedJob?.id ?? '').trim();
  return isUuid(nestedId) ? nestedId : undefined;
}

interface QuotationBookingFormPanelProps {
  quotation: Quotation;
}

/**
 * Admin quotation “Booking form” tab — mirrors job booking_form tab via provisional /
 * converted job. Prefer ModeBookingFormPanel when a job id is available.
 */
export function QuotationBookingFormPanel({ quotation }: QuotationBookingFormPanelProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const mode = staffBookingFormModeFromJob({ job_type: quotation.job_type });
  const show =
    quotation.actions?.can_booking_form !== false &&
    (usesModeBookingFormConvertFlow(quotation.job_type) || Boolean(mode));

  const bookingQuery = useQuery({
    queryKey: [...quotationKeys.detail(quotation.id), 'booking-form'] as const,
    queryFn: () => quotationService.getBookingForm(quotation.id),
    enabled: Boolean(accessToken) && isUuid(quotation.id) && show,
    retry: false,
  });

  const jobId =
    (quotation.job_id && isUuid(quotation.job_id) ? quotation.job_id : undefined) ||
    pickJobIdFromBookingForm(bookingQuery.data);

  const docs = useMemo(() => {
    const root = asRecord(bookingQuery.data);
    const form =
      asRecord(root?.form) ??
      asRecord(root?.booking_form) ??
      asRecord(root?.documents ? root : null) ??
      root;
    return extractBookingFormDocuments(form);
  }, [bookingQuery.data]);

  if (!show) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        Booking form is not available for this quotation type.
      </p>
    );
  }

  if (jobId && mode) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Linked provisional / converted job{' '}
          <Link
            className="text-[var(--color-primary)] underline"
            to={jobDetailPath({ id: jobId, job_type: quotation.job_type })}
          >
            {quotation.job_number || jobId.slice(0, 8)}
          </Link>
          . Same payload as the job Booking form tab.
        </p>
        <ModeBookingFormPanel jobId={jobId} mode={mode} />
      </div>
    );
  }

  if (jobId && !mode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking form</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2 text-sm">
          <p className="text-[var(--color-neutral-600)]">
            Provisional job is ready. Open the job Booking form tab for full edit.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              window.location.assign(
                jobDetailPath({ id: jobId, job_type: quotation.job_type }),
              );
            }}
          >
            Open job
          </Button>
        </div>
      </Card>
    );
  }

  const kindList = [...docs.kinds];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking form</CardTitle>
      </CardHeader>
      <div className="px-4 pb-4 space-y-3 text-sm">
        {bookingQuery.isLoading ? (
          <p className="text-[var(--color-neutral-400)]">Loading booking form…</p>
        ) : null}
        {bookingQuery.isError ? (
          <p className="text-[var(--color-neutral-500)]">
            Booking form not available yet. Customer completion or convert creates the
            provisional job.
          </p>
        ) : null}
        {!bookingQuery.isLoading && !bookingQuery.isError ? (
          <>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Documents from GET /quotations/:id/booking-form (enriched per-kind meta).
            </p>
            {kindList.length === 0 ? (
              <p className="text-[var(--color-neutral-400)]">No booking documents yet.</p>
            ) : (
              <ul className="space-y-1.5 rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2">
                {kindList.map((kind) => {
                  const meta = docs.byKind[kind];
                  const label =
                    BOOKING_DOCUMENT_KIND_LABELS[
                      kind as keyof typeof BOOKING_DOCUMENT_KIND_LABELS
                    ] || kind;
                  const hasFile = Boolean(
                    meta?.id ||
                      meta?.file_url ||
                      meta?.download_url ||
                      meta?.download_path ||
                      meta?.s3_key,
                  );
                  return (
                    <li
                      key={kind}
                      className="flex flex-wrap items-center justify-between gap-2 text-[var(--color-neutral-800)]"
                    >
                      <span>
                        <span className="font-medium">{label}</span>
                        {meta?.file_name ? (
                          <span className="text-[var(--color-neutral-500)]">
                            {' '}
                            — {meta.file_name}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[11px] text-[var(--color-neutral-500)]">
                        {hasFile ? 'On file' : meta?.missing ? 'Missing' : 'Flagged'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </Card>
  );
}
