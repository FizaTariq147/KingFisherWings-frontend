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
  nvoccKeys,
} from '@/features/nvocc/hooks/useNvocc';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomerPortalBookingForm } from '@/features/portal-admin-inbox/hooks/usePortalAdminInbox';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import {
  firstOpenStage,
  useSeaExportProgress,
} from '@/features/nvocc/hooks/useSeaExportProgress';
import { nvoccDisplayNumber, preferCommercialGateStatus } from '@/features/nvocc/utils/normalizeNvocc';
import { rememberQuoteBookingLink } from '@/features/nvocc/utils/quoteBookingLink';
import {
  readRememberedJobForBooking,
  rememberBookingJobLink,
} from '@/features/nvocc/utils/bookingJobLink';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { isUuid } from '@/lib/isUuid';
import { normalizeJob } from '@/features/jobs/utils/normalizeJob';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import type { JobType } from '@/features/jobs/constants/job.constants';
import { JobInvoicesPanel } from '@/features/jobs/components/JobInvoicesPanel';
import { INVOICE_ROUTE_PREFIX } from '@/features/invoices/api/invoice.api';
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
    sq_bl_booking_reference: pick(
      prev.sq_bl_booking_reference,
      payload.sq_bl_booking_reference || payload.quoteNumber,
    ),
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

/** Parse "Cannot move from CS_TRIAGED to …" style gate errors for the real server stage. */
function statusFromGateError(error: unknown): string | undefined {
  const detail = extractAxiosErrorDetail(error);
  const match = detail.match(/from\s+([A-Z][A-Z0-9_]*)\s+to\s+/i);
  return match?.[1] ? gateStatusToken(match[1]) : undefined;
}

