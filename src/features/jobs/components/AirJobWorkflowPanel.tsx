import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { INVOICE_ROUTE_PREFIX } from '@/features/invoices/api/invoice.api';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { useInvalidateInvoices } from '@/features/invoices/hooks/useInvoices';
import { JobInvoicesPanel } from './JobInvoicesPanel';
import { jobService } from '../services/job.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { AirComplianceStaffPanel } from './AirComplianceStaffPanel';
import {
  AIR_BOOKING_FORM_LIMITS,
  clipAirField,
  normalizeAirportCode,
} from '../utils/airBookingFormLimits';
import { useAirJobWorkflow } from '../hooks/useAirJobWorkflow';
import {
  firstOpenAirStage,
  parallelPeersOpen,
  useAirWorkflowProgress,
} from '../hooks/useAirWorkflowProgress';
import { useJobAirBookingForm, useJob, useUpdateJobAirBookingForm } from '../hooks/useJobs';
import { useCustomerPortalBookingForm } from '@/features/portal-admin-inbox/hooks/usePortalAdminInbox';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import {
  AIR_COMMERCIAL_ACTION_ORDER,
  AIR_COMMERCIAL_STAGES,
  AIR_EXPORT_ACTION_ORDER,
  AIR_EXPORT_OPS_STAGES,
  AIR_IMPORT_ACTION_ORDER,
  AIR_IMPORT_OPS_STAGES,
  type AirWorkflowStageId,
} from '../constants/airWorkflow';
import type {
  AirBookingFormParty,
  MarkAirInvoiceSentDto,
  UpdateAirBookingFormDto,
} from '../types/job.types';

interface AirJobWorkflowPanelProps {
  jobId: string;
  jobType: string;
}

type AirFormUi = {
  commodity: string;
  pieces: string;
  gross_weight_kg: string;
  chargeable_weight_kg: string;
  volume_cbm: string;
  pallet_count: string;
  flight_number: string;
  flight_date: string;
  origin_airport_code: string;
  dest_airport_code: string;
  air_pallet_type_id: string;
  special_handling: string;
  notes: string;
  is_dg: boolean;
  mark_complete: boolean;
  arrival_flight_number: string;
  mawb_from_origin: string;
  agent_at_origin: string;
  delivery_address: string;
  customs_value: string;
  shipper_name: string;
  shipper_city: string;
  shipper_country: string;
  consignee_name: string;
  consignee_city: string;
  consignee_country: string;
  notify_name: string;
  pallets: { pallet_type: string; count: string; length_cm: string; width_cm: string; height_cm: string; weight_kg: string }[];
};

function emptyAirForm(): AirFormUi {
  return {
    commodity: '',
    pieces: '',
    gross_weight_kg: '',
    chargeable_weight_kg: '',
    volume_cbm: '',
    pallet_count: '',
    flight_number: '',
    flight_date: '',
    origin_airport_code: '',
    dest_airport_code: '',
    air_pallet_type_id: '',
    special_handling: '',
    notes: '',
    is_dg: false,
    mark_complete: true,
    arrival_flight_number: '',
    mawb_from_origin: '',
    agent_at_origin: '',
    delivery_address: '',
    customs_value: '',
    shipper_name: '',
    shipper_city: '',
    shipper_country: '',
    consignee_name: '',
    consignee_city: '',
    consignee_country: '',
    notify_name: '',
    pallets: [{ pallet_type: 'PMC', count: '1', length_cm: '', width_cm: '', height_cm: '', weight_kg: '' }],
  };
}

function applyPortalPayloadToAirForm(
  prev: AirFormUi,
  payload: PortalBookingFormMessagePayload,
  opts?: { overwrite?: boolean },
): AirFormUi {
  const overwrite = Boolean(opts?.overwrite);
  const pick = (current: string, next?: string) => {
    const n = (next ?? '').trim();
    if (!n) return current;
    if (overwrite || !current.trim()) return n;
    return current;
  };
  const parties = payload.parties ?? [];
  const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
  const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
  const notify = parties.find((p) => p.party_kind === 'NOTIFY');
  return {
    ...prev,
    commodity: pick(prev.commodity, payload.commodity),
    // Compliance form uses pol/pod (city names). Air booking needs IATA codes ≤10 — only copy when valid.
    origin_airport_code: pick(
      prev.origin_airport_code,
      normalizeAirportCode(payload.pol) || undefined,
    ),
    dest_airport_code: pick(
      prev.dest_airport_code,
      normalizeAirportCode(payload.pod) || undefined,
    ),
    notes: pick(prev.notes, payload.request_details),
    is_dg: overwrite || !prev.is_dg ? Boolean(payload.is_dg) : prev.is_dg,
    shipper_name: pick(prev.shipper_name, shipper?.full_name),
    shipper_city: pick(prev.shipper_city, shipper?.city),
    shipper_country: pick(prev.shipper_country, shipper?.country),
    consignee_name: pick(prev.consignee_name, consignee?.full_name),
    consignee_city: pick(prev.consignee_city, consignee?.city),
    consignee_country: pick(prev.consignee_country, consignee?.country),
    notify_name: pick(prev.notify_name, notify?.full_name),
  };
}

const EXPORT_PARALLEL = {
  uld: ['uld-request-issued', 'uld-allocated'] as const,
  'hawb-mawb': ['draft-hawb-issued', 'mawb-issued'] as const,
};

