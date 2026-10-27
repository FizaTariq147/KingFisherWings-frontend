import { Link } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { BlDraftFromBookingPanel } from '@/features/shared/bl-draft/BlDraftFromBookingPanel';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import {
  pickJobIdFromQuotationBookingForm,
  useQuotationBookingForm,
} from '../hooks/useQuotationBookingForm';
import type { Quotation } from '../types/quotation.types';

interface QuotationBlDraftPanelProps {
  quotation: Quotation;
}

/**
 * Staff quotation BL Draft — same booking-form → HBL draft path as shipment/job:
 * GET/PUT /quotations/:id/booking-form (provisional job) →
 * GET/POST /jobs/:id/bl-draft/preview|generate (autofill from booking form, is_original: false).
 */
export function QuotationBlDraftPanel({ quotation }: QuotationBlDraftPanelProps) {
  const bookingQuery = useQuotationBookingForm(quotation.id, Boolean(quotation.id));
  const jobIdFromForm = pickJobIdFromQuotationBookingForm(bookingQuery.data);
  const jobId =
    (quotation.job_id && isUuid(quotation.job_id) ? quotation.job_id : undefined) ||
    jobIdFromForm;
  const shipmentId =
    quotation.shipment_id && isUuid(quotation.shipment_id)
      ? quotation.shipment_id
      : undefined;

  if (bookingQuery.isLoading && !jobId) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        Loading booking form / provisional job for BL draft…
      </p>
    );
  }

  if (bookingQuery.isError && !jobId) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        Could not load the quotation booking form. Complete the Booking form tab first so a
        provisional job exists, then generate the HBL draft from booking-form fields.
      </p>
    );
  }

  if (!jobId && !shipmentId) {
    return (
      <div className="space-y-2 text-sm text-[var(--color-neutral-600)]">
        <p>
          BL draft needs a job linked to this quotation. Open the{' '}
          <strong>Booking form</strong> tab and save (or complete) it so the API creates a
          provisional job with parties, cargo, and containers — then return here to preview /
          generate the HBL draft PDF.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--color-neutral-500)]">
        Uses booking-form autofill on the linked job
        {jobId ? (
          <>
            {' '}
            (
            <Link
              className="text-[var(--color-primary)] underline"
              to={jobDetailPath({ id: jobId, job_type: quotation.job_type })}
            >
              {quotation.job_number || jobId.slice(0, 8)}
            </Link>
            )
          </>
        ) : null}
        . Generate builds the classic HBL form (Fresa FG HBL HKG layout) with
        the KingFisher logo from booking-form parties, cargo, and containers.
      </p>
      <BlDraftFromBookingPanel
        jobId={jobId}
        shipmentId={shipmentId}
        quotationId={quotation.id}
      />
    </div>
  );
}
