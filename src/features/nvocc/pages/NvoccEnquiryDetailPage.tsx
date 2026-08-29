import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { TextInput } from '@/components/widgets/FilterField';
import { NvoccFormField } from '@/features/nvocc/components/NvoccFormField';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import { useNvoccEnquiry, useNvoccEnquiryActions } from '@/features/nvocc/hooks/useNvocc';
import {
  markNvoccEnquiryLostFormSchema,
  sendNvoccRateFormSchema,
} from '@/features/nvocc/schemas/nvocc.schema';
import { formatNvoccDate, nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { useInlineValidation } from '@/lib/validation';

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

  const [showRateForm, setShowRateForm] = useState(false);
  const [showLostForm, setShowLostForm] = useState(false);
  const [rateForm, setRateForm] = useState({ to_email: '', cc_email: '', subject: '', message: '' });
  const [lossReason, setLossReason] = useState('');
  const rateValidation = useInlineValidation();
  const lostValidation = useInlineValidation();

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
              <Button variant="secondary" onClick={() => { setShowRateForm((v) => !v); setShowLostForm(false); }}>
                Send rate
              </Button>
              <Button variant="secondary" onClick={() => { setShowLostForm((v) => !v); setShowRateForm(false); }}>
                Mark lost
              </Button>
            </div>
          </div>

          {showRateForm && (
            <form
              className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
              onSubmit={async (e) => {
                e.preventDefault();
                rateValidation.clearErrors();
                await rateValidation.runValidated(sendNvoccRateFormSchema, rateForm, async (parsed) => {
                  await actions.sendRate.mutateAsync(parsed);
                  setShowRateForm(false);
                });
              }}
            >
              <h2 className="text-sm font-semibold text-gray-800">Send rate email</h2>
              <NvoccFormField label="To email" required error={rateValidation.fieldError('to_email')}>
                <TextInput value={rateForm.to_email} onChange={(e) => setRateForm((p) => ({ ...p, to_email: e.target.value }))} placeholder="customer@example.com" />
              </NvoccFormField>
              <NvoccFormField label="CC email" error={rateValidation.fieldError('cc_email')}>
                <TextInput value={rateForm.cc_email} onChange={(e) => setRateForm((p) => ({ ...p, cc_email: e.target.value }))} />
              </NvoccFormField>
              <NvoccFormField label="Subject" error={rateValidation.fieldError('subject')}>
                <TextInput value={rateForm.subject} onChange={(e) => setRateForm((p) => ({ ...p, subject: e.target.value }))} />
              </NvoccFormField>
              <NvoccFormField label="Message" error={rateValidation.fieldError('message')}>
                <TextInput value={rateForm.message} onChange={(e) => setRateForm((p) => ({ ...p, message: e.target.value }))} />
              </NvoccFormField>
              <FieldError message={rateValidation.formError} />
              <Button type="submit" disabled={actions.sendRate.isPending}>Send</Button>
            </form>
          )}

          {showLostForm && (
            <form
              className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
              onSubmit={async (e) => {
                e.preventDefault();
                lostValidation.clearErrors();
                await lostValidation.runValidated(markNvoccEnquiryLostFormSchema, { loss_reason: lossReason }, async (parsed) => {
                  await actions.markLost.mutateAsync(parsed);
                  setShowLostForm(false);
                });
              }}
            >
              <h2 className="text-sm font-semibold text-gray-800">Mark enquiry lost</h2>
              <NvoccFormField label="Loss reason" required error={lostValidation.fieldError('loss_reason')}>
                <TextInput value={lossReason} onChange={(e) => setLossReason(e.target.value)} placeholder="e.g. Price too high" />
              </NvoccFormField>
              <FieldError message={lostValidation.formError} />
              <Button type="submit" variant="secondary" disabled={actions.markLost.isPending}>Mark lost</Button>
            </form>
          )}

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
