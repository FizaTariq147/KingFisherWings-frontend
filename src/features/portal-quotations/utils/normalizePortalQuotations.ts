import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import { normalizeNegotiationPricing } from '@/features/quotations/utils/normalizeQuotationExtended';
import { resolveCustomerFacingQuoteStatus } from '@/features/quotations/utils/customerQuoteDecision';
import type {
  PortalQuotationDetail,
  PortalQuotationListItem,
  PortalQuotationListResult,
  PortalQuotationSummary,
  PortalQuotationPackage,
  PortalBookingForm,
  PortalBookingFormParty,
} from '../types/portalQuotations.types';

function portLabel(record: Record<string, unknown>, side: 'origin' | 'dest'): string {
  const nested =
    asRecord(record[`${side}_port`]) ||
    asRecord(record[side]) ||
    asRecord(record[side === 'dest' ? 'destination' : 'origin']);
  const code = pickString(
    record[`${side}_port_code`],
    record[side === 'dest' ? 'destPortCode' : 'originPortCode'],
    nested?.un_locode,
    nested?.code,
    nested?.port_code,
  );
  const name = pickString(
    record[`${side}_port_name`],
    record[side === 'dest' ? 'destPortName' : 'originPortName'],
    record[`${side}_name`],
    record[side === 'dest' ? 'destination' : 'origin'],
    nested?.name,
    nested?.city,
  );
  if (code && name && code !== name) return `${code} — ${name}`;
  if (code || name) return code || name;

  // Portal enquiries may only keep the typed route in special_requirements.
  const notes = pickString(record.special_requirements, record.specialRequirements);
  if (notes) {
    const customerRoute = notes.match(
      /Customer route:\s*([^\n→\-]+?)\s*(?:→|->|–|-)\s*([^\n]+)/i,
    );
    if (customerRoute) {
      const value = (side === 'origin' ? customerRoute[1] : customerRoute[2])?.trim();
      if (value && value !== '—') return value;
    }
    const key = side === 'origin' ? 'Origin port' : 'Destination port';
    const match = notes.match(new RegExp(`${key}:\\s*([^\\n;]+)`, 'i'));
    if (match?.[1]?.trim()) return match[1].trim();
  }

  return '';
}

const OPEN_QUOTE_STATUSES = new Set([
  'DRAFT',
  'SUBMITTED',
  'INTERNALLY_APPROVED',
  'SENT',
  'CUSTOMER_REVIEW',
  'NEGOTIATING',
  'PENDING',
  'OPEN',
]);

function sumByStatus(byStatus: Record<string, number>, statuses: Set<string>) {
  return Object.entries(byStatus).reduce((sum, [status, count]) => {
    return statuses.has(status.toUpperCase()) ? sum + count : sum;
  }, 0);
}

export function normalizeQuotationSummary(raw: unknown): PortalQuotationSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const byStatusRaw = asRecord(data.by_status) ?? asRecord(data.byStatus) ?? {};
  const byStatus: Record<string, number> = {};
  for (const [k, v] of Object.entries(byStatusRaw)) {
    const n = pickNumber(v);
    if (n !== undefined) byStatus[k] = n;
  }

  const byStatusTotal = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

  return {
    total: pickNumber(data.total, data.count, data.quotations_total, data.quotes_total) ?? byStatusTotal,
    open:
      pickNumber(
        data.open,
        data.pending,
        data.active,
        data.open_count,
        data.openCount,
        data.pending_count,
        data.pendingCount,
        data.pending_quotations,
        data.pendingQuotations,
        data.awaiting,
        data.awaiting_approval,
        data.awaitingApproval,
      ) ?? sumByStatus(byStatus, OPEN_QUOTE_STATUSES),
    won:
      pickNumber(data.won, data.approved) ??
      sumByStatus(byStatus, new Set(['APPROVED', 'WON', 'CONVERTED'])),
    lost:
      pickNumber(data.lost, data.rejected, data.disapproved) ??
      sumByStatus(byStatus, new Set(['REJECTED', 'DISAPPROVED', 'LOST', 'EXPIRED'])),
    byStatus,
    raw: data,
  };
}