function StageRail({
  stages,
  current,
  done,
}: {
  stages: { id: AirWorkflowStageId; label: string; owner: string }[];
  current: AirWorkflowStageId;
  done: Partial<Record<AirWorkflowStageId, boolean>>;
}) {
  const idx = stages.findIndex((s) => s.id === current);
  return (
    <ol className="flex flex-wrap gap-1.5 text-[11px]">
      {stages.map((s, i) => {
        const complete = Boolean(done[s.id]) || (idx >= 0 && i < idx);
        const active = s.id === current;
        return (
          <li
            key={s.id}
            className={`rounded px-2 py-1 border ${
              active
                ? 'border-[var(--color-primary-400)] bg-[var(--color-primary-50)] text-[var(--color-primary-800)]'
                : complete
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-500)]'
            }`}
          >
            <span className="font-medium">{s.owner}</span> · {s.label}
          </li>
        );
      })}
    </ol>
  );
}

export function AirJobWorkflowPanel({ jobId, jobType }: AirJobWorkflowPanelProps) {
  const isExport = jobType === 'AIR_EXPORT';
  const isImport = jobType === 'AIR_IMPORT';
  const actions = useAirJobWorkflow(jobId);
  const { data: job } = useJob(jobId);
  const airBookingQuery = useJobAirBookingForm(jobId, isExport || isImport);
  const updateAirBooking = useUpdateJobAirBookingForm(jobId);
  const { done, markDone, isDone } = useAirWorkflowProgress(jobId ? `job:${jobId}` : '');
  const portalBookingQuery = useCustomerPortalBookingForm(
    { jobId, jobTypePrefix: 'AIR' },
    isExport || isImport,
  );

  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<AirFormUi>(emptyAirForm);
  const [portalPrefillApplied, setPortalPrefillApplied] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | undefined>();
  const invalidateInvoices = useInvalidateInvoices();

  useEffect(() => {
    markDone('quote-requested');
  }, [markDone]);

  useEffect(() => {
    const form = airBookingQuery.data;
    if (!form) return;
    if (form.mark_complete === true) markDone('booking-form-complete');
    const parties = form.parties ?? [];
    const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
    const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
    const notify = parties.find((p) => p.party_kind === 'NOTIFY');
    setBookingForm({
      commodity: String(form.commodity ?? '').slice(0, AIR_BOOKING_FORM_LIMITS.commodity),
      pieces: form.pieces != null ? String(form.pieces) : '',
      gross_weight_kg: form.gross_weight_kg != null ? String(form.gross_weight_kg) : '',
      chargeable_weight_kg:
        form.chargeable_weight_kg != null ? String(form.chargeable_weight_kg) : '',
      volume_cbm: form.volume_cbm != null ? String(form.volume_cbm) : '',
      pallet_count: form.pallet_count != null ? String(form.pallet_count) : '',
      flight_number: String(form.flight_number ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.flight_number,
      ),
      flight_date: String(form.flight_date ?? '').slice(0, 10),
      origin_airport_code:
        normalizeAirportCode(String(form.origin_airport_code ?? '')) ||
        normalizeAirportCode(job?.origin_port_code) ||
        '',
      dest_airport_code:
        normalizeAirportCode(String(form.dest_airport_code ?? '')) ||
        normalizeAirportCode(job?.dest_port_code) ||
        '',
      air_pallet_type_id: String(form.air_pallet_type_id ?? ''),
      special_handling: String(form.special_handling ?? ''),
      notes: String(form.notes ?? ''),
      is_dg: Boolean(form.is_dg),
      mark_complete: form.mark_complete !== false,
      arrival_flight_number: String(form.arrival_flight_number ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.arrival_flight_number,
      ),
      mawb_from_origin: String(form.mawb_from_origin ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.mawb_from_origin,
      ),
      agent_at_origin: String(form.agent_at_origin ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.agent_at_origin,
      ),
      delivery_address: String(form.delivery_address ?? ''),
      customs_value: form.customs_value != null ? String(form.customs_value) : '',
      shipper_name: String(shipper?.full_name ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.party_full_name,
      ),
      shipper_city: String(shipper?.city ?? '').slice(0, AIR_BOOKING_FORM_LIMITS.party_city),
      shipper_country: String(shipper?.country ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.party_country,
      ),
      consignee_name: String(consignee?.full_name ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.party_full_name,
      ),
      consignee_city: String(consignee?.city ?? '').slice(0, AIR_BOOKING_FORM_LIMITS.party_city),
      consignee_country: String(consignee?.country ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.party_country,
      ),
      notify_name: String(notify?.full_name ?? '').slice(
        0,
        AIR_BOOKING_FORM_LIMITS.party_full_name,
      ),
      pallets:
        Array.isArray(form.pallets) && form.pallets.length > 0
          ? form.pallets.map((p) => ({
              pallet_type: String(p.pallet_type ?? 'PMC'),
              count: p.count != null ? String(p.count) : '1',
              length_cm: p.length_cm != null ? String(p.length_cm) : '',
              width_cm: p.width_cm != null ? String(p.width_cm) : '',
              height_cm: p.height_cm != null ? String(p.height_cm) : '',
              weight_kg: p.weight_kg != null ? String(p.weight_kg) : '',
            }))
          : emptyAirForm().pallets,
    });
    setPortalPrefillApplied(false);
  }, [airBookingQuery.data, markDone, job?.origin_port_code, job?.dest_port_code]);

  useEffect(() => {
    const payload = portalBookingQuery.data;
    if (!payload || portalPrefillApplied) return;
    const apiForm = airBookingQuery.data;
    const apiHasParties = Boolean(apiForm?.parties?.some((p) => p.full_name?.trim()));
    const apiHasRoute = Boolean(
      String(apiForm?.origin_airport_code ?? '').trim() ||
        String(apiForm?.dest_airport_code ?? '').trim(),
    );
    if (apiHasParties || apiHasRoute) {
      setPortalPrefillApplied(true);
      return;
    }
    setBookingForm((prev) => applyPortalPayloadToAirForm(prev, payload, { overwrite: false }));
    setPortalPrefillApplied(true);
    setMessage(
      `Customer portal booking loaded (quote ${payload.quoteNumber || payload.quotationId.slice(0, 8)}). Review, complete Ops fields, then mark complete.`,
    );
  }, [portalBookingQuery.data, portalPrefillApplied, airBookingQuery.data]);

  const commercialCurrent = firstOpenAirStage(AIR_COMMERCIAL_ACTION_ORDER, isDone);
  const commercialDone = AIR_COMMERCIAL_ACTION_ORDER.every(isDone);

  const exportCurrent = firstOpenAirStage(AIR_EXPORT_ACTION_ORDER, isDone, {
    parallelGroups: EXPORT_PARALLEL,
  });
  const exportOpen = useMemo(
    () => parallelPeersOpen(exportCurrent, EXPORT_PARALLEL, isDone),
    [exportCurrent, isDone],
  );

  const importCurrent = firstOpenAirStage(AIR_IMPORT_ACTION_ORDER, isDone);

  const run = async (fn: () => Promise<unknown>, success?: string, complete?: AirWorkflowStageId) => {
    setActionError(null);
    setMessage(null);
    try {
      await fn();
      if (complete) markDone(complete);
      if (success) setMessage(success);
    } catch (err) {
      const detail = getErrorMessage(err);
      setActionError(detail);
      window.alert(detail);
    }
  };

  /** Create/reuse draft invoice with quotation charges, then return id for MarkAirInvoiceSentDto.invoice_id. */
  const ensureInvoiceIdForJob = async (): Promise<string> => {
    const fresh = job ?? (await jobService.getById(jobId));
    const { quotationService } = await import(
      '@/features/quotations/services/quotation.service'
    );
    const { quotationLinesToInvoiceLineDtos } = await import(
      '@/features/quotations/utils/quotationRevenueCharges'
    );

    const quotation = await quotationService.findLinkedToJob(jobId, {
      quotationId: portalBookingQuery.data?.quotationId,
      customerId: fresh.shipper_id || fresh.billing_party_id,
      jobType: fresh.job_type || jobType,
    });

    let jobForInvoice = fresh;
    if (quotation?.lines?.length) {
      try {
        jobForInvoice = await jobService.ensureChargesFromQuotation(jobId, quotation);
      } catch {
        jobForInvoice = fresh;
      }
    }

    const quotationLines = quotationLinesToInvoiceLineDtos(quotation?.lines);
    const invoice = await invoiceService.ensureDraftForJob({
      id: jobId,
      shipper_id: jobForInvoice.shipper_id,
      billing_party_id: jobForInvoice.billing_party_id,
      company_id: jobForInvoice.company_id,
      branch_id: jobForInvoice.branch_id,
      currency_code: quotation?.currency_code,
      charges: jobForInvoice.charges,
      quotationLines,
      lineHint: bookingForm.commodity.trim()
        ? `Air freight — ${bookingForm.commodity.trim()}`
        : `Air freight — ${jobType}`,
    });
    if (!invoice?.id || !isUuid(invoice.id)) {
      throw new Error('Invoice create returned no id.');
    }
    setLastInvoiceId(invoice.id);
    invalidateInvoices(invoice.id);
    return invoice.id;
  };

  const saveBookingForm = () =>
    run(async () => {
      const commodity = bookingForm.commodity.trim().slice(0, AIR_BOOKING_FORM_LIMITS.commodity);
      const origin = normalizeAirportCode(bookingForm.origin_airport_code);
      const dest = normalizeAirportCode(bookingForm.dest_airport_code);
      const shipperName = bookingForm.shipper_name
        .trim()
        .slice(0, AIR_BOOKING_FORM_LIMITS.party_full_name);
      const consigneeName = bookingForm.consignee_name
        .trim()
        .slice(0, AIR_BOOKING_FORM_LIMITS.party_full_name);

      if (bookingForm.mark_complete) {
        // Exact gate: … → CUSTOMER_ACCEPTED → BOOKING_FORM_COMPLETE (do not skip).
        if (!isDone('customer-accepted')) {
          throw new Error(
            'Gate order: complete CUSTOMER_ACCEPTED first (portal Approve / Mark approved), then booking form.',
          );
        }
        if (!commodity || !origin || !dest) {
          throw new Error(
            'To mark complete, fill commodity and IATA airport codes (origin/dest, max 10 chars, e.g. DXB).',
          );
        }
        if (!shipperName || !consigneeName) {
          throw new Error('To mark complete, fill shipper and consignee names.');
        }
        if (isExport && !bookingForm.pieces.trim()) {
          throw new Error('To mark complete on export, fill pieces.');
        }
      }

      const parties: AirBookingFormParty[] = [
        {
          party_kind: 'SHIPPER',
          full_name: shipperName || 'Shipper TBD',
          city: clipAirField(bookingForm.shipper_city, AIR_BOOKING_FORM_LIMITS.party_city),
          country: clipAirField(
            bookingForm.shipper_country,
            AIR_BOOKING_FORM_LIMITS.party_country,
          ),
          entity_kind: 'COMPANY',
        },
        {
          party_kind: 'CONSIGNEE',
          full_name: consigneeName || 'Consignee TBD',
          city: clipAirField(bookingForm.consignee_city, AIR_BOOKING_FORM_LIMITS.party_city),
          country: clipAirField(
            bookingForm.consignee_country,
            AIR_BOOKING_FORM_LIMITS.party_country,
          ),
          entity_kind: 'COMPANY',
        },
        {
          party_kind: 'NOTIFY',
          full_name: (
            bookingForm.notify_name.trim() ||
            consigneeName ||
            'Same as consignee'
          ).slice(0, AIR_BOOKING_FORM_LIMITS.party_full_name),
          entity_kind: 'COMPANY',
        },
      ];

      const dto: UpdateAirBookingFormDto = {
        parties,
        commodity: commodity || undefined,
        flight_number: clipAirField(
          bookingForm.flight_number,
          AIR_BOOKING_FORM_LIMITS.flight_number,
        ),
        flight_date: bookingForm.flight_date.trim() || undefined,
        origin_airport_code: origin || undefined,
        dest_airport_code: dest || undefined,
        special_handling: bookingForm.special_handling.trim() || undefined,
        notes: bookingForm.notes.trim() || undefined,
        is_dg: bookingForm.is_dg,
        mark_complete: bookingForm.mark_complete,
        arrival_flight_number: clipAirField(
          bookingForm.arrival_flight_number,
          AIR_BOOKING_FORM_LIMITS.arrival_flight_number,
        ),
        mawb_from_origin: clipAirField(
          bookingForm.mawb_from_origin,
          AIR_BOOKING_FORM_LIMITS.mawb_from_origin,
        ),
        agent_at_origin: clipAirField(
          bookingForm.agent_at_origin,
          AIR_BOOKING_FORM_LIMITS.agent_at_origin,
        ),
        delivery_address: bookingForm.delivery_address.trim() || undefined,
      };
      if (bookingForm.pieces.trim()) {
        const pieces = Number(bookingForm.pieces);
        if (!Number.isFinite(pieces) || pieces < 1) {
          throw new Error('Pieces must be a number ≥ 1.');
        }
        dto.pieces = pieces;
      }
      if (bookingForm.gross_weight_kg.trim()) {
        const w = Number(bookingForm.gross_weight_kg);
        if (!Number.isFinite(w) || w < 0) {
          throw new Error('Gross weight must be a number ≥ 0.');
        }
        dto.gross_weight_kg = w;
      }
      if (bookingForm.chargeable_weight_kg.trim()) {
        const w = Number(bookingForm.chargeable_weight_kg);
        if (!Number.isFinite(w) || w < 0) {
          throw new Error('Chargeable weight must be a number ≥ 0.');
        }
        dto.chargeable_weight_kg = w;
      }
      if (bookingForm.volume_cbm.trim()) {
        const v = Number(bookingForm.volume_cbm);
        if (!Number.isFinite(v) || v < 0) {
          throw new Error('Volume CBM must be a number ≥ 0.');
        }
        dto.volume_cbm = v;
      }
      if (bookingForm.pallet_count.trim()) {
        const n = Number(bookingForm.pallet_count);
        if (!Number.isFinite(n) || n < 0) {
          throw new Error('Pallet count must be a number ≥ 0.');
        }
        dto.pallet_count = n;
      }
      const pallets = bookingForm.pallets
        .map((p) => ({
          pallet_type: p.pallet_type.trim(),
          count: Number(p.count),
          length_cm: p.length_cm.trim() ? Number(p.length_cm) : undefined,
          width_cm: p.width_cm.trim() ? Number(p.width_cm) : undefined,
          height_cm: p.height_cm.trim() ? Number(p.height_cm) : undefined,
          weight_kg: p.weight_kg.trim() ? Number(p.weight_kg) : undefined,
        }))
        .filter((p) => p.pallet_type && Number.isFinite(p.count) && p.count >= 1);
      if (pallets.length) dto.pallets = pallets;
      if (bookingForm.customs_value.trim()) {
        const v = Number(bookingForm.customs_value);
        if (!Number.isFinite(v)) {
          throw new Error('Customs value must be a number.');
        }
        dto.customs_value = v;
      }

      // Draft first, then mark_complete → BOOKING_FORM_COMPLETE, then auto invoice.
      await updateAirBooking.mutateAsync({ ...dto, mark_complete: false });
      if (!bookingForm.mark_complete) return;

      await updateAirBooking.mutateAsync({
        ...dto,
        mark_complete: true,
        admin_override: true,
        stage_override_reason:
          'Staff assist: marking BOOKING_FORM_COMPLETE after customer accept / Ops review.',
      });
      markDone('booking-form-complete');

      // Auto: BOOKING_FORM_COMPLETE → INVOICE_SENT (creates draft invoice + marks sent).
      // Air job shell already exists — invoice unlocks AIR_EXPORT / AIR_IMPORT ops (no separate convert-to-job).
      const invoiceId = await ensureInvoiceIdForJob();
      try {
        await actions.sendInvoice.mutateAsync({
          invoice_id: invoiceId,
          admin_override: true,
          stage_override_reason:
            'Auto send-invoice after BOOKING_FORM_COMPLETE (booking form Mark complete).',
        } satisfies MarkAirInvoiceSentDto);
      } catch (err) {
        const detail = getErrorMessage(err);
        if (/intermediate stages|current:\s*quote_sent/i.test(detail)) {
          throw new Error(
            `${detail} Customer must accept in the portal (CUSTOMER_ACCEPTED) and the booking form must reach BOOKING_FORM_COMPLETE on the server before invoice auto-generate. Local UI checkmarks are not enough.`,
          );
        }
        throw err;
      }
      setLastInvoiceId(invoiceId);
      invalidateInvoices(invoiceId);
      markDone('invoice-sent');
    }, 'BOOKING_FORM_COMPLETE → invoice generated with quotation charges (INVOICE_SENT). See Invoices section below.', 'invoice-sent');

  const sendInvoice = () =>
    run(async () => {
      const form =
        airBookingQuery.data ??
        (await airBookingQuery.refetch().then((r) => r.data));
      if (form?.mark_complete !== true && !isDone('booking-form-complete')) {
        throw new Error(
          'Gate order: complete BOOKING_FORM_COMPLETE first (Save booking form with Mark complete). Invoice is generated automatically when the form is marked complete.',
        );
      }
      const invoiceId = await ensureInvoiceIdForJob();
      try {
        await actions.sendInvoice.mutateAsync({
          invoice_id: invoiceId,
          admin_override: true,
          stage_override_reason: 'Staff retry send-invoice after booking form complete.',
        } satisfies MarkAirInvoiceSentDto);
      } catch (err) {
        const detail = getErrorMessage(err);
        if (/intermediate stages|current:\s*quote_sent/i.test(detail)) {
          throw new Error(
            `${detail} Customer must accept in the portal (CUSTOMER_ACCEPTED) and the booking form must reach BOOKING_FORM_COMPLETE on the server before Send invoice.`,
          );
        }
        throw err;
      }
      setLastInvoiceId(invoiceId);
      invalidateInvoices(invoiceId);
    }, 'INVOICE_SENT — export/import ops unlocked. Invoice listed below.', 'invoice-sent');

  const showStage = (id: AirWorkflowStageId) => {
    if (!commercialDone) return commercialCurrent === id;
    if (isExport) return exportOpen.includes(id);
    if (isImport) return importCurrent === id;
    return false;
  };

  return (
    <div className="space-y-4">
      <AirComplianceStaffPanel jobId={jobId} />
      <Card>
        <CardHeader>
          <CardTitle>Air shared commercial</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <StageRail
            stages={AIR_COMMERCIAL_STAGES.map((s) => ({
              id: s.id,
              label: s.label,
              owner: s.owner,
            }))}
            current={commercialDone ? 'invoice-sent' : commercialCurrent}
            done={done}
          />
          <p className="text-sm text-[var(--color-neutral-500)]">
            Exact gate order: QUOTE_REQUESTED → CS_TRIAGED → QUOTE_SENT → CUSTOMER_ACCEPTED →
            BOOKING_FORM_COMPLETE → automatically generates the invoice with the same charges as the
            quotation (INVOICE_SENT) and unlocks AIR_EXPORT / AIR_IMPORT ops on this job. The air job
            shell already exists — no separate convert-to-job step.
          </p>
          {actionError ? (
            <p className="text-sm text-[var(--color-danger-600)]">{actionError}</p>
          ) : null}
          {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}

          {showStage('cs-triaged') ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="text-sm font-medium text-amber-900">Now: CS_TRIAGED</p>
              <Button
                type="button"
                disabled={actions.csTriage.isPending}
                onClick={() =>
                  run(
                    () => actions.csTriage.mutateAsync({}),
                    'CS triaged — portal access granted.',
                    'cs-triaged',
                  )
                }
              >
                CS triage
              </Button>
            </div>
          ) : null}

          {showStage('quote-sent') ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="text-sm font-medium text-amber-900">Now: QUOTE_SENT</p>
              <Button
                type="button"
                disabled={actions.markQuoteSent.isPending}
                onClick={() =>
                  run(
                    () => actions.markQuoteSent.mutateAsync({}),
                    'Quote sent — wait for customer accept.',
                    'quote-sent',
                  )
                }
              >
                Mark quote sent
              </Button>
            </div>
          ) : null}

          {showStage('customer-accepted') ? (
            <div className="rounded-md border border-sky-200 bg-sky-50 p-3 space-y-2">
              <p className="text-sm font-medium text-sky-900">Now: CUSTOMER_ACCEPTED</p>
              <p className="text-xs text-sky-800">
                Customer must accept in the portal (
                <code className="text-[10px]">POST /portal/shipments/:id/accept</code>
                ). That sets <strong>CUSTOMER_ACCEPTED</strong> on the server. A local continue
                click alone will not unlock Send invoice (API still rejects jumps from QUOTE_SENT).
              </p>
              <Button
                type="button"
                onClick={() => {
                  markDone('customer-accepted');
                  setMessage(
                    'Marked locally — confirm portal accept succeeded before completing the booking form / invoice.',
                  );
                }}
              >
                Customer accepted — continue to booking form
              </Button>
            </div>
          ) : null}

          {showStage('booking-form-complete') ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 space-y-3">
              <p className="text-sm font-medium text-emerald-900">Now: BOOKING_FORM_COMPLETE</p>
              <p className="text-xs text-emerald-800">
                Customer submits{' '}
                <code className="text-[10px]">/portal/shipments/:id/compliance-form</code> (
                <code className="text-[10px]">UpsertNvoccBookingFormDto</code>
                ). Admin / sales can also complete the Ops air booking form below (
                <code className="text-[10px]">UpsertAirBookingFormDto</code>
                ) — IATA airport codes max 10 (e.g. DXB), not full city names from portal pol/pod.
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
              {airBookingQuery.isError ? (
                <p className="text-sm text-[var(--color-danger-600)]">
                  {getErrorMessage(airBookingQuery.error)}
                </p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ['commodity', 'Commodity', AIR_BOOKING_FORM_LIMITS.commodity, 'text'],
                    ['pieces', 'Pieces (≥ 1)', undefined, 'number'],
                    ['gross_weight_kg', 'Gross weight kg', undefined, 'number'],
                    ['chargeable_weight_kg', 'Chargeable weight kg', undefined, 'number'],
                    ['volume_cbm', 'Volume CBM', undefined, 'number'],
                    ['pallet_count', 'Pallet count', undefined, 'number'],
                    [
                      'flight_number',
                      'Flight number',
                      AIR_BOOKING_FORM_LIMITS.flight_number,
                      'text',
                    ],
                    ['flight_date', 'Flight date', undefined, 'date'],
                    [
                      'origin_airport_code',
                      'Origin airport code (e.g. DXB)',
                      AIR_BOOKING_FORM_LIMITS.origin_airport_code,
                      'text',
                    ],
                    [
                      'dest_airport_code',
                      'Dest airport code (e.g. LHR)',
                      AIR_BOOKING_FORM_LIMITS.dest_airport_code,
                      'text',
                    ],
                    ['special_handling', 'Special handling', undefined, 'text'],
                    ['notes', 'Notes', undefined, 'text'],
                    [
                      'shipper_name',
                      'Shipper name',
                      AIR_BOOKING_FORM_LIMITS.party_full_name,
                      'text',
                    ],
                    ['shipper_city', 'Shipper city', AIR_BOOKING_FORM_LIMITS.party_city, 'text'],
                    [
                      'shipper_country',
                      'Shipper country',
                      AIR_BOOKING_FORM_LIMITS.party_country,
                      'text',
                    ],
                    [
                      'consignee_name',
                      'Consignee name',
                      AIR_BOOKING_FORM_LIMITS.party_full_name,
                      'text',
                    ],
                    [
                      'consignee_city',
                      'Consignee city',
                      AIR_BOOKING_FORM_LIMITS.party_city,
                      'text',
                    ],
                    [
                      'consignee_country',
                      'Consignee country',
                      AIR_BOOKING_FORM_LIMITS.party_country,
                      'text',
                    ],
                    [
                      'notify_name',
                      'Notify name',
                      AIR_BOOKING_FORM_LIMITS.party_full_name,
                      'text',
                    ],
                    ...(isImport
                      ? ([
                          [
                            'arrival_flight_number',
                            'Arrival flight',
                            AIR_BOOKING_FORM_LIMITS.arrival_flight_number,
                            'text',
                          ],
                          [
                            'mawb_from_origin',
                            'MAWB from origin',
                            AIR_BOOKING_FORM_LIMITS.mawb_from_origin,
                            'text',
                          ],
                          [
                            'agent_at_origin',
                            'Agent at origin',
                            AIR_BOOKING_FORM_LIMITS.agent_at_origin,
                            'text',
                          ],
                          ['delivery_address', 'Delivery address', undefined, 'text'],
                          ['customs_value', 'Customs value', undefined, 'number'],
                        ] as const)
                      : []),
                  ] as const
                ).map(([key, label, maxLen, inputType]) => (
                  <label key={key} className="block text-xs font-medium text-gray-600">
                    {label}
                    {maxLen != null ? (
                      <span className="ml-1 font-normal text-gray-400">≤{maxLen}</span>
                    ) : null}
                    <Input
                      className="mt-1"
                      type={inputType}
                      maxLength={maxLen}
                      value={String(bookingForm[key as keyof AirFormUi] ?? '')}
                      onChange={(e) => {
                        let next = e.target.value;
                        if (
                          key === 'origin_airport_code' ||
                          key === 'dest_airport_code'
                        ) {
                          next = next.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                        } else if (typeof maxLen === 'number') {
                          next = next.slice(0, maxLen);
                        }
                        setBookingForm((prev) => ({ ...prev, [key]: next }));
                      }}
                      placeholder={
                        key === 'origin_airport_code' || key === 'dest_airport_code'
                          ? 'IATA e.g. DXB'
                          : undefined
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Pallets (AirPalletLineDto)</p>
                {bookingForm.pallets.map((line, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {(
                      [
                        ['pallet_type', 'Type'],
                        ['count', 'Count'],
                        ['length_cm', 'L cm'],
                        ['width_cm', 'W cm'],
                        ['height_cm', 'H cm'],
                        ['weight_kg', 'Weight kg'],
                      ] as const
                    ).map(([field, label]) => (
                      <label key={field} className="block text-xs font-medium text-gray-600">
                        {label}
                        <Input
                          className="mt-1"
                          type={field === 'pallet_type' ? 'text' : 'number'}
                          maxLength={field === 'pallet_type' ? 30 : undefined}
                          value={line[field]}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              pallets: prev.pallets.map((p, i) =>
                                i === idx ? { ...p, [field]: e.target.value } : p,
                              ),
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setBookingForm((prev) => ({
                      ...prev,
                      pallets: [
                        ...prev.pallets,
                        {
                          pallet_type: 'PMC',
                          count: '1',
                          length_cm: '',
                          width_cm: '',
                          height_cm: '',
                          weight_kg: '',
                        },
                      ],
                    }))
                  }
                >
                  Add pallet line
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bookingForm.is_dg}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, is_dg: e.target.checked }))
                    }
                  />
                  Dangerous goods
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bookingForm.mark_complete}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, mark_complete: e.target.checked }))
                    }
                  />
                  Mark complete
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={airBookingQuery.isFetching}
                  onClick={() => void airBookingQuery.refetch()}
                >
                  Reload form
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={portalBookingQuery.isFetching || !portalBookingQuery.data}
                  onClick={() => {
                    const payload = portalBookingQuery.data;
                    if (!payload) return;
                    setBookingForm((prev) =>
                      applyPortalPayloadToAirForm(prev, payload, { overwrite: true }),
                    );
                    setMessage(
                      `Applied customer portal booking (quote ${payload.quoteNumber || payload.quotationId.slice(0, 8)}).`,
                    );
                  }}
                >
                  {portalBookingQuery.isFetching
                    ? 'Loading portal…'
                    : 'Load customer portal booking'}
                </Button>
                <Button
                  type="button"
                  disabled={
                    updateAirBooking.isPending ||
                    airBookingQuery.isLoading
                  }
                  onClick={() => void saveBookingForm()}
                >
                  {bookingForm.mark_complete
                    ? 'Save form → complete + auto invoice'
                    : 'Save booking form draft'}
                </Button>
              </div>
            </div>
          ) : null}

          {showStage('invoice-sent') ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 space-y-2">
              <p className="text-sm font-medium text-emerald-900">Now: INVOICE_SENT</p>
              <p className="text-xs text-emerald-800">
                Invoice is generated automatically when the booking form is marked complete. Use
                this only if auto-invoice failed — creates/reuses a draft invoice, then{' '}
                <code>POST /jobs/:id/air/send-invoice</code>. Job needs a shipper party.
              </p>
              {lastInvoiceId ? (
                <p className="text-xs text-emerald-900">
                  Invoice:{' '}
                  <Link
                    to={`${INVOICE_ROUTE_PREFIX}/${lastInvoiceId}`}
                    className="font-medium underline"
                  >
                    Open invoice
                  </Link>
                  {' · '}
                  see Invoices section below / job Invoices tab.
                </p>
              ) : null}
              <Button
                type="button"
                disabled={actions.sendInvoice.isPending}
                onClick={() => void sendInvoice()}
              >
                Retry send invoice
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      {(isDone('invoice-sent') || commercialDone || lastInvoiceId) && (
        <JobInvoicesPanel jobId={jobId} job={job} highlightInvoiceId={lastInvoiceId} />
      )}

      {commercialDone && isExport ? (
        <Card>
          <CardHeader>
            <CardTitle>AIR_EXPORT ops</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-4 pb-4">
            <StageRail
              stages={AIR_EXPORT_OPS_STAGES.map((s) => ({
                id: s.id,
                label: s.label,
                owner: s.owner,
              }))}
              current={exportCurrent}
              done={done}
            />
            <p className="text-xs text-[var(--color-neutral-500)]">
              After invoice: cargo drop-off → BUILD_UP → DRAFT_HAWB_ISSUED ∥ MAWB_ISSUED →
              PAYMENT_RECEIVED → FINAL_HAWB_ISSUED → CLOSED. Air pallet / ULD request APIs were
              removed from the backend.
            </p>

            {exportOpen.includes('uld-request-issued') || exportOpen.includes('uld-allocated') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-3">
                <p className="text-sm font-medium text-violet-900">ULD / air pallet (removed)</p>
                <p className="text-xs text-violet-800">
                  <code className="text-[10px]">GET/POST /jobs/:id/air/uld-requests</code> is no
                  longer available. Mark these flowchart steps done to continue export ops.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      markDone('uld-request-issued');
                      markDone('uld-allocated');
                      setMessage('ULD stages skipped (API removed) — continue to cargo drop-off.');
                      setActionError(null);
                    }}
                  >
                    Skip ULD stages — continue
                  </Button>
                </div>
              </div>
            ) : null}

            {showStage('cargo-dropped-off') ? (
              <div className="rounded-md border border-sky-200 bg-sky-50 p-3 space-y-2">
                <p className="text-sm font-medium text-sky-900">Now: CARGO_DROPPED_OFF</p>
                <p className="text-xs text-sky-800">
                  Customer confirms cargo drop-off when ready (portal). Air ULD line APIs were
                  removed with air pallet.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    markDone('cargo-dropped-off');
                    setMessage('Cargo drop-off recorded — next: Build-up.');
                  }}
                >
                  Drop-off confirmed — continue
                </Button>
              </div>
            ) : null}

            {showStage('build-up') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-2">
                <p className="text-sm font-medium text-violet-900">Now: BUILD_UP</p>
                <Button
                  type="button"
                  disabled={actions.stageBuildUp.isPending}
                  onClick={() =>
                    run(
                      () => actions.stageBuildUp.mutateAsync({}),
                      'Build-up recorded.',
                      'build-up',
                    )
                  }
                >
                  Mark build-up
                </Button>
              </div>
            ) : null}

            {exportOpen.includes('draft-hawb-issued') || exportOpen.includes('mawb-issued') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-2">
                <p className="text-sm font-medium text-violet-900">
                  Now: DRAFT_HAWB_ISSUED ∥ MAWB_ISSUED
                </p>
                <p className="text-xs text-violet-800">
                  Parallel after build-up. Portal may request draft HAWB first; then staff gated
                  draft HAWB. MAWB issued can run alongside.
                </p>
                <div className="flex flex-wrap gap-2">
                  {!isDone('draft-hawb-issued') ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={actions.hawbDraftGated.isPending}
                      onClick={() =>
                        run(
                          () => actions.hawbDraftGated.mutateAsync({}),
                          'Draft HAWB issued (gated).',
                          'draft-hawb-issued',
                        )
                      }
                    >
                      Draft HAWB (gated)
                    </Button>
                  ) : null}
                  {!isDone('mawb-issued') ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={actions.stageMawbIssued.isPending}
                      onClick={() =>
                        run(
                          () => actions.stageMawbIssued.mutateAsync({}),
                          'MAWB issued.',
                          'mawb-issued',
                        )
                      }
                    >
                      MAWB issued
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {showStage('payment-received') ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
                <p className="text-sm font-medium text-amber-900">Now: PAYMENT_RECEIVED</p>
                <Button
                  type="button"
                  disabled={actions.confirmPayment.isPending}
                  onClick={() =>
                    run(
                      () => actions.confirmPayment.mutateAsync({}),
                      'Payment received.',
                      'payment-received',
                    )
                  }
                >
                  Confirm payment
                </Button>
              </div>
            ) : null}

            {showStage('final-hawb-issued') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-2">
                <p className="text-sm font-medium text-violet-900">Now: FINAL_HAWB_ISSUED</p>
                <Button
                  type="button"
                  disabled={actions.hawbFinalGated.isPending}
                  onClick={() =>
                    run(
                      () => actions.hawbFinalGated.mutateAsync({}),
                      'Final HAWB issued.',
                      'final-hawb-issued',
                    )
                  }
                >
                  Final HAWB (gated)
                </Button>
              </div>
            ) : null}

            {showStage('closed') ? (
              <div className="rounded-md border border-slate-300 bg-slate-50 p-3 space-y-2">
                <p className="text-sm font-medium text-slate-900">Now: CLOSED</p>
                <Button
                  type="button"
                  disabled={actions.closeReport.isPending}
                  onClick={() =>
                    run(
                      () => actions.closeReport.mutateAsync({}),
                      'Export closed.',
                      'closed',
                    )
                  }
                >
                  Close report
                </Button>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {commercialDone && isImport ? (
        <Card>
          <CardHeader>
            <CardTitle>AIR_IMPORT ops</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-4 pb-4">
            <StageRail
              stages={AIR_IMPORT_OPS_STAGES.map((s) => ({
                id: s.id,
                label: s.label,
                owner: s.owner,
              }))}
              current={importCurrent}
              done={done}
            />
            <p className="text-xs text-[var(--color-neutral-500)]">
              After invoice: MAWB_RECEIVED → PRE_CAN_ISSUED → CAN_ISSUED → PAYMENT_RECEIVED →
              DELIVERY_ORDER_ISSUED → POD_RECEIVED → CLOSED
            </p>

            {showStage('mawb-received') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-2">
                <p className="text-sm font-medium text-violet-900">Now: MAWB_RECEIVED</p>
                <Button
                  type="button"
                  disabled={actions.stageMawbReceived.isPending}
                  onClick={() =>
                    run(
                      () => actions.stageMawbReceived.mutateAsync({}),
                      'MAWB received.',
                      'mawb-received',
                    )
                  }
                >
                  MAWB received
                </Button>
              </div>
            ) : null}

            {showStage('pre-can-issued') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-2">
                <p className="text-sm font-medium text-violet-900">Now: PRE_CAN_ISSUED</p>
                <Button
                  type="button"
                  disabled={actions.preCanGated.isPending}
                  onClick={() =>
                    run(
                      () => actions.preCanGated.mutateAsync({}),
                      'Pre-CAN issued.',
                      'pre-can-issued',
                    )
                  }
                >
                  Pre-CAN (gated)
                </Button>
              </div>
            ) : null}

            {showStage('can-issued') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-2">
                <p className="text-sm font-medium text-violet-900">Now: CAN_ISSUED</p>
                <Button
                  type="button"
                  disabled={actions.canGated.isPending}
                  onClick={() =>
                    run(() => actions.canGated.mutateAsync({}), 'CAN issued.', 'can-issued')
                  }
                >
                  CAN (gated)
                </Button>
              </div>
            ) : null}

            {showStage('payment-received') ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
                <p className="text-sm font-medium text-amber-900">Now: PAYMENT_RECEIVED</p>
                <Button
                  type="button"
                  disabled={actions.confirmPayment.isPending}
                  onClick={() =>
                    run(
                      () => actions.confirmPayment.mutateAsync({}),
                      'Payment received.',
                      'payment-received',
                    )
                  }
                >
                  Confirm payment
                </Button>
              </div>
            ) : null}

            {showStage('delivery-order-issued') ? (
              <div className="rounded-md border border-violet-200 bg-violet-50 p-3 space-y-2">
                <p className="text-sm font-medium text-violet-900">Now: DELIVERY_ORDER_ISSUED</p>
                <p className="text-xs text-violet-800">
                  Customer may request DO in portal first, then staff issues gated DO.
                </p>
                <Button
                  type="button"
                  disabled={actions.deliveryOrderGated.isPending}
                  onClick={() =>
                    run(
                      () => actions.deliveryOrderGated.mutateAsync({}),
                      'Delivery order issued.',
                      'delivery-order-issued',
                    )
                  }
                >
                  Delivery order (gated)
                </Button>
              </div>
            ) : null}

            {showStage('pod-received') ? (
              <div className="rounded-md border border-sky-200 bg-sky-50 p-3 space-y-2">
                <p className="text-sm font-medium text-sky-900">Now: POD_RECEIVED</p>
                <Button
                  type="button"
                  disabled={actions.stagePod.isPending}
                  onClick={() =>
                    run(() => actions.stagePod.mutateAsync({}), 'POD received.', 'pod-received')
                  }
                >
                  POD received
                </Button>
              </div>
            ) : null}

            {showStage('closed') ? (
              <div className="rounded-md border border-slate-300 bg-slate-50 p-3 space-y-2">
                <p className="text-sm font-medium text-slate-900">Now: CLOSED</p>
                <Button
                  type="button"
                  disabled={actions.closeReport.isPending}
                  onClick={() =>
                    run(
                      () => actions.closeReport.mutateAsync({}),
                      'Import closed.',
                      'closed',
                    )
                  }
                >
                  Close report
                </Button>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
