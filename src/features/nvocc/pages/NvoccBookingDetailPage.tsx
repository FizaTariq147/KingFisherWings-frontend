import { useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import { useNvoccBooking, useNvoccBookingActions } from '@/features/nvocc/hooks/useNvocc';
import { nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { normalizeJob } from '@/features/jobs/utils/normalizeJob';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import type { JobType } from '@/features/jobs/constants/job.constants';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function NvoccBookingDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useNvoccBooking(id);
  const actions = useNvoccBookingActions(id);
  const booking = query.data;

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (error) {
      window.alert(extractAxiosErrorDetail(error));
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/nvocc/booking-list" label="Back to bookings" />
      <NvoccListState loading={query.isLoading} error={query.isError ? query.error : undefined} />
      {booking && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-gray-200 bg-white p-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{nvoccDisplayNumber(booking, 'Booking')}</h1>
              <div className="mt-2">
                <NvoccStatusBadge status={booking.booking_status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={actions.confirm.isPending}
                onClick={() => run(() => actions.confirm.mutateAsync())}
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                disabled={actions.cancel.isPending}
                onClick={() => run(() => actions.cancel.mutateAsync())}
              >
                Cancel
              </Button>
              <Button
                disabled={actions.convertToJob.isPending}
                onClick={() =>
                  run(async () => {
                    const raw = await actions.convertToJob.mutateAsync({});
                    const job = normalizeJob(raw);
                    if (job?.id) {
                      navigate(jobDetailPath({ id: job.id, job_type: (job.job_type ?? 'NVOCC_EXPORT') as JobType }));
                      return;
                    }
                    if (booking.job_id) {
                      navigate(jobDetailPath({ id: booking.job_id, job_type: (booking.job_type ?? 'NVOCC_EXPORT') as JobType }));
                    }
                  })
                }
              >
                Convert to job
              </Button>
            </div>
          </div>

          <dl className="grid gap-4 rounded-md border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Voyage" value={booking.voyage_id} />
            <Field label="Enquiry" value={booking.enquiry_id} />
            <Field label="Cargo type" value={booking.cargo_type} />
            <Field label="HBL" value={booking.hbl_number} />
            <Field label="Job" value={booking.job_number ?? booking.job_id} />
            <Field label="Shipper" value={booking.shipper_id} />
            <Field label="Consignee" value={booking.consignee_id} />
            <Field label="Containers" value={booking.container_count} />
            <Field label="CBM allocated" value={booking.cbm_allocated} />
            <Field label="Gross weight" value={booking.gross_weight} />
            <Field label="Commodity" value={booking.commodity} />
            <Field label="Incoterms" value={booking.incoterms} />
            <Field label="Freight terms" value={booking.freight_terms} />
            <Field label="Shipper ref" value={booking.shipper_ref} />
          </dl>
        </>
      )}
    </div>
  );
}
