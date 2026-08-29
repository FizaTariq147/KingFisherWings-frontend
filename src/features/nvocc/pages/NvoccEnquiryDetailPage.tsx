import { useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import { useNvoccEnquiry, useNvoccEnquiryActions } from '@/features/nvocc/hooks/useNvocc';
import { formatNvoccDate, nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function NvoccEnquiryDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useNvoccEnquiry(id);
  const actions = useNvoccEnquiryActions(id);
  const enquiry = query.data;

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (error) {
      window.alert(extractAxiosErrorDetail(error));
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/nvocc/enquiry-list" label="Back to enquiries" />
      <NvoccListState loading={query.isLoading} error={query.isError ? query.error : undefined} />
      {enquiry && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-gray-200 bg-white p-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{nvoccDisplayNumber(enquiry, 'Enquiry')}</h1>
              <div className="mt-2">
                <NvoccStatusBadge status={enquiry.enquiry_status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={actions.convertToBooking.isPending}
                onClick={() =>
                  run(async () => {
                    const booking = await actions.convertToBooking.mutateAsync();
                    navigate(`/nvocc/bookings/${booking.id}`);
                  })
                }
              >
                Convert to booking
              </Button>
              <Button
                variant="secondary"
                disabled={actions.sendRate.isPending}
                onClick={() => {
                  const to_email = window.prompt('Send rate to email:');
                  if (!to_email) return;
                  run(() => actions.sendRate.mutateAsync({ to_email }));
                }}
              >
                Send rate
              </Button>
              <Button
                variant="secondary"
                disabled={actions.markLost.isPending}
                onClick={() => {
                  const loss_reason = window.prompt('Loss reason:');
                  if (!loss_reason) return;
                  run(() => actions.markLost.mutateAsync({ loss_reason }));
                }}
              >
                Mark lost
              </Button>
            </div>
          </div>

          <dl className="grid gap-4 rounded-md border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Customer" value={enquiry.customer_name ?? enquiry.customer_id} />
            <Field label="Voyage" value={enquiry.voyage_id} />
            <Field label="Cargo type" value={enquiry.cargo_type} />
            <Field label="Containers" value={enquiry.container_count} />
            <Field label="CBM" value={enquiry.cbm} />
            <Field label="Gross weight" value={enquiry.gross_weight} />
            <Field label="Pieces" value={enquiry.pieces} />
            <Field label="Commodity" value={enquiry.commodity} />
            <Field label="HS code" value={enquiry.hs_code} />
            <Field label="Incoterms" value={enquiry.incoterms} />
            <Field label="Freight terms" value={enquiry.freight_terms} />
            <Field label="Rate quoted" value={enquiry.rate_quoted} />
            <Field label="Rate validity" value={formatNvoccDate(enquiry.rate_validity)} />
            <Field label="Follow up" value={formatNvoccDate(enquiry.follow_up_date)} />
          </dl>
        </>
      )}
    </div>
  );
}
