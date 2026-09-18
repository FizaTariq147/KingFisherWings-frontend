import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import { NvoccSeaExportFlowRail } from '@/features/nvocc/components/NvoccSeaExportFlowRail';
import {
  SEA_EXPORT_BOOKING_ACTION_ORDER,
  type SeaExportStageId,
} from '@/features/nvocc/constants/seaExportWorkflow';
import {
  useNvoccBooking,
  useNvoccBookingActions,
  useNvoccBookingForm,
  useUpdateNvoccBookingForm,
} from '@/features/nvocc/hooks/useNvocc';
import { useCustomerPortalBookingForm } from '@/features/portal-admin-inbox/hooks/usePortalAdminInbox';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import {
  firstOpenStage,
  useSeaExportProgress,
} from '@/features/nvocc/hooks/useSeaExportProgress';
import { nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { normalizeJob } from '@/features/jobs/utils/normalizeJob';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import type { JobType } from '@/features/jobs/constants/job.constants';
import type {
  NvoccBookingFormParty,
  UpdateNvoccBookingFormDto,
} from '@/features/nvocc/types/nvocc.types';

type BookingFormUiState = {
  pol: string;
  pod: string;
  commodity: string;
  hs_code: string;
  voyage_ref: string;
  client_booking_no: string;
  gross_weight_kg: string;
  net_weight_kg: string;
  teu_count: string;
  date_of_request: string;
  booking_agent_line: string;
  agent_requester_name: string;
  sq_bl_booking_reference: string;
  final_use: string;
  activity_sector: string;
  insurance_details: string;
  lc_bank_details: string;
  request_details: string;
  is_dg: boolean;
  shipper_owned_container: boolean;
  attach_commercial_invoice: boolean;
  attach_correspondence: boolean;
  attach_cod_form: boolean;
  attach_licence: boolean;
  consent_accepted: boolean;
  mark_complete: boolean;
  shipper_name: string;
  shipper_address: string;
  shipper_city: string;
  shipper_country: string;
  consignee_name: string;
  consignee_address: string;
  consignee_city: string;
  consignee_country: string;
  notify_name: string;
};

function emptyBookingFormUi(): BookingFormUiState {
  return {
    pol: '',
    pod: '',
    commodity: '',
    hs_code: '',
    voyage_ref: '',
    client_booking_no: '',
    gross_weight_kg: '',
    net_weight_kg: '',
    teu_count: '',
    date_of_request: new Date().toISOString().slice(0, 10),
    booking_agent_line: 'KINGFISHER',
    agent_requester_name: '',
    sq_bl_booking_reference: '',
    final_use: '',
    activity_sector: '',
    insurance_details: '',
    lc_bank_details: '',
    request_details: '',
    is_dg: false,
    shipper_owned_container: false,
    attach_commercial_invoice: false,
    attach_correspondence: false,
    attach_cod_form: false,
    attach_licence: false,
    consent_accepted: false,
    mark_complete: false,
    shipper_name: '',
    shipper_address: '',
    shipper_city: '',
    shipper_country: '',
    consignee_name: '',
    consignee_address: '',
    consignee_city: '',
    consignee_country: '',
    notify_name: '',
  };
}

function applyPortalPayloadToNvoccForm(
  prev: BookingFormUiState,
  payload: PortalBookingFormMessagePayload,
  opts?: { overwrite?: boolean },
): BookingFormUiState {
  const overwrite = Boolean(opts?.overwrite);
  const pick = (current: string, next?: string) => {
    const n = (next ?? '').trim();
    if (!n) return current;
    if (overwrite || !current.trim()) return n;
    return current;
  };
  const pickNum = (current: string, next?: number) => {
    if (next == null || !Number.isFinite(next)) return current;
    if (overwrite || !current.trim()) return String(next);
    return current;
  };
  const parties = payload.parties ?? [];
  const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
  const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
  const notify = parties.find((p) => p.party_kind === 'NOTIFY');
  return {
    ...prev,
    pol: pick(prev.pol, payload.pol),
    pod: pick(prev.pod, payload.pod),
    commodity: pick(prev.commodity, payload.commodity),
    hs_code: pick(prev.hs_code, payload.hs_code),
    voyage_ref: pick(prev.voyage_ref, payload.voyage_ref),
    client_booking_no: pick(prev.client_booking_no, payload.client_booking_no),
    date_of_request: pick(prev.date_of_request, payload.date_of_request?.slice(0, 10)),
    gross_weight_kg: pickNum(prev.gross_weight_kg, payload.gross_weight_kg),
    net_weight_kg: pickNum(prev.net_weight_kg, payload.net_weight_kg),
    teu_count: pickNum(prev.teu_count, payload.teu_count),
    final_use: pick(prev.final_use, payload.final_use),
    activity_sector: pick(prev.activity_sector, payload.activity_sector),
    insurance_details: pick(prev.insurance_details, payload.insurance_details),
    lc_bank_details: pick(prev.lc_bank_details, payload.lc_bank_details),
    request_details: pick(prev.request_details, payload.request_details),
    booking_agent_line: pick(prev.booking_agent_line, payload.booking_agent_line),
    agent_requester_name: pick(prev.agent_requester_name, payload.agent_requester_name),
    sq_bl_booking_reference: pick(prev.sq_bl_booking_reference, payload.sq_bl_booking_reference),
    is_dg: overwrite ? Boolean(payload.is_dg) : prev.is_dg || Boolean(payload.is_dg),
    shipper_owned_container: overwrite
      ? Boolean(payload.shipper_owned_container)
      : prev.shipper_owned_container || Boolean(payload.shipper_owned_container),
    attach_commercial_invoice: Boolean(
      overwrite ? payload.attach_commercial_invoice : prev.attach_commercial_invoice || payload.attach_commercial_invoice,
    ),
    attach_correspondence: Boolean(
      overwrite ? payload.attach_correspondence : prev.attach_correspondence || payload.attach_correspondence,
    ),
    attach_cod_form: Boolean(
      overwrite ? payload.attach_cod_form : prev.attach_cod_form || payload.attach_cod_form,
    ),
    attach_licence: Boolean(
      overwrite ? payload.attach_licence : prev.attach_licence || payload.attach_licence,
    ),
    consent_accepted: Boolean(
      overwrite ? payload.consent_accepted : prev.consent_accepted || payload.consent_accepted,
    ),
    shipper_name: pick(prev.shipper_name, shipper?.full_name),
    shipper_address: pick(prev.shipper_address, shipper?.address),
    shipper_city: pick(prev.shipper_city, shipper?.city),
    shipper_country: pick(prev.shipper_country, shipper?.country),
    consignee_name: pick(prev.consignee_name, consignee?.full_name),
    consignee_address: pick(prev.consignee_address, consignee?.address),
    consignee_city: pick(prev.consignee_city, consignee?.city),
    consignee_country: pick(prev.consignee_country, consignee?.country),
    notify_name: pick(prev.notify_name, notify?.full_name),
  };
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

function gateStatusToken(status?: string | null): string {
  return String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function isAtOrPastBookingFormComplete(status?: string | null): boolean {
  const s = gateStatusToken(status);
  if (!s) return false;
  return (
    s === 'BOOKING_FORM_COMPLETE' ||
    s.includes('BOOKING_FORM_COMPLETE') ||
    isAtOrPastInvoiceSent(s)
  );
}

function isAtOrPastInvoiceSent(status?: string | null): boolean {
  const s = gateStatusToken(status);
  if (!s) return false;
  return s === 'INVOICE_SENT' || s.includes('INVOICE_SENT');
}

function isNotForwardStageError(error: unknown): boolean {
  const detail = extractAxiosErrorDetail(error).toLowerCase();
  return (
    detail.includes('not forward') ||
    detail.includes('cannot move from') ||
    detail.includes('already at invoice_sent') ||
    detail.includes('already invoice_sent')
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
  const { done, markDone, isDone } = useSeaExportProgress(id ? `booking:${id}` : '');
  const portalBookingQuery = useCustomerPortalBookingForm(
    {
      jobId: booking?.job_id,
      jobTypePrefix: 'NVOCC',
    },
    Boolean(booking),
  );

  const [workflowMsg, setWorkflowMsg] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [formState, setFormState] = useState<BookingFormUiState>(emptyBookingFormUi);
  const [portalPrefillApplied, setPortalPrefillApplied] = useState(false);

  useEffect(() => {
    const form = bookingFormQuery.data;
    if (!form && !booking) return;
    // Only advance past booking-form when API mark_complete is true (not mere draft save).
    if (form?.mark_complete === true) markDone('booking-form');
    const parties = form?.parties ?? [];
    const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
    const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
    const notify = parties.find((p) => p.party_kind === 'NOTIFY');
    setFormState({
      pol: String(form?.pol ?? ''),
      pod: String(form?.pod ?? ''),
      commodity: String(form?.commodity ?? booking?.commodity ?? ''),
      hs_code: String(form?.hs_code ?? booking?.hs_code ?? ''),
      voyage_ref: String(form?.voyage_ref ?? booking?.voyage_id ?? ''),
      client_booking_no: String(form?.client_booking_no ?? ''),
      gross_weight_kg:
        form?.gross_weight_kg != null
          ? String(form.gross_weight_kg)
          : booking?.gross_weight != null
            ? String(booking.gross_weight)
            : '',
      net_weight_kg: form?.net_weight_kg != null ? String(form.net_weight_kg) : '',
      teu_count: form?.teu_count != null ? String(form.teu_count) : '',
      date_of_request:
        String(form?.date_of_request ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10),
      booking_agent_line: String(form?.booking_agent_line ?? 'KINGFISHER'),
      agent_requester_name: String(form?.agent_requester_name ?? ''),
      sq_bl_booking_reference: String(form?.sq_bl_booking_reference ?? ''),
      final_use: String(form?.final_use ?? ''),
      activity_sector: String(form?.activity_sector ?? ''),
      insurance_details: String(form?.insurance_details ?? ''),
      lc_bank_details: String(form?.lc_bank_details ?? ''),
      request_details: String(form?.request_details ?? ''),
      is_dg: Boolean(form?.is_dg ?? booking?.is_dg),
      shipper_owned_container: Boolean(form?.shipper_owned_container),
      attach_commercial_invoice: Boolean(form?.attach_commercial_invoice),
      attach_correspondence: Boolean(form?.attach_correspondence),
      attach_cod_form: Boolean(form?.attach_cod_form),
      attach_licence: Boolean(form?.attach_licence),
      consent_accepted: Boolean(form?.consent_accepted),
      mark_complete: form?.mark_complete === true,
      shipper_name: String(shipper?.full_name ?? ''),
      shipper_address: String(shipper?.address ?? ''),
      shipper_city: String(shipper?.city ?? ''),
      shipper_country: String(shipper?.country ?? ''),
      consignee_name: String(consignee?.full_name ?? ''),
      consignee_address: String(consignee?.address ?? ''),
      consignee_city: String(consignee?.city ?? ''),
      consignee_country: String(consignee?.country ?? ''),
      notify_name: String(notify?.full_name ?? ''),
    });
    setPortalPrefillApplied(false);
  }, [bookingFormQuery.data, booking, markDone]);

  useEffect(() => {
    const payload = portalBookingQuery.data;
    if (!payload || portalPrefillApplied) return;
    const form = bookingFormQuery.data;
    const apiHasParties = Boolean(form?.parties?.some((p) => p.full_name?.trim()));
    const apiHasRoute = Boolean(String(form?.pol ?? '').trim() || String(form?.pod ?? '').trim());
    if (apiHasParties || apiHasRoute) {
      setPortalPrefillApplied(true);
      return;
    }
    setFormState((prev) => applyPortalPayloadToNvoccForm(prev, payload, { overwrite: false }));
    setPortalPrefillApplied(true);
    setWorkflowMsg(
      `Customer portal booking loaded (quote ${payload.quoteNumber || payload.quotationId.slice(0, 8)}). Review and complete Ops fields.`,
    );
  }, [portalBookingQuery.data, portalPrefillApplied, bookingFormQuery.data]);

  useEffect(() => {
    if (booking?.job_id) markDone('cro-container');
  }, [booking?.job_id, markDone]);

  useEffect(() => {
    if (isAtOrPastBookingFormComplete(booking?.booking_status)) markDone('booking-form');
    if (isAtOrPastInvoiceSent(booking?.booking_status)) markDone('invoice');
  }, [booking?.booking_status, markDone]);

  const derived = useMemo(() => {
    const map: Partial<Record<SeaExportStageId, boolean>> = { ...done };
    map['customer-request'] = true;
    const status = booking?.booking_status;
    const formComplete =
      bookingFormQuery.data?.mark_complete === true ||
      Boolean(done.invoice) ||
      isAtOrPastBookingFormComplete(status);
    // Keep booking-form open after draft-only saves, but never regress past invoice.
    map['booking-form'] = formComplete;
    if (isAtOrPastInvoiceSent(status)) map.invoice = true;
    if (booking?.job_id) map['cro-container'] = true;
    return map;
  }, [done, bookingFormQuery.data?.mark_complete, booking?.job_id, booking?.booking_status]);

  const currentStage = firstOpenStage(SEA_EXPORT_BOOKING_ACTION_ORDER, isDone, derived);

  const run = async (
    fn: () => Promise<unknown>,
    success?: string,
    complete?: SeaExportStageId,
  ) => {
    setWorkflowError(null);
    setWorkflowMsg(null);
    try {
      await fn();
      if (complete) markDone(complete);
      if (success) setWorkflowMsg(success);
    } catch (error) {
      const detail = extractAxiosErrorDetail(error);
      setWorkflowError(detail);
      window.alert(detail);
    }
  };

  const buildBookingFormDto = (opts: {
    markComplete: boolean;
    adminOverride?: boolean;
    overrideReason?: string;
  }): UpdateNvoccBookingFormDto => {
    const pol = formState.pol.trim();
    const pod = formState.pod.trim();
    const commodity = formState.commodity.trim();
    const shipperName = formState.shipper_name.trim();
    const shipperAddress = formState.shipper_address.trim();
    const consigneeName = formState.consignee_name.trim();
    const consigneeAddress = formState.consignee_address.trim();
    if (!pol || !pod || !commodity) {
      throw new Error('POL, POD, and commodity are required.');
    }
    if (!shipperName || !shipperAddress) {
      throw new Error('SHIPPER requires full name and address.');
    }
    if (!consigneeName || !consigneeAddress) {
      throw new Error('CONSIGNEE requires full name and address.');
    }
    const parties: NvoccBookingFormParty[] = [
      {
        party_kind: 'SHIPPER',
        full_name: shipperName,
        address: shipperAddress,
        city: formState.shipper_city.trim() || undefined,
        country: formState.shipper_country.trim() || undefined,
        entity_kind: 'COMPANY',
      },
      {
        party_kind: 'CONSIGNEE',
        full_name: consigneeName,
        address: consigneeAddress,
        city: formState.consignee_city.trim() || undefined,
        country: formState.consignee_country.trim() || undefined,
        entity_kind: 'COMPANY',
      },
      {
        party_kind: 'NOTIFY',
        full_name: formState.notify_name.trim() || consigneeName || 'Same as consignee',
        address: consigneeAddress,
        city: formState.consignee_city.trim() || undefined,
        country: formState.consignee_country.trim() || undefined,
        entity_kind: 'COMPANY',
      },
    ];
    const dto: UpdateNvoccBookingFormDto = {
      pol,
      pod,
      commodity,
      parties,
      mark_complete: opts.markComplete,
      is_dg: formState.is_dg,
      shipper_owned_container: formState.shipper_owned_container,
      date_of_request: formState.date_of_request.trim() || undefined,
      voyage_ref: formState.voyage_ref.trim() || undefined,
      client_booking_no: formState.client_booking_no.trim() || undefined,
      hs_code: formState.hs_code.trim() || undefined,
      booking_agent_line: formState.booking_agent_line.trim() || undefined,
      agent_requester_name: formState.agent_requester_name.trim() || undefined,
      sq_bl_booking_reference: formState.sq_bl_booking_reference.trim() || undefined,
      final_use: formState.final_use.trim() || undefined,
      activity_sector: formState.activity_sector.trim() || undefined,
      insurance_details: formState.insurance_details.trim() || undefined,
      lc_bank_details: formState.lc_bank_details.trim() || undefined,
      request_details: formState.request_details.trim() || undefined,
      attach_commercial_invoice: formState.attach_commercial_invoice,
      attach_correspondence: formState.attach_correspondence,
      attach_cod_form: formState.attach_cod_form,
      attach_licence: formState.attach_licence,
      consent_accepted: formState.consent_accepted,
    };
    if (formState.gross_weight_kg.trim()) {
      dto.gross_weight_kg = Number(formState.gross_weight_kg);
    }
    if (formState.net_weight_kg.trim()) {
      dto.net_weight_kg = Number(formState.net_weight_kg);
    }
    if (formState.teu_count.trim()) {
      dto.teu_count = Number(formState.teu_count);
    }
    if (opts.adminOverride) {
      dto.admin_override = true;
      dto.stage_override_reason =
        opts.overrideReason ||
        'Customer accepted quotation; completing booking form after QUOTE_SENT.';
    }
    return dto;
  };

  const saveBookingForm = () =>
    run(
      async () => {
        const alreadyFormComplete =
          bookingFormQuery.data?.mark_complete === true ||
          isAtOrPastBookingFormComplete(booking?.booking_status);
        const alreadyInvoiceSent = isAtOrPastInvoiceSent(booking?.booking_status);

        // Persist field edits without stage regression (never re-send mark_complete when past).
        await updateBookingForm.mutateAsync(buildBookingFormDto({ markComplete: false }));
        markDone('customer-accept');

        if (!formState.mark_complete) {
          return;
        }

        if (!alreadyFormComplete) {
          try {
            // Compliance complete is owned by the customer portal (/submit). Staff mark_complete
            // requires admin_override (backend 403 otherwise).
            await updateBookingForm.mutateAsync(
              buildBookingFormDto({
                markComplete: true,
                adminOverride: true,
                overrideReason:
                  'Admin assist: customer portal owns compliance complete; marking booking form complete after review.',
              }),
            );
          } catch (error) {
            // Already at INVOICE_SENT (or later) — cannot move back to BOOKING_FORM_COMPLETE.
            if (!isNotForwardStageError(error)) throw error;
          }
        }
        markDone('booking-form');

        if (!alreadyInvoiceSent) {
          try {
            // Next gate: INVOICE_SENT — POST /nvocc/bookings/:id/send-invoice (creates invoice).
            await actions.sendInvoice.mutateAsync({});
          } catch (error) {
            if (!isNotForwardStageError(error)) throw error;
          }
        }
        markDone('invoice');
      },
      formState.mark_complete
        ? isAtOrPastInvoiceSent(booking?.booking_status)
          ? 'Booking already at INVOICE_SENT — form fields saved.'
          : 'Booking form complete — invoice generated (INVOICE_SENT).'
        : 'Booking form draft saved. Check “Mark complete” and save again to generate invoice.',
      formState.mark_complete ? 'invoice' : undefined,
    );

  const sendBookingInvoice = () =>
    run(
      async () => {
        await actions.sendInvoice.mutateAsync({});
        markDone('invoice');
      },
      'Invoice sent — next: convert to job for CRO / container.',
      'invoice',
    );

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
                  Open linked job (Stage 3–4)
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={
                  actions.confirm.isPending ||
                  Boolean(
                    booking.booking_status &&
                      !['DRAFT', 'NEW', 'PENDING'].includes(
                        String(booking.booking_status).toUpperCase().replace(/[\s-]+/g, '_'),
                      ),
                  )
                }
                title={
                  booking.booking_status &&
                  !['DRAFT', 'NEW', 'PENDING'].includes(
                    String(booking.booking_status).toUpperCase().replace(/[\s-]+/g, '_'),
                  )
                    ? 'Only draft bookings can be confirmed'
                    : undefined
                }
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
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stage 1–2 · Quotation & booking</CardTitle>
            </CardHeader>
            <div className="space-y-4 px-4 pb-4">
              <NvoccSeaExportFlowRail current={currentStage} done={derived} band="1-2" />
              <p className="text-sm text-gray-500">
                UI advances one step at a time. Complete the highlighted stage, then the next
                panel unlocks.
              </p>
              {workflowError ? (
                <p className="text-sm text-[var(--color-danger-600)]">{workflowError}</p>
              ) : null}
              {workflowMsg ? (
                <p className="text-sm text-[var(--color-success-700)]">{workflowMsg}</p>
              ) : null}

              {currentStage === 'cs-receive' ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-amber-900">Now: Admin receives request (CS)</p>
                  <p className="text-xs text-amber-800">Grants customer portal access.</p>
                  <Button
                    disabled={actions.csTriage.isPending}
                    onClick={() =>
                      run(
                        () => actions.csTriage.mutateAsync({}),
                        'Portal access granted — next: send quote.',
                        'cs-receive',
                      )
                    }
                  >
                    CS triage
                  </Button>
                </div>
              ) : null}

              {currentStage === 'customer-accept' ? (
                <div className="rounded-md border border-sky-200 bg-sky-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-sky-900">Now: Customer accepts</p>
                  <p className="text-xs text-sky-800">
                    Confirm the linked quotation is <strong>Approved</strong> (portal accept / Mark
                    approved). Approve does <strong>not</strong> create a job — next Ops records the
                    booking form.
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      markDone('customer-accept');
                      setWorkflowMsg('Customer accept recorded — complete Ops booking form next.');
                    }}
                  >
                    Customer accepted — continue
                  </Button>
                </div>
              ) : null}

              {currentStage === 'quote-sent' ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-amber-900">Now: Admin sends quote (Sales)</p>
                  <p className="text-xs text-amber-800">
                    After this: customer accepts → Ops booking form → send invoice → convert/CRO.
                  </p>
                  <Button
                    disabled={actions.markQuoteSent.isPending}
                    onClick={() =>
                      run(
                        () => actions.markQuoteSent.mutateAsync({}),
                        'Quote sent — next: customer accept, then Ops booking form.',
                        'quote-sent',
                      )
                    }
                  >
                    Mark quote sent
                  </Button>
                </div>
              ) : null}

              {currentStage === 'booking-form' ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-emerald-900">
                    Now: Booking form (Ops — admin / sales)
                  </p>
                  <p className="text-xs text-emerald-800">
                    Customer fills and submits the compliance form in the portal. Load that draft
                    here to review / correct Ops fields. <strong>Mark complete</strong> uses an
                    admin override (portal owns normal completion), then send-invoice.
                  </p>
                  {portalBookingQuery.data ? (
                    <p className="text-xs text-emerald-900">
                      Portal submission found for quote{' '}
                      <strong>
                        {portalBookingQuery.data.quoteNumber ||
                          portalBookingQuery.data.quotationId.slice(0, 8)}
                      </strong>
                      .
                    </p>
                  ) : portalBookingQuery.isFetched ? (
                    <p className="text-xs text-amber-800">
                      No customer portal booking form found yet in Portal Admin inbox.
                    </p>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {(
                      [
                        ['date_of_request', 'Date of request'],
                        ['client_booking_no', 'Booking no (client)'],
                        ['teu_count', 'TEU count *'],
                        ['pol', 'POL *'],
                        ['pod', 'POD *'],
                        ['gross_weight_kg', 'Gross weight (kg) *'],
                        ['net_weight_kg', 'Net weight (kg)'],
                        ['commodity', 'Commodity *'],
                        ['hs_code', 'HS code'],
                        ['voyage_ref', 'Voyage ref'],
                        ['booking_agent_line', 'Booking agent line'],
                        ['agent_requester_name', 'Agent requester'],
                        ['sq_bl_booking_reference', 'SQ/BL booking ref'],
                        ['final_use', 'Final use'],
                        ['activity_sector', 'Activity sector'],
                        ['shipper_name', 'Shipper name *'],
                        ['shipper_city', 'Shipper city'],
                        ['shipper_country', 'Shipper country'],
                        ['consignee_name', 'Consignee name *'],
                        ['consignee_city', 'Consignee city'],
                        ['consignee_country', 'Consignee country'],
                        ['notify_name', 'Notify name * (required)'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="block text-xs font-medium text-gray-600">
                        {label}
                        <Input
                          className="mt-1"
                          type={key === 'date_of_request' ? 'date' : 'text'}
                          value={formState[key]}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                        />
                      </label>
                    ))}
                    <label className="block text-xs font-medium text-gray-600 sm:col-span-2">
                      Shipper address *
                      <Input
                        className="mt-1"
                        value={formState.shipper_address}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, shipper_address: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block text-xs font-medium text-gray-600 sm:col-span-2">
                      Consignee address *
                      <Input
                        className="mt-1"
                        value={formState.consignee_address}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, consignee_address: e.target.value }))
                        }
                      />
                    </label>
                    <label className="block text-xs font-medium text-gray-600 sm:col-span-2 lg:col-span-3">
                      Request details
                      <Input
                        className="mt-1"
                        value={formState.request_details}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, request_details: e.target.value }))
                        }
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.is_dg}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, is_dg: e.target.checked }))
                        }
                      />
                      Dangerous goods
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.shipper_owned_container}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            shipper_owned_container: e.target.checked,
                          }))
                        }
                      />
                      Shipper-owned container
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.mark_complete}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, mark_complete: e.target.checked }))
                        }
                      />
                      Mark complete (admin override → BOOKING_FORM_COMPLETE, then send-invoice)
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      disabled={bookingFormQuery.isFetching}
                      onClick={() => void bookingFormQuery.refetch()}
                    >
                      Reload form
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={portalBookingQuery.isFetching || !portalBookingQuery.data}
                      onClick={() => {
                        const payload = portalBookingQuery.data;
                        if (!payload) return;
                        setFormState((prev) =>
                          applyPortalPayloadToNvoccForm(prev, payload, { overwrite: true }),
                        );
                        setWorkflowMsg(
                          `Applied customer portal booking (quote ${payload.quoteNumber || payload.quotationId.slice(0, 8)}).`,
                        );
                      }}
                    >
                      {portalBookingQuery.isFetching
                        ? 'Loading portal…'
                        : 'Load customer portal booking'}
                    </Button>
                    <Button
                      disabled={
                        updateBookingForm.isPending ||
                        bookingFormQuery.isLoading ||
                        actions.sendInvoice.isPending
                      }
                      onClick={() => void saveBookingForm()}
                    >
                      Save booking form
                      {formState.mark_complete ? ' + send invoice' : ''}
                    </Button>
                  </div>
                </div>
              ) : null}

              {currentStage === 'invoice' ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-emerald-900">Now: Invoice sent by sales</p>
                  <Button
                    disabled={
                      actions.sendInvoice.isPending || updateBookingForm.isPending
                    }
                    onClick={() => void sendBookingInvoice()}
                  >
                    Send invoice
                  </Button>
                </div>
              ) : null}

              {currentStage === 'cro-container' ? (
                <div className="rounded-md border border-violet-200 bg-violet-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-violet-900">
                    Now: CRO + container number
                  </p>
                  <p className="text-xs text-violet-800">
                    Creates the NVOCC job (company + branch). If convert 500s, resolves shipper from
                    enquiry / booking-form SHIPPER (find or create party) and retries via direct job
                    create. Then Issue CRO / Allocate on the job Ops tab.
                  </p>
                  <p className="text-xs text-violet-900">
                    Status: <strong>{booking.booking_status || '—'}</strong>
                    {booking.shipper_id ? '' : ' · missing shipper_id'}
                    {booking.voyage_id ? '' : ' · missing voyage_id (confirm may fail)'}
                  </p>
                  {jobHref ? (
                    <Link to={jobHref}>
                      <Button type="button">Continue on job Ops</Button>
                    </Link>
                  ) : (
                    <Button
                      disabled={actions.convertToJob.isPending}
                      onClick={() =>
                        run(async () => {
                          const raw = await actions.convertToJob.mutateAsync({});
                          markDone('cro-container');
                          const record =
                            raw && typeof raw === 'object'
                              ? (raw as Record<string, unknown>)
                              : {};
                          const nested =
                            record.job && typeof record.job === 'object' ? record.job : raw;
                          const job = normalizeJob(nested);
                          const jobId =
                            job?.id ||
                            (typeof record.job_id === 'string' ? record.job_id : undefined);
                          const jobType = (job?.job_type ||
                            record.job_type ||
                            booking.job_type ||
                            'NVOCC_EXPORT') as JobType;
                          if (jobId) {
                            navigate(jobDetailPath({ id: jobId, job_type: jobType }));
                            return;
                          }
                          const refreshed = await query.refetch();
                          const linkedId = refreshed.data?.job_id;
                          if (linkedId) {
                            navigate(
                              jobDetailPath({
                                id: linkedId,
                                job_type: (refreshed.data?.job_type ||
                                  booking.job_type ||
                                  'NVOCC_EXPORT') as JobType,
                              }),
                            );
                          }
                        }, 'Converted — open Ops for CRO / allocate.')
                      }
                    >
                      Convert to job
                    </Button>
                  )}
                </div>
              ) : null}
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