function isAtOrPastInvoiceSent(status?: string | null): boolean {
  const s = gateStatusToken(status);
  if (!s) return false;
  return s === 'INVOICE_SENT' || s.includes('INVOICE_SENT');
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

function isAtOrPastCustomerAccepted(status?: string | null): boolean {
  const s = gateStatusToken(status);
  if (!s) return false;
  return (
    s === 'CUSTOMER_ACCEPTED' ||
    s.includes('CUSTOMER_ACCEPTED') ||
    isAtOrPastBookingFormComplete(s)
  );
}

function isAtOrPastQuoteSent(status?: string | null): boolean {
  const s = gateStatusToken(status);
  if (!s) return false;
  return (
    s === 'QUOTE_SENT' ||
    s.includes('QUOTE_SENT') ||
    isAtOrPastCustomerAccepted(s)
  );
}

function isAtOrPastCsTriaged(status?: string | null): boolean {
  const s = gateStatusToken(status);
  if (!s) return false;
  return (
    s === 'CS_TRIAGED' ||
    s.includes('CS_TRIAGED') ||
    s === 'CS_RECEIVE' ||
    s.includes('PORTAL_ACCESS') ||
    isAtOrPastQuoteSent(s)
  );
}

/** Booking still at draft/new — local session checkmarks must not skip server gates. */
function isBookingDraftish(status?: string | null): boolean {
  const s = gateStatusToken(status);
  return !s || s === 'DRAFT' || s === 'NEW' || s === 'PENDING' || s === 'CREATED';
}

/** Prefer commercial stage; never let lifecycle DRAFT wipe QUOTE_SENT / CUSTOMER_ACCEPTED. */
function preferGate(primary?: string | null, fallback?: string | null): string | undefined {
  return preferCommercialGateStatus(primary, fallback);
}

function isNotForwardStageError(error: unknown): boolean {
  const detail = extractAxiosErrorDetail(error).toLowerCase();
  return (
    detail.includes('not forward') ||
    detail.includes('cannot move from') ||
    detail.includes('already at') ||
    detail.includes('already invoice_sent') ||
    detail.includes('same status') ||
    /from\s+(\w+)\s+to\s+\1/i.test(detail)
  );
}

function isIntermediateStageError(error: unknown): boolean {
  const detail = extractAxiosErrorDetail(error).toLowerCase();
  return (
    detail.includes('intermediate stages') ||
    detail.includes('must complete') ||
    detail.includes('current: quote_sent')
  );
}

export default function NvoccBookingDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useNvoccBooking(id);
  const actions = useNvoccBookingActions(id);
  const bookingFormQuery = useNvoccBookingForm(id, Boolean(query.data));
  const updateBookingForm = useUpdateNvoccBookingForm(id);
  const booking = query.data;
  const { done, markDone, isDone } = useSeaExportProgress(id ? `booking:${id}` : '');

  const [workflowMsg, setWorkflowMsg] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [formState, setFormState] = useState<BookingFormUiState>(emptyBookingFormUi);
  const [portalPrefillApplied, setPortalPrefillApplied] = useState(false);
  /** Quotation APPROVED / portal compliance form — unlocks customer-accept when booking_status lags. */
  const [portalAcceptEvidence, setPortalAcceptEvidence] = useState(false);
  /** Stable portal quote match once discovered (avoids formState in query key). */
  const [portalQuoteHint, setPortalQuoteHint] = useState<{
    quoteNumber?: string;
    quotationId?: string;
  }>({});
  /** Last auto-created / sent customer invoice id (for Invoice section + job link). */
  const [workflowInvoiceId, setWorkflowInvoiceId] = useState<string | undefined>();

  const rememberedJob = id ? readRememberedJobForBooking(id) : null;
  const linkedJobIdEarly = booking?.job_id || rememberedJob?.jobId;

  const portalBookingQuery = useCustomerPortalBookingForm(
    {
      jobId: linkedJobIdEarly,
      jobTypePrefix: 'NVOCC',
      quoteNumber:
        String(bookingFormQuery.data?.sq_bl_booking_reference ?? '').trim() ||
        portalQuoteHint.quoteNumber ||
        undefined,
      quotationId: portalQuoteHint.quotationId,
    },
    Boolean(booking),
  );

  // Remember portal quote id/number once found so subsequent fetches stay on QT/NE/….
  useEffect(() => {
    const payload = portalBookingQuery.data;
    if (!payload) return;
    const quoteNumber = payload.quoteNumber?.trim();
    const quotationId = payload.quotationId?.trim();
    if (!quoteNumber && !quotationId) return;
    setPortalQuoteHint((prev) => {
      if (prev.quoteNumber === quoteNumber && prev.quotationId === quotationId) return prev;
      return {
        quoteNumber: quoteNumber || prev.quoteNumber,
        quotationId: quotationId || prev.quotationId,
      };
    });
  }, [portalBookingQuery.data]);

  const portalFormFilled = Boolean(
    portalBookingQuery.data &&
      (portalBookingQuery.data.quotationId ||
        portalBookingQuery.data.quoteNumber ||
        Boolean(portalBookingQuery.data.commodity?.trim()) ||
        Boolean(portalBookingQuery.data.pol?.trim()) ||
        Boolean(portalBookingQuery.data.pod?.trim()) ||
        (portalBookingQuery.data.parties?.length ?? 0) > 0),
  );

  // Persist quote → booking link so quotation detail can show live gate progress.
  useEffect(() => {
    if (!id) return;
    const quotationId = portalBookingQuery.data?.quotationId;
    const quoteNumber =
      portalBookingQuery.data?.quoteNumber ||
      String(bookingFormQuery.data?.sq_bl_booking_reference ?? '').trim() ||
      undefined;
    if (!quotationId && !quoteNumber) return;
    rememberQuoteBookingLink({
      quotationId,
      quoteNumber,
      bookingId: id,
    });
  }, [
    id,
    portalBookingQuery.data?.quotationId,
    portalBookingQuery.data?.quoteNumber,
    bookingFormQuery.data?.sq_bl_booking_reference,
  ]);

  useEffect(() => {
    const form = bookingFormQuery.data;
    if (!form && !booking) return;
    if (form?.mark_complete === true) markDone('booking-form');
    const parties = form?.parties ?? [];
    const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
    const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
    const notify = parties.find((p) => p.party_kind === 'NOTIFY');
    setFormState((prev) => {
      let next: BookingFormUiState = {
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
      };
      // Keep portal-prefilled values when API form still has empty fields.
      (Object.keys(next) as (keyof BookingFormUiState)[]).forEach((key) => {
        if (typeof next[key] === 'string' && typeof prev[key] === 'string') {
          if (!(next[key] as string).trim() && (prev[key] as string).trim()) {
            (next as Record<string, unknown>)[key] = prev[key];
          }
        }
      });
      if (portalBookingQuery.data) {
        next = applyPortalPayloadToNvoccForm(next, portalBookingQuery.data, {
          overwrite: false,
        });
        if (portalBookingQuery.data.mark_complete === true && form?.mark_complete !== true) {
          // Portal customer already completed — Ops still confirms via Mark complete checkbox.
          // Pre-check only when API has not already locked mark_complete.
        }
      }
      if (
        !next.sq_bl_booking_reference.trim() &&
        (portalQuoteHint.quoteNumber || portalBookingQuery.data?.quoteNumber)
      ) {
        next = {
          ...next,
          sq_bl_booking_reference:
            portalQuoteHint.quoteNumber ||
            portalBookingQuery.data?.quoteNumber ||
            next.sq_bl_booking_reference,
        };
      }
      const keys = Object.keys(next) as (keyof BookingFormUiState)[];
      if (keys.every((k) => prev[k] === next[k])) return prev;
      return next;
    });
  }, [
    bookingFormQuery.data,
    booking?.id,
    booking?.commodity,
    booking?.hs_code,
    booking?.voyage_id,
    booking?.gross_weight,
    booking?.is_dg,
    markDone,
    portalBookingQuery.data,
    portalQuoteHint.quoteNumber,
  ]);

  useEffect(() => {
    const payload = portalBookingQuery.data;
    if (!payload || portalPrefillApplied) return;
    setFormState((prev) => {
      const merged = applyPortalPayloadToNvoccForm(prev, payload, { overwrite: false });
      const withQuote = {
        ...merged,
        sq_bl_booking_reference:
          merged.sq_bl_booking_reference.trim() ||
          payload.quoteNumber ||
          payload.sq_bl_booking_reference ||
          merged.sq_bl_booking_reference,
      };
      return withQuote;
    });
    setPortalPrefillApplied(true);
    setPortalAcceptEvidence(true);
    setWorkflowMsg(
      `Customer portal booking loaded (quote ${payload.quoteNumber || payload.quotationId.slice(0, 8)}). Review fields, check Mark complete, then Save → invoice + convert.`,
    );
  }, [portalBookingQuery.data, portalPrefillApplied]);

  const linkedJobId = booking?.job_id || rememberedJob?.jobId;
  const linkedJobType = (booking?.job_type ||
    rememberedJob?.jobType ||
    'NVOCC_EXPORT') as JobType;

  // Keep session link in sync when API finally returns job_id.
  useEffect(() => {
    if (!id || !booking?.job_id) return;
    rememberBookingJobLink({
      bookingId: id,
      jobId: booking.job_id,
      jobType: booking.job_type,
    });
  }, [id, booking?.job_id, booking?.job_type]);

  useEffect(() => {
    if (linkedJobId) markDone('cro-container');
  }, [linkedJobId, markDone]);

  useEffect(() => {
    if (isAtOrPastCsTriaged(booking?.booking_status)) markDone('cs-receive');
    if (isAtOrPastQuoteSent(booking?.booking_status)) markDone('quote-sent');
    if (isAtOrPastCustomerAccepted(booking?.booking_status)) markDone('customer-accept');
    if (isAtOrPastBookingFormComplete(booking?.booking_status)) markDone('booking-form');
    if (isAtOrPastInvoiceSent(booking?.booking_status)) markDone('invoice');
  }, [booking?.booking_status, markDone]);

  // Portal compliance form only unlocks after customer accept — treat as evidence (no network).
  useEffect(() => {
    if (!portalFormFilled) return;
    setPortalAcceptEvidence((prev) => (prev ? prev : true));
    markDone('cs-receive');
    markDone('quote-sent');
    markDone('customer-accept');
  }, [portalFormFilled, markDone]);

  const derived = useMemo(() => {
    const map: Partial<Record<SeaExportStageId, boolean>> = { ...done };
    map['customer-request'] = true;
    const status = booking?.booking_status;
    const draftish = isBookingDraftish(status);
    const localOk = !draftish;
    // Customer already accepted + filled compliance form in portal → Ops is at booking-form review.
    const portalAhead = portalAcceptEvidence || portalFormFilled;

    if (portalAhead) {
      map['cs-receive'] = true;
      map['quote-sent'] = true;
      map['customer-accept'] = true;
    } else {
      map['cs-receive'] =
        isAtOrPastCsTriaged(status) || (localOk && Boolean(done['cs-receive']));
      map['quote-sent'] =
        isAtOrPastQuoteSent(status) || (localOk && Boolean(done['quote-sent']));
      map['customer-accept'] = isAtOrPastCustomerAccepted(status);
    }

    map['booking-form'] =
      bookingFormQuery.data?.mark_complete === true || isAtOrPastBookingFormComplete(status);
    map.invoice = isAtOrPastInvoiceSent(status);
    if (linkedJobId) map['cro-container'] = true;
    return map;
  }, [
    done,
    bookingFormQuery.data?.mark_complete,
    linkedJobId,
    booking?.booking_status,
    portalAcceptEvidence,
    portalFormFilled,
  ]);

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

  const navigateToConvertedJob = async (raw: unknown, invoiceId?: string) => {
    const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const nested = record.job && typeof record.job === 'object' ? record.job : raw;
    const job = normalizeJob(nested);
    const jobId =
      job?.id ||
      (typeof record.job_id === 'string' ? record.job_id : undefined) ||
      linkedJobId;
    const jobType = (job?.job_type ||
      record.job_type ||
      linkedJobType ||
      'NVOCC_EXPORT') as JobType;
    const resolvedInvoiceId =
      (invoiceId && isUuid(invoiceId) ? invoiceId : undefined) ||
      (typeof record.invoice_id === 'string' && isUuid(record.invoice_id)
        ? record.invoice_id
        : undefined) ||
      workflowInvoiceId;

    if (jobId) {
      rememberBookingJobLink({
        bookingId: id,
        jobId,
        jobType: String(jobType),
      });
      // Optimistically show linked job on this page before / after refetch.
      queryClient.setQueryData(nvoccKeys.bookings.detail(id), (prev: typeof booking) =>
        prev ? { ...prev, job_id: jobId, job_type: String(jobType) } : prev,
      );
      try {
        const { jobService } = await import('@/features/jobs/services/job.service');
        const quotation = await resolveLinkedQuotation(jobId);
        if (quotation) await jobService.ensureChargesFromQuotation(jobId, quotation);
      } catch {
        /* non-fatal */
      }
      if (resolvedInvoiceId) {
        await linkInvoiceToJob(resolvedInvoiceId, jobId);
        setWorkflowInvoiceId(resolvedInvoiceId);
      }
      await query.refetch();
      const params = new URLSearchParams({ tab: 'invoices' });
      if (resolvedInvoiceId) params.set('invoice_id', resolvedInvoiceId);
      navigate(`${jobDetailPath({ id: jobId, job_type: jobType })}?${params.toString()}`, {
        state: {
          openTab: 'invoices',
          ...(resolvedInvoiceId ? { invoiceId: resolvedInvoiceId } : {}),
        },
      });
      return;
    }
    const refreshed = await query.refetch();
    const linkedId = refreshed.data?.job_id || readRememberedJobForBooking(id)?.jobId;
    if (linkedId) {
      if (resolvedInvoiceId) await linkInvoiceToJob(resolvedInvoiceId, linkedId);
      const params = new URLSearchParams({ tab: 'invoices' });
      if (resolvedInvoiceId) params.set('invoice_id', resolvedInvoiceId);
      navigate(
        `${jobDetailPath({
          id: linkedId,
          job_type: (refreshed.data?.job_type || linkedJobType) as JobType,
        })}?${params.toString()}`,
        {
          state: {
            openTab: 'invoices',
            ...(resolvedInvoiceId ? { invoiceId: resolvedInvoiceId } : {}),
          },
        },
      );
    }
  };

  const resolveLinkedQuotation = async (jobIdHint?: string) => {
    const { quotationService } = await import(
      '@/features/quotations/services/quotation.service'
    );
    type Quotation = import('@/features/quotations/types/quotation.types').Quotation;
    const portalQuoteId = portalBookingQuery.data?.quotationId;
    const quoteNumber =
      portalBookingQuery.data?.quoteNumber ||
      formState.sq_bl_booking_reference.trim() ||
      undefined;

    const remember = (q: Quotation | null): Quotation | null => {
      if (!q || !id) return q;
      rememberQuoteBookingLink({
        quotationId: q.id,
        quoteNumber: q.quotation_number || q.quote_no || quoteNumber,
        bookingId: id,
      });
      return q;
    };

    if (portalQuoteId && isUuid(portalQuoteId)) {
      try {
        return remember(await quotationService.getById(portalQuoteId));
      } catch {
        /* fall through */
      }
    }

    const jobId = jobIdHint || booking?.job_id;
    if (jobId) {
      const linked = await quotationService.findLinkedToJob(jobId, {
        quotationId: portalQuoteId,
        customerId: booking?.shipper_id,
        jobType: booking?.job_type,
      });
      if (linked) return remember(linked);
    }

    if (quoteNumber) {
      try {
        const listed = await quotationService.list({
          page: 1,
          limit: 20,
          search: quoteNumber,
          order: 'desc',
          ...(booking?.job_type
            ? { job_type: booking.job_type as import('@/features/quotations/types/quotation.types').Quotation['job_type'] }
            : {}),
        });
        const match =
          listed.quotations.find(
            (q) =>
              q.quotation_number === quoteNumber ||
              q.quote_no === quoteNumber ||
              String(q.quotation_number ?? '').includes(quoteNumber) ||
              String(q.quote_no ?? '').includes(quoteNumber),
          ) ?? listed.quotations[0];
        if (match) {
          if (match.lines?.length) return remember(match);
          return remember(await quotationService.getById(match.id));
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  };

  /**
   * Advance the live booking through CS_TRIAGED → QUOTE_SENT → CUSTOMER_ACCEPTED
   * on the server. Required before Mark complete (BOOKING_FORM_COMPLETE).
   * UI portal evidence alone is not enough — API rejects jumps from CS_TRIAGED.
   */
  const advanceBookingCommercialGates = async (): Promise<string | undefined> => {
    await portalBookingQuery.refetch();
    let status =
      (await query.refetch()).data?.booking_status ?? booking?.booking_status;
    const quotation = await resolveLinkedQuotation();
    const { isCustomerApprovedStatus } = await import(
      '@/features/quotations/utils/quotationStatus'
    );
    const quoteApproved = quotation
      ? isCustomerApprovedStatus(quotation.status) ||
        gateStatusToken(quotation.status) === 'CUSTOMER_ACCEPTED' ||
        gateStatusToken(quotation.status) === 'WON'
      : false;
    const portalFormPresent = Boolean(
      portalBookingQuery.data?.quotationId ||
        portalBookingQuery.data?.quoteNumber ||
        portalFormFilled,
    );

    const absorbGateError = (error: unknown): string | undefined => {
      const fromErr = statusFromGateError(error);
      if (fromErr) return fromErr;
      if (isNotForwardStageError(error) || isIntermediateStageError(error)) {
        return gateStatusToken(status) || undefined;
      }
      return undefined;
    };

    /** Refetch without letting lifecycle DRAFT wipe a known commercial gate. */
    const refetchStatus = async (fallback?: string) => {
      const fetched = (await query.refetch()).data?.booking_status;
      return preferGate(fetched, fallback ?? status);
    };

    const applyUpdated = (updatedStatus?: string | null, fallback?: string) =>
      preferGate(updatedStatus, fallback ?? status);

    if (!isAtOrPastCsTriaged(status)) {
      try {
        const updated = await actions.csTriage.mutateAsync({
          admin_override: true,
          stage_override_reason: quotation?.quotation_number
            ? `Advance CS for portal quote ${quotation.quotation_number}`
            : 'Advance CS before booking form complete',
        });
        status = applyUpdated(updated.booking_status, status);
      } catch (error) {
        const inferred = absorbGateError(error);
        if (!inferred) throw error;
        status = preferGate(inferred, status);
      }
      status = await refetchStatus(status);
    }
    markDone('cs-receive');

    if (!isAtOrPastQuoteSent(status)) {
      try {
        const updated = await actions.markQuoteSent.mutateAsync({
          admin_override: true,
          stage_override_reason: quotation?.quotation_number
            ? `Advance QUOTE_SENT for portal quote ${quotation.quotation_number}`
            : 'Advance QUOTE_SENT before booking form complete',
        });
        status = applyUpdated(updated.booking_status, status);
      } catch (error) {
        const inferred = absorbGateError(error);
        if (!inferred) throw error;
        status = preferGate(inferred, status);
      }
      status = await refetchStatus(status);
    }
    markDone('quote-sent');

    // Portal accept sets CUSTOMER_ACCEPTED on the booking (not only the quotation).
    if (!isAtOrPastCustomerAccepted(status) && (quoteApproved || portalFormPresent) && id) {
      try {
        const { nvoccBookingService } = await import(
          '@/features/nvocc/services/nvocc.service'
        );
        const accepted = await nvoccBookingService.tryPortalAccept(id);
        if (accepted?.booking_status) {
          status = applyUpdated(accepted.booking_status, status);
        } else {
          status = await refetchStatus(status);
        }
      } catch {
        status = await refetchStatus(status);
      }
    }

    if (isAtOrPastCustomerAccepted(status) || quoteApproved || portalFormPresent) {
      setPortalAcceptEvidence(true);
      markDone('customer-accept');
    }

    return status;
  };

  /**
   * When booking lags behind portal accept / compliance form, advance
   * CS_TRIAGED → QUOTE_SENT → CUSTOMER_ACCEPTED on the server.
   */
  const syncBookingGatesFromPortal = async () => {
    setWorkflowError(null);
    setWorkflowMsg(null);
    const quotation = await resolveLinkedQuotation();
    const { coerceQuotationStatus, isCustomerApprovedStatus } = await import(
      '@/features/quotations/utils/quotationStatus'
    );
    const status = await advanceBookingCommercialGates();
    const quoteApproved = quotation
      ? isCustomerApprovedStatus(quotation.status) ||
        gateStatusToken(quotation.status) === 'CUSTOMER_ACCEPTED' ||
        gateStatusToken(quotation.status) === 'WON'
      : false;
    const portalFormPresent = Boolean(
      portalBookingQuery.data?.quotationId ||
        portalBookingQuery.data?.quoteNumber ||
        portalFormFilled,
    );
    const bookingAccepted = isAtOrPastCustomerAccepted(status);
    const accepted = bookingAccepted || quoteApproved || portalFormPresent;

    if (accepted) {
      setPortalAcceptEvidence(true);
      markDone('cs-receive');
      markDone('quote-sent');
      markDone('customer-accept');
      const quoteLabel =
        quotation?.quotation_number ||
        quotation?.quote_no ||
        portalBookingQuery.data?.quoteNumber ||
        'quote';
      setWorkflowMsg(
        portalFormPresent
          ? `${quoteLabel}: gates synced (${gateStatusToken(status) || '—'}). Review Ops fields, then Mark complete → invoice + convert.`
          : bookingAccepted
            ? `CUSTOMER_ACCEPTED on booking — complete Ops booking form next.`
            : `${quoteLabel} is customer-approved. Booking is ${gateStatusToken(status) || 'synced'} — complete Ops booking form next.`,
      );
      return;
    }

    setWorkflowError(
      `Booking is ${gateStatusToken(status) || 'unknown'}` +
        (quotation
          ? ` · quotation ${quotation.quotation_number || quotation.id.slice(0, 8)} is ${coerceQuotationStatus(quotation.status)}`
          : ' · linked quotation not found') +
        '. Need QUOTE_SENT then CUSTOMER_ACCEPTED on the booking before Mark complete.',
    );
  };

  const ensureNvoccInvoiceWithQuotationCharges = async (): Promise<string | undefined> => {
    const { invoiceService } = await import('@/features/invoices/services/invoice.service');
    const { quotationLinesToInvoiceLineDtos } = await import(
      '@/features/quotations/utils/quotationRevenueCharges'
    );
    const quotation = await resolveLinkedQuotation();
    const lines = quotationLinesToInvoiceLineDtos(quotation?.lines);
    const jobId = booking?.job_id && isUuid(booking.job_id) ? booking.job_id : undefined;

    // Prefer job-linked draft (same path as Air) so Invoice section lists by job_id.
    if (jobId) {
      try {
        const { jobService } = await import('@/features/jobs/services/job.service');
        let jobForInvoice = await jobService.getById(jobId);
        if (quotation?.lines?.length) {
          try {
            jobForInvoice = await jobService.ensureChargesFromQuotation(jobId, quotation);
          } catch {
            /* keep jobForInvoice */
          }
        }
        const invoice = await invoiceService.ensureDraftForJob({
          id: jobId,
          shipper_id: jobForInvoice.shipper_id || booking?.shipper_id,
          billing_party_id: jobForInvoice.billing_party_id,
          company_id: jobForInvoice.company_id,
          branch_id: jobForInvoice.branch_id,
          currency_code: quotation?.currency_code,
          charges: jobForInvoice.charges,
          quotationLines: lines,
          lineHint: quotation?.quotation_number
            ? `NVOCC — quotation ${quotation.quotation_number}`
            : 'NVOCC freight charges',
        });
        if (invoice?.id && isUuid(invoice.id)) {
          setWorkflowInvoiceId(invoice.id);
          return invoice.id;
        }
      } catch {
        /* fall through to party create */
      }
    }

    const partyId = booking?.shipper_id;
    if (!partyId || !isUuid(partyId)) return undefined;

    // Reuse an invoice already linked to the job if present.
    if (jobId) {
      try {
        const listed = await invoiceService.list({
          job_id: jobId,
          limit: 5,
          page: 1,
        });
        const existing = listed.invoices.find((inv) => isUuid(inv.id));
        if (existing) {
          const detail = await invoiceService.getById(existing.id).catch(() => existing);
          const filled = await invoiceService.applyQuotationLinesIfNeeded(detail, lines);
          setWorkflowInvoiceId(filled.id);
          return filled.id;
        }
      } catch {
        /* create below */
      }
    }

    const createLines =
      lines.length > 0
        ? lines
        : [
            {
              description: quotation?.quotation_number
                ? `NVOCC — quotation ${quotation.quotation_number}`
                : 'NVOCC freight charges',
              quantity: 1,
              unit_price: 0,
              sort_order: 0,
            },
          ];

    try {
      const created = await invoiceService.create({
        party_id: partyId,
        job_id: jobId,
        currency_code: (quotation?.currency_code || 'AED').trim().toUpperCase().slice(0, 3) || 'AED',
        exchange_rate: undefined,
        vat_rate: undefined,
        remarks: quotation?.quotation_number
          ? `Charges from quotation ${quotation.quotation_number}`
          : 'Charges from quotation',
        lines: createLines,
      });
      if (created.id && isUuid(created.id)) {
        setWorkflowInvoiceId(created.id);
        return created.id;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const linkInvoiceToJob = async (invoiceId: string, jobId: string) => {
    if (!isUuid(invoiceId) || !isUuid(jobId)) return;
    try {
      const { invoiceService } = await import('@/features/invoices/services/invoice.service');
      const { invoiceKeys } = await import('@/features/invoices/hooks/useInvoices');
      const inv = await invoiceService.getById(invoiceId);
      if (!inv.job_id || inv.job_id !== jobId) {
        await invoiceService.update(invoiceId, {
          job_id: jobId,
          currency_code: inv.currency_code || undefined,
          exchange_rate: inv.exchange_rate,
          vat_rate: inv.vat_rate,
        });
      }
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    } catch {
      /* non-fatal — invoice may already be sent / immutable */
    }
  };

  const applyQuotationChargesToInvoiceResult = async (sendResult: unknown) => {
    const { invoiceService } = await import('@/features/invoices/services/invoice.service');
    const { quotationLinesToInvoiceLineDtos } = await import(
      '@/features/quotations/utils/quotationRevenueCharges'
    );
    const quotation = await resolveLinkedQuotation();
    const lines = quotationLinesToInvoiceLineDtos(quotation?.lines);
    if (!lines.length) return;

    const record =
      sendResult && typeof sendResult === 'object'
        ? (sendResult as Record<string, unknown>)
        : {};
    const nestedInv =
      record.invoice && typeof record.invoice === 'object'
        ? (record.invoice as Record<string, unknown>)
        : null;
    const invoiceIdCandidates = [
      record.invoice_id,
      record.invoiceId,
      nestedInv?.id,
      workflowInvoiceId,
    ];
    let invoiceId = '';
    for (const c of invoiceIdCandidates) {
      const s = String(c ?? '');
      if (isUuid(s)) {
        invoiceId = s;
        break;
      }
    }

    if (!invoiceId && booking?.job_id) {
      try {
        const listed = await invoiceService.list({
          job_id: booking.job_id,
          limit: 5,
          page: 1,
        });
        invoiceId = listed.invoices.find((inv) => isUuid(inv.id))?.id ?? '';
      } catch {
        /* ignore */
      }
    }

    // Without a job yet, only trust invoice_id from send-invoice response (do not guess by party).
    if (!invoiceId) return;
    setWorkflowInvoiceId(invoiceId);
    try {
      const invoice = await invoiceService.getById(invoiceId);
      await invoiceService.applyQuotationLinesIfNeeded(invoice, lines);
    } catch {
      /* non-fatal — invoice already sent */
    }
  };

  const saveBookingForm = () =>
    run(
      async () => {
        // Persist field edits without stage regression (never re-send mark_complete when past).
        await updateBookingForm.mutateAsync(buildBookingFormDto({ markComplete: false }));

        if (!formState.mark_complete) {
          return;
        }

        // Server must leave CS_TRIAGED before BOOKING_FORM_COMPLETE — UI checkmarks are ignored.
        let statusBefore = await advanceBookingCommercialGates();
        const fetchedBefore = (await query.refetch()).data?.booking_status;
        statusBefore = preferGate(fetchedBefore, statusBefore ?? booking?.booking_status);

        if (isBookingDraftish(statusBefore) || gateStatusToken(statusBefore) === 'CS_TRIAGED') {
          // Force QUOTE_SENT one more time if still stuck at CS / lifecycle DRAFT after absorb.
          try {
            const updated = await actions.markQuoteSent.mutateAsync({
              admin_override: true,
              stage_override_reason:
                'Force QUOTE_SENT before BOOKING_FORM_COMPLETE (portal form already on file).',
            });
            statusBefore = preferGate(updated.booking_status, statusBefore);
          } catch (error) {
            const inferred = statusFromGateError(error);
            if (inferred) statusBefore = preferGate(inferred, statusBefore);
            else if (!isNotForwardStageError(error)) throw error;
          }
          statusBefore = preferGate(
            (await query.refetch()).data?.booking_status,
            statusBefore,
          );
        }

        // Portal accept may still be missing on the booking entity — retry before Mark complete.
        if (
          !isAtOrPastCustomerAccepted(statusBefore) &&
          (portalAcceptEvidence || portalFormFilled) &&
          id
        ) {
          try {
            const { nvoccBookingService } = await import(
              '@/features/nvocc/services/nvocc.service'
            );
            const accepted = await nvoccBookingService.tryPortalAccept(id);
            statusBefore = preferGate(accepted?.booking_status, statusBefore);
          } catch {
            /* keep statusBefore */
          }
        }

        if (isBookingDraftish(statusBefore) || gateStatusToken(statusBefore) === 'CS_TRIAGED') {
          throw new Error(
            `Booking commercial stage is still ${gateStatusToken(statusBefore) || 'DRAFT'} (need QUOTE_SENT → CUSTOMER_ACCEPTED before BOOKING_FORM_COMPLETE). ` +
              'Sync booking gates (QUOTE_SENT / CUSTOMER_ACCEPTED), then Mark complete again.',
          );
        }

        const alreadyFormComplete =
          bookingFormQuery.data?.mark_complete === true ||
          isAtOrPastBookingFormComplete(statusBefore);
        const alreadyInvoiceSent = isAtOrPastInvoiceSent(statusBefore);
        let formMarkedComplete = alreadyFormComplete;

        if (!alreadyFormComplete) {
          try {
            const formResult = await updateBookingForm.mutateAsync(
              buildBookingFormDto({
                markComplete: true,
                adminOverride: true,
                overrideReason: isAtOrPastCustomerAccepted(statusBefore)
                  ? 'Admin assist: customer portal owns compliance complete; marking booking form complete after review.'
                  : 'Admin assist: portal quote accepted + form on file; advancing BOOKING_FORM_COMPLETE after QUOTE_SENT sync.',
              }),
            );
            if (formResult.mark_complete === true) {
              formMarkedComplete = true;
              markDone('booking-form');
            }
          } catch (error) {
            if (isIntermediateStageError(error)) {
              const current =
                statusFromGateError(error) ||
                gateStatusToken(statusBefore) ||
                'unknown';
              throw new Error(
                `${extractAxiosErrorDetail(error)} Booking commercial stage is still at ${current} on the server. ` +
                  'Required order: CS_TRIAGED → QUOTE_SENT → CUSTOMER_ACCEPTED → BOOKING_FORM_COMPLETE. ' +
                  'Use “Sync from portal” first, then Mark complete again.',
              );
            }
            // "Already at BOOKING_FORM_COMPLETE" counts as success.
            const fromErr = statusFromGateError(error);
            if (fromErr && isAtOrPastBookingFormComplete(fromErr)) {
              formMarkedComplete = true;
            } else if (!isNotForwardStageError(error)) {
              throw error;
            }
          }
        }

        const refreshed = await query.refetch();
        const statusAfter = preferGate(refreshed.data?.booking_status, statusBefore);
        const formRefreshed = await bookingFormQuery.refetch();
        formMarkedComplete =
          formMarkedComplete || formRefreshed.data?.mark_complete === true;

        // Form mark_complete is the source of truth for BOOKING_FORM_COMPLETE.
        // Entity booking_status often stays DRAFT until Confirm — do not block on that.
        if (!formMarkedComplete && !isAtOrPastBookingFormComplete(statusAfter)) {
          throw new Error(
            `Booking form was saved but backend status is still ${gateStatusToken(statusAfter) || 'DRAFT'} (need BOOKING_FORM_COMPLETE). ` +
              'Sync booking gates (QUOTE_SENT / CUSTOMER_ACCEPTED), then Mark complete again.',
          );
        }
        markDone('customer-accept');
        markDone('booking-form');

        let invoiceForJob = workflowInvoiceId;
        if (!alreadyInvoiceSent && !isAtOrPastInvoiceSent(statusAfter)) {
          try {
            const invoiceId = await ensureNvoccInvoiceWithQuotationCharges();
            if (invoiceId) invoiceForJob = invoiceId;
            const sendResult = await actions.sendInvoice.mutateAsync({
              admin_override: true,
              stage_override_reason:
                'Auto send-invoice after BOOKING_FORM_COMPLETE (booking form Mark complete).',
              ...(invoiceId ? { invoice_id: invoiceId } : {}),
            });
            await applyQuotationChargesToInvoiceResult(sendResult ?? { invoice_id: invoiceId });
            if (invoiceId) setWorkflowInvoiceId(invoiceId);
          } catch (error) {
            if (isIntermediateStageError(error)) {
              throw new Error(
                `${extractAxiosErrorDetail(error)} Complete CUSTOMER_ACCEPTED → BOOKING_FORM_COMPLETE on the server before INVOICE_SENT. Current UI progress is ignored by the API.`,
              );
            }
            if (!isNotForwardStageError(error)) throw error;
          }
        } else {
          // Invoice already on server — only backfill lines if we can resolve the invoice id.
          await applyQuotationChargesToInvoiceResult({});
        }
        markDone('invoice');

        // Auto convert booking → NVOCC job after invoice (unless already linked).
        const afterInvoice = await query.refetch();
        const linkedJobId = afterInvoice.data?.job_id ?? booking?.job_id;
        if (!linkedJobId) {
          try {
            const raw = await actions.convertToJob.mutateAsync({});
            markDone('cro-container');
            await navigateToConvertedJob(raw, invoiceForJob);
          } catch (error) {
            throw new Error(
              `${extractAxiosErrorDetail(error)} Invoice was sent, but convert-to-job failed. Use “Retry convert to job” on the CRO step.`,
            );
          }
        } else {
          markDone('cro-container');
          if (invoiceForJob) await linkInvoiceToJob(invoiceForJob, linkedJobId);
          const params = new URLSearchParams({ tab: 'invoices' });
          if (invoiceForJob) params.set('invoice_id', invoiceForJob);
          navigate(
            `${jobDetailPath({
              id: linkedJobId,
              job_type: (afterInvoice.data?.job_type ||
                booking?.job_type ||
                'NVOCC_EXPORT') as JobType,
            })}?${params.toString()}`,
            {
              state: {
                openTab: 'invoices',
                ...(invoiceForJob ? { invoiceId: invoiceForJob } : {}),
              },
            },
          );
        }
      },
      formState.mark_complete
        ? isAtOrPastInvoiceSent(booking?.booking_status) && booking?.job_id
          ? 'Booking already invoiced and linked to a job — form fields saved.'
          : 'Booking form complete → invoice generated → converted to job.'
        : 'Booking form draft saved. Check “Mark complete” and save again to generate invoice and convert to job.',
      formState.mark_complete ? 'cro-container' : undefined,
    );

  const sendBookingInvoice = () =>
    run(
      async () => {
        const refreshed = await query.refetch();
        const status = preferGate(
          refreshed.data?.booking_status,
          booking?.booking_status,
        );
        const formComplete =
          bookingFormQuery.data?.mark_complete === true ||
          isAtOrPastBookingFormComplete(status);
        let invoiceForJob = workflowInvoiceId;
        if (!isAtOrPastInvoiceSent(status)) {
          if (!formComplete) {
            throw new Error(
              `Cannot send invoice yet. Backend status is ${gateStatusToken(status) || 'unknown'} (need BOOKING_FORM_COMPLETE). ` +
                'Order: QUOTE_SENT → portal CUSTOMER_ACCEPTED → booking form Mark complete → auto invoice + convert. Current: stuck before booking form complete.',
            );
          }
          const invoiceId = await ensureNvoccInvoiceWithQuotationCharges();
          if (invoiceId) invoiceForJob = invoiceId;
          const sendResult = await actions.sendInvoice.mutateAsync({
            admin_override: true,
            stage_override_reason:
              'Staff retry send-invoice after BOOKING_FORM_COMPLETE (auto path failed).',
            ...(invoiceId ? { invoice_id: invoiceId } : {}),
          });
          await applyQuotationChargesToInvoiceResult(sendResult ?? { invoice_id: invoiceId });
        } else {
          await applyQuotationChargesToInvoiceResult({});
        }
        markDone('invoice');

        const afterInvoice = await query.refetch();
        const linkedJobId = afterInvoice.data?.job_id ?? booking?.job_id;
        if (!linkedJobId) {
          const raw = await actions.convertToJob.mutateAsync({});
          markDone('cro-container');
          await navigateToConvertedJob(raw, invoiceForJob);
        } else {
          markDone('cro-container');
          if (invoiceForJob) await linkInvoiceToJob(invoiceForJob, linkedJobId);
          const params = new URLSearchParams({ tab: 'invoices' });
          if (invoiceForJob) params.set('invoice_id', invoiceForJob);
          navigate(
            `${jobDetailPath({
              id: linkedJobId,
              job_type: (afterInvoice.data?.job_type ||
                booking?.job_type ||
                'NVOCC_EXPORT') as JobType,
            })}?${params.toString()}`,
            {
              state: {
                openTab: 'invoices',
                ...(invoiceForJob ? { invoiceId: invoiceForJob } : {}),
              },
            },
          );
        }
      },
      'Invoice sent → converted to job.',
      'cro-container',
    );

  const jobHref = linkedJobId
    ? jobDetailPath({
        id: linkedJobId,
        job_type: linkedJobType,
      })
    : null;

  const displayStatus = linkedJobId
    ? 'CONVERTED'
    : booking?.booking_status;

  return (
    <div className="space-y-4">
      <PageBackLink to="/nvocc/booking-list" label="Back to bookings" />
      <NvoccListState loading={query.isLoading} error={query.isError ? query.error : undefined} />
      {booking && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-gray-200 bg-white p-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{nvoccDisplayNumber(booking, 'Booking')}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <NvoccStatusBadge status={displayStatus} />
                {linkedJobId && booking.booking_status ? (
                  <span className="text-xs text-gray-500">
                    Gate {booking.booking_status}
                    {booking.lifecycle_status ? ` · ${booking.lifecycle_status}` : ''}
                  </span>
                ) : null}
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
                    booking.lifecycle_status &&
                      !['DRAFT', 'NEW', 'PENDING', 'CREATED'].includes(
                        String(booking.lifecycle_status)
                          .toUpperCase()
                          .replace(/[\s-]+/g, '_'),
                      ),
                  )
                }
                title={
                  booking.lifecycle_status &&
                  !['DRAFT', 'NEW', 'PENDING', 'CREATED'].includes(
                    String(booking.lifecycle_status)
                      .toUpperCase()
                      .replace(/[\s-]+/g, '_'),
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
                {portalFormFilled
                  ? 'Customer already accepted the quote and submitted the portal booking form — review Ops fields and Mark complete.'
                  : 'UI advances one step at a time. Complete the highlighted stage, then the next panel unlocks.'}
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
                  <p className="text-xs text-amber-800">
                    Booking is{' '}
                    <strong>{gateStatusToken(booking?.booking_status) || 'unknown'}</strong>
                    {portalFormFilled
                      ? `. Portal already has quote ${portalBookingQuery.data?.quoteNumber || ''} accepted with a booking form — Sync jumps to Ops review.`
                      : isBookingDraftish(booking?.booking_status)
                        ? ' (still draft — run Sync or CS triage).'
                        : isAtOrPastCsTriaged(booking?.booking_status)
                          ? ' (CS already done on server — use Sync to continue).'
                          : '.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={
                        actions.csTriage.isPending ||
                        actions.markQuoteSent.isPending ||
                        query.isFetching
                      }
                      onClick={() =>
                        void run(() => syncBookingGatesFromPortal(), undefined)
                      }
                    >
                      {portalFormFilled
                        ? 'Sync from portal → Ops booking form'
                        : 'Sync from portal'}
                    </Button>
                    {!portalFormFilled ? (
                      <Button
                        disabled={actions.csTriage.isPending}
                        onClick={() =>
                          run(async () => {
                            try {
                              await actions.csTriage.mutateAsync({});
                            } catch (error) {
                              const inferred = statusFromGateError(error);
                              if (
                                inferred &&
                                isAtOrPastCsTriaged(inferred) &&
                                isNotForwardStageError(error)
                              ) {
                                markDone('cs-receive');
                                await query.refetch();
                                return;
                              }
                              throw error;
                            }
                          }, 'Portal access granted — next: send quote.', 'cs-receive')
                        }
                      >
                        CS triage only
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {currentStage === 'customer-accept' ? (
                <div className="rounded-md border border-sky-200 bg-sky-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-sky-900">Now: Customer accepts</p>
                  <p className="text-xs text-sky-800">
                    Booking status: <strong>{gateStatusToken(booking?.booking_status) || '—'}</strong>
                    {portalBookingQuery.data
                      ? ` · portal form loaded for ${portalBookingQuery.data.quoteNumber || portalBookingQuery.data.quotationId.slice(0, 8)}`
                      : ''}
                    . Accept is on the quotation in the portal (
                    <code className="text-[10px]">POST /portal/quotations/:id/accept</code>
                    ), then booking compliance. <strong>Refresh / sync</strong> checks the linked
                    quotation and advances DRAFT bookings past CS / quote-sent.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={
                        query.isFetching ||
                        actions.csTriage.isPending ||
                        actions.markQuoteSent.isPending
                      }
                      onClick={() =>
                        void run(() => syncBookingGatesFromPortal(), undefined)
                      }
                    >
                      Refresh / sync from portal
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        !isAtOrPastCustomerAccepted(booking?.booking_status) &&
                        !portalAcceptEvidence &&
                        !portalBookingQuery.data
                      }
                      onClick={() => {
                        setPortalAcceptEvidence(true);
                        markDone('customer-accept');
                        setWorkflowMsg(
                          'Customer accept recorded — complete Ops booking form next.',
                        );
                        setWorkflowError(null);
                      }}
                    >
                      Customer accepted — continue
                    </Button>
                  </div>
                </div>
              ) : null}

              {currentStage === 'quote-sent' ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-amber-900">Now: Admin sends quote (Sales)</p>
                  <p className="text-xs text-amber-800">
                    {portalFormFilled
                      ? `Portal already has ${portalBookingQuery.data?.quoteNumber || 'the quote'} accepted with a booking form — Sync to jump to Ops review.`
                      : 'After this: customer accepts → Ops booking form → auto invoice + convert to job → CRO.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={
                        actions.markQuoteSent.isPending ||
                        actions.csTriage.isPending ||
                        query.isFetching
                      }
                      onClick={() =>
                        void run(() => syncBookingGatesFromPortal(), undefined)
                      }
                    >
                      {portalFormFilled
                        ? 'Sync from portal → Ops booking form'
                        : 'Sync from portal'}
                    </Button>
                    {!portalFormFilled ? (
                      <Button
                        disabled={actions.markQuoteSent.isPending}
                        onClick={() =>
                          run(
                            async () => {
                              await actions.markQuoteSent.mutateAsync({
                                admin_override: true,
                                stage_override_reason: 'Staff mark quote sent (NVOCC sea export).',
                              });
                            },
                            'Quote sent — next: customer accept, then Ops booking form.',
                            'quote-sent',
                          )
                        }
                      >
                        Mark quote sent
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {currentStage === 'booking-form' ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-emerald-900">
                    Now: Booking form (Ops — admin / sales)
                  </p>
                  <p className="text-xs text-emerald-800">
                    Exact gate: QUOTE_SENT → CUSTOMER_ACCEPTED → BOOKING_FORM_COMPLETE → INVOICE_SENT
                    (with quotation charges) → convert to job. Customer fills the portal form first.{' '}
                    <strong>Mark complete</strong> advances BOOKING_FORM_COMPLETE, then automatically
                    generates the invoice using the same charges as the quotation and converts to a
                    job (no separate convert step unless retry is needed).
                  </p>
                  {portalBookingQuery.data ? (
                    <p className="text-xs text-emerald-900">
                      Portal submission found for quote{' '}
                      <strong>
                        {portalBookingQuery.data.quoteNumber ||
                          portalBookingQuery.data.quotationId.slice(0, 8)}
                      </strong>
                      . Fields are prefilled from the customer form — review, check{' '}
                      <strong>Mark complete</strong>, then Save.
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
                      Mark complete (admin override → BOOKING_FORM_COMPLETE → auto invoice → convert to job)
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
                        setFormState((prev) => {
                          const applied = applyPortalPayloadToNvoccForm(prev, payload, {
                            overwrite: true,
                          });
                          return {
                            ...applied,
                            sq_bl_booking_reference:
                              applied.sq_bl_booking_reference.trim() ||
                              payload.quoteNumber ||
                              applied.sq_bl_booking_reference,
                            mark_complete: true,
                          };
                        });
                        setPortalAcceptEvidence(true);
                        setWorkflowMsg(
                          `Applied portal quote ${payload.quoteNumber || payload.quotationId.slice(0, 8)} and checked Mark complete. Click Save to invoice + convert.`,
                        );
                      }}
                    >
                      {portalBookingQuery.isFetching
                        ? 'Loading portal…'
                        : 'Load portal + Mark complete'}
                    </Button>
                    <Button
                      disabled={
                        updateBookingForm.isPending ||
                        bookingFormQuery.isLoading ||
                        actions.sendInvoice.isPending ||
                        actions.convertToJob.isPending
                      }
                      onClick={() => void saveBookingForm()}
                    >
                      {formState.mark_complete
                        ? 'Save form → complete + invoice + convert'
                        : 'Save booking form draft'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {currentStage === 'invoice' ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-emerald-900">Now: INVOICE_SENT</p>
                  <p className="text-xs text-emerald-800">
                    Invoice + convert run automatically when the booking form is marked complete.
                    Use this only if auto-invoice failed — then converts to job.
                  </p>
                  {workflowInvoiceId ? (
                    <p className="text-xs text-emerald-900">
                      Invoice:{' '}
                      <Link
                        to={`${INVOICE_ROUTE_PREFIX}/${workflowInvoiceId}`}
                        className="font-medium underline"
                      >
                        Open invoice
                      </Link>
                      {linkedJobId ? (
                        <>
                          {' · '}
                          <Link
                            to={`${jobDetailPath({
                              id: linkedJobId,
                              job_type: linkedJobType,
                            })}?tab=invoices&invoice_id=${encodeURIComponent(workflowInvoiceId)}`}
                            className="font-medium underline"
                          >
                            Job Invoices tab
                          </Link>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                  <Button
                    disabled={
                      actions.sendInvoice.isPending ||
                      updateBookingForm.isPending ||
                      actions.convertToJob.isPending
                    }
                    onClick={() => void sendBookingInvoice()}
                  >
                    Retry send invoice + convert
                  </Button>
                </div>
              ) : null}

              {currentStage === 'cro-container' ? (
                <div className="rounded-md border border-violet-200 bg-violet-50 p-4 space-y-2">
                  <p className="text-sm font-medium text-violet-900">
                    Now: CRO + container number
                  </p>
                  <p className="text-xs text-violet-800">
                    Booking is ready to convert (gate INVOICE_SENT + lifecycle CONFIRMED). Retry
                    posts convert-to-job (empty body first), then falls back to creating the job
                    directly if the convert API fails. Then Issue CRO / Allocate on the job Ops tab.
                  </p>
                  <p className="text-xs text-violet-900">
                    Gate: <strong>{booking.booking_status || '—'}</strong>
                    {' · '}
                    Lifecycle: <strong>{booking.lifecycle_status || '—'}</strong>
                    {linkedJobId ? (
                      <>
                        {' · '}
                        Job: <strong>{linkedJobId.slice(0, 8)}…</strong>
                      </>
                    ) : null}
                    {booking.shipper_id ? '' : ' · missing shipper_id (will resolve from form)'}
                    {booking.voyage_id ? '' : ' · missing voyage_id'}
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
                          await navigateToConvertedJob(raw, workflowInvoiceId);
                        }, 'Converted — open Ops for CRO / allocate.')
                      }
                    >
                      {actions.convertToJob.isPending
                        ? 'Converting…'
                        : 'Retry convert to job'}
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          </Card>

          {linkedJobId ? (
            <JobInvoicesPanel
              jobId={linkedJobId}
              job={
                {
                  id: linkedJobId,
                  shipper_id: booking.shipper_id,
                  job_type: linkedJobType,
                } as import('@/features/jobs/types/job.types').Job
              }
              highlightInvoiceId={workflowInvoiceId}
            />
          ) : workflowInvoiceId ? (
            <Card>
              <CardHeader>
                <CardTitle>Invoice</CardTitle>
              </CardHeader>
              <div className="space-y-2 px-4 pb-4">
                <p className="text-xs text-[var(--color-neutral-500)]">
                  Draft/sent invoice from Mark complete (will list under the job Invoices tab after
                  convert).
                </p>
                <Link
                  to={`${INVOICE_ROUTE_PREFIX}/${workflowInvoiceId}`}
                  className="text-sm font-medium text-[var(--color-primary-600)] underline"
                >
                  Open invoice
                </Link>
              </div>
            </Card>
          ) : null}

          <dl className="grid gap-4 rounded-md border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Voyage" value={booking.voyage_id} />
            <Field label="Enquiry" value={booking.enquiry_id} />
            <Field label="Cargo type" value={booking.cargo_type} />
            <Field label="HBL" value={booking.hbl_number} />
            <Field label="Job" value={booking.job_number ?? linkedJobId ?? booking.job_id} />
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
