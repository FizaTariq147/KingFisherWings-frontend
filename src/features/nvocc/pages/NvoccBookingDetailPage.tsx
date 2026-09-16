import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import {
  useNvoccBooking,
  useNvoccBookingActions,
  useNvoccBookingForm,
  useUpdateNvoccBookingForm,
} from '@/features/nvocc/hooks/useNvocc';
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
  const bookingFormQuery = useNvoccBookingForm(id, Boolean(query.data));
  const updateBookingForm = useUpdateNvoccBookingForm(id);
  const booking = query.data;

  const [workflowMsg, setWorkflowMsg] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    shipper_ref: '',
    commodity: '',
    marks_numbers: '',
    container_type_id: '',
    container_count: '',
    cbm_allocated: '',
    gross_weight: '',
    pieces: '',
    incoterms: '',
    freight_terms: '',
    other_charges_terms: '',
    hs_code: '',
    notes: '',
  });

  useEffect(() => {
    const form = bookingFormQuery.data;
    if (!form) return;
    setFormState({
      shipper_ref: String(form.shipper_ref ?? ''),
      commodity: String(form.commodity ?? ''),
      marks_numbers: String(form.marks_numbers ?? ''),
      container_type_id: String(form.container_type_id ?? ''),
      container_count: form.container_count != null ? String(form.container_count) : '',
      cbm_allocated: form.cbm_allocated != null ? String(form.cbm_allocated) : '',
      gross_weight: form.gross_weight != null ? String(form.gross_weight) : '',
      pieces: form.pieces != null ? String(form.pieces) : '',
      incoterms: String(form.incoterms ?? ''),
      freight_terms: String(form.freight_terms ?? ''),
      other_charges_terms: String(form.other_charges_terms ?? ''),
      hs_code: String(form.hs_code ?? ''),
      notes: String(form.notes ?? ''),
    });
  }, [bookingFormQuery.data]);

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    setWorkflowError(null);
    setWorkflowMsg(null);
    try {
      await fn();
      if (success) setWorkflowMsg(success);
    } catch (error) {
      const detail = extractAxiosErrorDetail(error);
      setWorkflowError(detail);
      window.alert(detail);
    }
  };

  const saveBookingForm = () =>
    run(async () => {
      const dto: Record<string, unknown> = {
        shipper_ref: formState.shipper_ref.trim() || undefined,
        commodity: formState.commodity.trim() || undefined,
        marks_numbers: formState.marks_numbers.trim() || undefined,
        container_type_id: formState.container_type_id.trim() || undefined,
        incoterms: formState.incoterms.trim() || undefined,
        freight_terms: formState.freight_terms.trim() || undefined,
        other_charges_terms: formState.other_charges_terms.trim() || undefined,
        hs_code: formState.hs_code.trim() || undefined,
        notes: formState.notes.trim() || undefined,
      };
      if (formState.container_count.trim()) dto.container_count = Number(formState.container_count);
      if (formState.cbm_allocated.trim()) dto.cbm_allocated = Number(formState.cbm_allocated);
      if (formState.gross_weight.trim()) dto.gross_weight = Number(formState.gross_weight);
      if (formState.pieces.trim()) dto.pieces = Number(formState.pieces);
      await updateBookingForm.mutateAsync(dto);
    }, 'Booking form saved.');

  const jobHref =
    booking?.job_id != null
      ? jobDetailPath({
          id: booking.job_id,
          job_type: (booking.job_type ?? 'NVOCC_EXPORT') as JobType,
        })
      : null;

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
              {jobHref ? (
                <Link
                  to={jobHref}
                  className="mt-2 inline-block text-sm text-[var(--color-primary-600)] underline"
                >
                  Open linked job
                </Link>
              ) : null}
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
                      navigate(
                        jobDetailPath({
                          id: job.id,
                          job_type: (job.job_type ?? 'NVOCC_EXPORT') as JobType,
                        }),
                      );
                      return;
                    }
                    if (booking.job_id) {
                      navigate(
                        jobDetailPath({
                          id: booking.job_id,
                          job_type: (booking.job_type ?? 'NVOCC_EXPORT') as JobType,
                        }),
                      );
                    }
                  })
                }
              >
                Convert to job
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sea export workflow</CardTitle>
            </CardHeader>
            <div className="space-y-3 px-4 pb-4">
              <p className="text-sm text-gray-500">
                CS triage → mark quote sent → booking form → send invoice. Convert to job when ready
                for CRO / ops.
              </p>
              {workflowError ? (
                <p className="text-sm text-[var(--color-danger-600)]">{workflowError}</p>
              ) : null}
              {workflowMsg ? (
                <p className="text-sm text-[var(--color-success-700)]">{workflowMsg}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={actions.csTriage.isPending}
                  onClick={() =>
                    run(() => actions.csTriage.mutateAsync({}), 'CS triage recorded — portal access granted.')
                  }
                >
                  CS triage
                </Button>
                <Button
                  variant="secondary"
                  disabled={actions.markQuoteSent.isPending}
                  onClick={() =>
                    run(() => actions.markQuoteSent.mutateAsync({}), 'Quote marked as sent.')
                  }
                >
                  Mark quote sent
                </Button>
                <Button
                  variant="secondary"
                  disabled={actions.sendInvoice.isPending}
                  onClick={() => run(() => actions.sendInvoice.mutateAsync({}), 'Invoice sent.')}
                >
                  Send invoice
                </Button>
                <Button
                  variant="secondary"
                  disabled={bookingFormQuery.isFetching}
                  onClick={() => void bookingFormQuery.refetch()}
                >
                  Reload booking form
                </Button>
              </div>

              {bookingFormQuery.isError ? (
                <p className="text-sm text-[var(--color-danger-600)]">
                  {extractAxiosErrorDetail(bookingFormQuery.error)}
                </p>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ['shipper_ref', 'Shipper ref'],
                    ['commodity', 'Commodity'],
                    ['marks_numbers', 'Marks & numbers'],
                    ['container_type_id', 'Container type ID'],
                    ['container_count', 'Container count'],
                    ['cbm_allocated', 'CBM allocated'],
                    ['gross_weight', 'Gross weight'],
                    ['pieces', 'Pieces'],
                    ['incoterms', 'Incoterms'],
                    ['freight_terms', 'Freight terms'],
                    ['other_charges_terms', 'Other charges terms'],
                    ['hs_code', 'HS code'],
                    ['notes', 'Notes'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-xs font-medium text-gray-600">
                    {label}
                    <Input
                      className="mt-1"
                      value={formState[key]}
                      onChange={(e) => setFormState((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </label>
                ))}
              </div>
              <Button
                disabled={updateBookingForm.isPending || bookingFormQuery.isLoading}
                onClick={() => void saveBookingForm()}
              >
                Save booking form
              </Button>
            </div>
          </Card>

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