export function normalizeQuotationListItem(raw: unknown): PortalQuotationListItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id);
  if (!id) return null;
  return {
    id,
    number:
      pickString(record.number, record.quotation_number, record.quotationNumber, record.ref) || id,
    status: resolveCustomerFacingQuoteStatus(id, pickString(record.status) || undefined, record, {
      useMemory: true,
    }),
    jobType: pickString(record.job_type, record.jobType) || undefined,
    currencyCode: pickString(record.currency_code, record.currencyCode, record.currency) || undefined,
    origin: portLabel(record, 'origin') || undefined,
    destination: portLabel(record, 'dest') || undefined,
    validUntil: pickString(record.valid_until, record.validUntil) || undefined,
    createdAt: pickString(record.created_at, record.createdAt) || undefined,
    raw: record,
  };
}

export function normalizeQuotationList(
  raw: unknown,
  params: { page?: number; limit?: number },
): PortalQuotationListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'quotations', 'data']);
  const normalized = items
    .map(normalizeQuotationListItem)
    .filter((q): q is PortalQuotationListItem => Boolean(q));
  return {
    items: normalized,
    meta: normalizeMeta(meta, normalized.length, params),
  };
}

export function normalizeQuotationDetail(raw: unknown): PortalQuotationDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return null;
  const base = normalizeQuotationListItem(data);
  if (!base) return null;

  const linesRaw = data.lines ?? data.charge_lines ?? data.items;
  const lines = Array.isArray(linesRaw)
    ? linesRaw
        .map((line) => {
          const r = asRecord(line);
          if (!r) return null;
          const id = pickString(r.id) || pickString(r.description) || Math.random().toString(36);
          const amount = pickNumber(r.amount, r.total, r.line_total, r.lineTotal);
          const unitPrice = pickNumber(r.unit_price, r.unitPrice);
          const quantity = pickNumber(r.quantity, r.qty) ?? 1;
          return {
            id,
            description: pickString(r.description, r.name, r.charge_name, r.charge_code) || 'Line',
            amount: amount ?? (unitPrice != null ? unitPrice * quantity : undefined),
            currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
            chargeCode: pickString(r.charge_code, r.chargeCode, r.code) || undefined,
            unit: pickString(r.unit) || undefined,
            quantity,
            unitPrice: unitPrice ?? undefined,
            taxPercent: pickNumber(r.tax_percent, r.taxPercent, r.tax_rate, r.taxRate),
            taxAmount: pickNumber(r.tax_amount, r.taxAmount),
            exchangeRate: pickNumber(r.exchange_rate, r.exchangeRate),
            pricingSource: pickString(r.pricing_source, r.pricingSource, r.source) || undefined,
          };
        })
        .filter((l): l is NonNullable<typeof l> => Boolean(l))
    : undefined;

  const snapshotRaw =
    asRecord(data.portal_estimate_snapshot) ??
    asRecord(data.portalEstimateSnapshot) ??
    asRecord(data.estimate_snapshot) ??
    asRecord(data.estimateSnapshot);

  return {
    ...base,
    commodity: pickString(data.commodity) || undefined,
    pieces: pickNumber(data.pieces),
    grossWeight: pickNumber(data.gross_weight, data.grossWeight),
    chargeableWeight: pickNumber(data.chargeable_weight, data.chargeableWeight),
    volumeCbm: pickNumber(data.volume_cbm, data.volumeCbm),
    specialRequirements:
      pickString(data.special_requirements, data.specialRequirements, data.notes) || undefined,
    source: pickString(data.source) || undefined,
    negotiationRound: pickNumber(data.negotiation_round, data.negotiationRound),
    convertedJobNumber:
      pickString(data.converted_job_number, data.convertedJobNumber, data.job_number) || undefined,
    jobId:
      pickString(
        data.job_id,
        data.jobId,
        data.converted_job_id,
        data.convertedJobId,
        data.shipment_id,
        data.shipmentId,
      ) || undefined,
    bookingId:
      pickString(
        data.booking_id,
        data.bookingId,
        data.nvocc_booking_id,
        data.nvoccBookingId,
        data.source_booking_id,
        data.sourceBookingId,
        data.related_booking_id,
        data.relatedBookingId,
        data.workflow_booking_id,
        data.workflowBookingId,
        data.portal_booking_id,
        data.portalBookingId,
        asRecord(data.booking)?.id,
        asRecord(data.nvocc_booking)?.id,
        asRecord(data.nvoccBooking)?.id,
        asRecord(data.links)?.booking_id,
        asRecord(data.links)?.bookingId,
        // When quote was sourced from an NVOCC booking shell.
        /booking/i.test(pickString(data.source, data.source_type, data.sourceType))
          ? pickString(data.source_id, data.sourceId)
          : undefined,
      ) || undefined,
    packages: normalizePortalPackages(data.packages),
    negotiationPricing: normalizeNegotiationPricing(data),
    portalEstimateSnapshot: snapshotRaw
      ? {
          currencyCode:
            pickString(snapshotRaw.currency_code, snapshotRaw.currencyCode) || undefined,
          estimatedTotal: pickNumber(
            snapshotRaw.estimated_total,
            snapshotRaw.estimatedTotal,
            snapshotRaw.total,
          ),
          capturedAt: pickString(snapshotRaw.captured_at, snapshotRaw.capturedAt) || undefined,
        }
      : undefined,
    pdfUrl: (() => {
      const raw = pickString(
        data.customer_pdf_url,
        data.customerPdfUrl,
        data.pdf_url,
        data.pdfUrl,
        data.download_url,
        data.downloadUrl,
      );
      // Relative API paths must not be opened in the SPA (frontend 404).
      return raw && /^https?:\/\//i.test(raw) ? raw : undefined;
    })(),
    pdfReady:
      pickBoolean(
        data.pdf_ready,
        data.pdfReady,
        data.has_customer_pdf,
        data.hasCustomerPdf,
        data.customer_pdf_ready,
      ) ?? undefined,
    lines,
  };
}

