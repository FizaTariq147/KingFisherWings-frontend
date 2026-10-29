import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { ModeBookingFormPanel } from '@/features/jobs/components/ModeBookingFormPanel';
import { staffBookingFormModeFromJob } from '@/features/jobs/hooks/useStaffBookingForm';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import {
  pickJobIdFromQuotationBookingForm,
  useQuotationBookingForm,
} from '../hooks/useQuotationBookingForm';
import { quotationKeys } from '../hooks/useQuotations';
import type { Quotation } from '../types/quotation.types';
import { usesModeBookingFormConvertFlow } from '../utils/quotationStatus';

interface QuotationBookingFormPanelProps {
  quotation: Quotation;
}

/**
 * Admin quotation Booking form tab — full ModeBookingFormPanel before convert,
 * backed by GET/PUT/POST /quotations/:id/booking-form (OpenAPI: creates provisional
 * job if needed). When a job id is already linked, uses job booking-form APIs.
 */
export function QuotationBookingFormPanel({ quotation }: QuotationBookingFormPanelProps) {
  const queryClient = useQueryClient();
  const mode = staffBookingFormModeFromJob({ job_type: quotation.job_type });
  const show =
    quotation.actions?.can_booking_form !== false &&
    (usesModeBookingFormConvertFlow(quotation.job_type) || Boolean(mode));

  const bookingQuery = useQuotationBookingForm(quotation.id, show && Boolean(quotation.id));

  const jobIdFromForm = pickJobIdFromQuotationBookingForm(bookingQuery.data);
  const jobId =
    (quotation.job_id && isUuid(quotation.job_id) ? quotation.job_id : undefined) ||
    jobIdFromForm;

  useEffect(() => {
    if (!jobIdFromForm) return;
    if (quotation.job_id === jobIdFromForm) return;
    void queryClient.invalidateQueries({ queryKey: quotationKeys.detail(quotation.id) });
    void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
  }, [jobIdFromForm, quotation.job_id, quotation.id, queryClient]);

  if (!show) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        Booking form is not available for this quotation type.
      </p>
    );
  }

  const isConverted =
    String(quotation.status ?? '').toUpperCase().replace(/[\s-]+/g, '_') ===
    'CONVERTED';

  if (!mode) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        Booking form is not available for this quotation type.
        {jobId && isConverted ? (
          <>
            {' '}
            <Link
              className="text-[var(--color-primary)] underline"
              to={jobDetailPath({ id: jobId, job_type: quotation.job_type })}
            >
              Open linked job
            </Link>
          </>
        ) : null}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {jobId && isConverted ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Linked job{' '}
          <Link
            className="text-[var(--color-primary)] underline"
            to={jobDetailPath({ id: jobId, job_type: quotation.job_type })}
          >
            {quotation.job_number || (jobId ? `Job ${jobId.slice(0, 8)}` : '—')}
          </Link>
          .
        </p>
      ) : jobId ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Provisional job prepared for booking-form docs (View Job appears after
          status is CONVERTED).
        </p>
      ) : (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Quotation booking form (GET/PUT/POST /quotations/:id/booking-form) — creates a
          provisional job when needed. Customer portal submit loads here for Ops review,
          Save, and Complete.
        </p>
      )}
      <ModeBookingFormPanel
        jobId={jobId}
        quotationId={quotation.id}
        mode={mode}
      />
    </div>
  );
}
