import { Link } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { AwbDraftFromBookingPanel, pickAwbDraftIdsFromPathHints } from '@/features/shared/awb-draft';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import {
  pickJobIdFromQuotationBookingForm,
  useQuotationBookingForm,
} from '../hooks/useQuotationBookingForm';
import type { Quotation } from '../types/quotation.types';

interface QuotationAwbDraftPanelProps {
  quotation: Quotation;
}

/**
 * Staff quotation AWB Draft — booking form → provisional job → HAWB/MAWB.
 */
export function QuotationAwbDraftPanel({ quotation }: QuotationAwbDraftPanelProps) {
  const bookingQuery = useQuotationBookingForm(quotation.id, Boolean(quotation.id));
  const jobIdFromForm = pickJobIdFromQuotationBookingForm(bookingQuery.data);
  const hintIds = pickAwbDraftIdsFromPathHints(quotation.path_hints);
  const jobId =
    (quotation.job_id && isUuid(quotation.job_id) ? quotation.job_id : undefined) ||
    hintIds.jobId ||
    jobIdFromForm;
  const shipmentId =
    (quotation.shipment_id && isUuid(quotation.shipment_id)
      ? quotation.shipment_id
      : undefined) || hintIds.shipmentId;

  if (bookingQuery.isLoading && !jobId && !shipmentId) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        Loading booking form for AWB draft…
      </p>
    );
  }

  if (!jobId && !shipmentId) {
    return (
      <p className="text-sm text-[var(--color-neutral-600)]">
        Save the <strong>Booking form</strong> first so a provisional job exists, then generate
        the HAWB/MAWB draft here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {jobId ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Linked job:{' '}
          <Link
            className="text-[var(--color-primary)] underline"
            to={jobDetailPath({ id: jobId, job_type: quotation.job_type })}
          >
            {quotation.job_number || jobId.slice(0, 8)}
          </Link>
        </p>
      ) : null}
      <AwbDraftFromBookingPanel
        jobId={jobId}
        shipmentId={shipmentId}
        quotationId={quotation.id}
      />
    </div>
  );
}