function normalizePortalPackages(raw: unknown): PortalQuotationPackage[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const packages: PortalQuotationPackage[] = [];
  for (const entry of raw) {
    const r = asRecord(entry);
    if (!r) continue;
    packages.push({
      id: pickString(r.id) || undefined,
      lengthCm: pickNumber(r.length_cm, r.lengthCm),
      widthCm: pickNumber(r.width_cm, r.widthCm),
      heightCm: pickNumber(r.height_cm, r.heightCm),
      grossWeightKg: pickNumber(r.gross_weight_kg, r.grossWeightKg),
      pieces: pickNumber(r.pieces),
      cbm: pickNumber(r.cbm, r.volume_cbm),
    });
  }
  return packages.length ? packages : undefined;
}

function normalizeBookingParties(raw: unknown): PortalBookingFormParty[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const parties: PortalBookingFormParty[] = [];
  for (const entry of raw) {
    const r = asRecord(entry);
    if (!r) continue;
    const kind = pickString(r.party_kind, r.partyKind, r.kind).toUpperCase();
    if (kind !== 'SHIPPER' && kind !== 'CONSIGNEE' && kind !== 'NOTIFY') continue;
    const fullName = pickString(r.full_name, r.fullName, r.name);
    if (!fullName) continue;
    const entity = pickString(r.entity_kind, r.entityKind).toUpperCase();
    parties.push({
      party_kind: kind as PortalBookingFormParty['party_kind'],
      full_name: fullName,
      address: pickString(r.address) || undefined,
      city: pickString(r.city) || undefined,
      country: pickString(r.country) || undefined,
      entity_kind:
        entity === 'INDIVIDUAL' || entity === 'COMPANY'
          ? (entity as PortalBookingFormParty['entity_kind'])
          : undefined,
      other_details: pickString(r.other_details, r.otherDetails) || undefined,
    });
  }
  return parties.length ? parties : undefined;
}

/** Normalize portal / shipment booking-form payloads (matches UpsertNvoccBookingFormDto). */
export function normalizePortalBookingForm(raw: unknown): PortalBookingForm {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const num = (...keys: unknown[]) => {
    for (const k of keys) {
      if (typeof k === 'number' && Number.isFinite(k)) return k;
      if (typeof k === 'string' && k.trim() && Number.isFinite(Number(k))) return Number(k);
    }
    return undefined;
  };
  return {
    id: pickString(data.id) || undefined,
    quotation_id: pickString(data.quotation_id, data.quotationId) || undefined,
    date_of_request: pickString(data.date_of_request, data.dateOfRequest) || undefined,
    voyage_ref: pickString(data.voyage_ref, data.voyageRef) || undefined,
    client_booking_no: pickString(data.client_booking_no, data.clientBookingNo) || undefined,
    gross_weight_kg: num(data.gross_weight_kg, data.grossWeightKg),
    net_weight_kg: num(data.net_weight_kg, data.netWeightKg),
    chargeable_weight_kg: num(data.chargeable_weight_kg, data.chargeableWeightKg),
    volume_cbm: num(data.volume_cbm, data.volumeCbm),
    pieces: num(data.pieces),
    pallet_count: num(data.pallet_count, data.palletCount),
    pallets: Array.isArray(data.pallets)
      ? (data.pallets as PortalBookingForm['pallets'])
      : undefined,
    service_scope: pickString(data.service_scope, data.serviceScope) || undefined,
    origin_door_address:
      pickString(data.origin_door_address, data.originDoorAddress) || undefined,
    dest_door_address: pickString(data.dest_door_address, data.destDoorAddress) || undefined,
    pol:
      pickString(
        data.pol,
        data.origin,
      ) || undefined,
    pod:
      pickString(
        data.pod,
        data.destination,
      ) || undefined,
    origin_airport_code:
      pickString(data.origin_airport_code, data.originAirportCode) || undefined,
    dest_airport_code: pickString(data.dest_airport_code, data.destAirportCode) || undefined,
    shipper_owned_container:
      pickBoolean(data.shipper_owned_container, data.shipperOwnedContainer) ?? undefined,
    is_dg: pickBoolean(data.is_dg, data.isDg) ?? undefined,
    teu_count: num(data.teu_count, data.teuCount),
    containers: Array.isArray(data.containers)
      ? (data.containers as PortalBookingForm['containers'])
      : undefined,
    commodity: pickString(data.commodity) || undefined,
    hs_code: pickString(data.hs_code, data.hsCode) || undefined,
    final_use: pickString(data.final_use, data.finalUse) || undefined,
    activity_sector: pickString(data.activity_sector, data.activitySector) || undefined,
    insurance_details: pickString(data.insurance_details, data.insuranceDetails) || undefined,
    lc_bank_details: pickString(data.lc_bank_details, data.lcBankDetails) || undefined,
    attach_commercial_invoice:
      pickBoolean(data.attach_commercial_invoice, data.attachCommercialInvoice) ?? undefined,
    attach_correspondence:
      pickBoolean(data.attach_correspondence, data.attachCorrespondence) ?? undefined,
    attach_cod_form: pickBoolean(data.attach_cod_form, data.attachCodForm) ?? undefined,
    attach_licence: pickBoolean(data.attach_licence, data.attachLicence) ?? undefined,
    booking_agent_line: pickString(data.booking_agent_line, data.bookingAgentLine) || undefined,
    agent_requester_name:
      pickString(data.agent_requester_name, data.agentRequesterName) || undefined,
    sq_bl_booking_reference:
      pickString(data.sq_bl_booking_reference, data.sqBlBookingReference) || undefined,
    request_details:
      pickString(data.request_details, data.requestDetails, data.notes, data.special_handling) ||
      undefined,
    consent_accepted: pickBoolean(data.consent_accepted, data.consentAccepted) ?? undefined,
    mark_complete: pickBoolean(data.mark_complete, data.markComplete) ?? false,
    parties: normalizeBookingParties(data.parties),
  };
}
