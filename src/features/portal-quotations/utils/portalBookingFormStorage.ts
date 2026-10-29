import { API_SCHEMA_KEYS } from '@/lib/api/apiSchema.generated';
import type { PortalBookingForm, PortalBookingFormUpsertDto } from '../types/portalQuotations.types';

const STORAGE_PREFIX = 'kf.portal.bookingForm.v2:';

/** Machine block so Ops can load customer-filled fields into staff booking forms. */
export const PORTAL_BOOKING_FORM_JSON_START = '---KF_PORTAL_BOOKING_FORM_JSON---';
export const PORTAL_BOOKING_FORM_JSON_END = '---END_KF_PORTAL_BOOKING_FORM_JSON---';

/** File refs from portal compliance upload responses (when API returns them). */
export type PortalBookingFormDocumentRef = {
  kind?: string;
  id?: string;
  file_name?: string;
  file_url?: string;
  download_url?: string;
  s3_key?: string;
};

/** Payload mirrors UpsertNvoccBookingFormDto (+ meta for Ops matching). */
export type PortalBookingFormMessagePayload = {
  v: 1 | 2;
  quotationId: string;
  quoteNumber?: string;
  jobType?: string;
  jobId?: string;
  /** NVOCC booking id when customer submitted via /portal/bookings/:id/compliance-form. */
  bookingId?: string;
  submittedAt: string;
  /**
   * Customer-uploaded compliance docs (from upload API response / draft).
   * Not part of UpsertNvoccBookingFormDto — carried so admin can resolve downloads.
   */
  documents?: PortalBookingFormDocumentRef[];
} & Partial<PortalBookingFormUpsertDto>;

type StoredBookingForm = PortalBookingForm & {
  saved_at?: string;
  quote_number?: string;
  job_type?: string;
  /** Customer clicked Submit — Ops form stays draft until admin Completes. */
  customer_submitted?: boolean;
  /** Customer upload refs (not part of Upsert*BookingFormDto). */
  documents?: PortalBookingFormDocumentRef[];
};

function storageKey(quotationId: string): string {
  return `${STORAGE_PREFIX}${quotationId}`;
}

function pickFormFields(src: Partial<PortalBookingForm> | PortalBookingFormUpsertDto): PortalBookingForm {
  return {
    date_of_request: src.date_of_request,
    voyage_ref: src.voyage_ref,
    client_booking_no: src.client_booking_no,
    gross_weight_kg: src.gross_weight_kg,
    net_weight_kg: src.net_weight_kg,
    chargeable_weight_kg: src.chargeable_weight_kg,
    volume_cbm: src.volume_cbm,
    pieces: src.pieces,
    pallet_count: src.pallet_count,
    pallets: src.pallets,
    service_scope: src.service_scope,
    origin_door_address: src.origin_door_address,
    dest_door_address: src.dest_door_address,
    pol: src.pol,
    pod: src.pod,
    origin_airport_code: src.origin_airport_code,
    dest_airport_code: src.dest_airport_code,
    shipper_owned_container: src.shipper_owned_container,
    is_dg: src.is_dg,
    teu_count: src.teu_count,
    containers: src.containers,
    commodity: src.commodity,
    hs_code: src.hs_code,
    final_use: src.final_use,
    activity_sector: src.activity_sector,
    insurance_details: src.insurance_details,
    lc_bank_details: src.lc_bank_details,
    attach_commercial_invoice: src.attach_commercial_invoice,
    attach_correspondence: src.attach_correspondence,
    attach_cod_form: src.attach_cod_form,
    attach_licence: src.attach_licence,
    booking_agent_line: src.booking_agent_line,
    agent_requester_name: src.agent_requester_name,
    sq_bl_booking_reference: src.sq_bl_booking_reference,
    request_details: src.request_details,
    consent_accepted: src.consent_accepted,
    mark_complete: Boolean(src.mark_complete),
    parties: src.parties,
    warehouse_id: src.warehouse_id,
    warehouse_name: src.warehouse_name,
    expected_inbound_at: src.expected_inbound_at,
    expected_outbound_at: src.expected_outbound_at,
    storage_days_requested: src.storage_days_requested,
    bonded: src.bonded,
    temperature_controlled: src.temperature_controlled,
    handling_instructions: src.handling_instructions,
    freight_job_id: src.freight_job_id,
    cargo_category: src.cargo_category,
    dg_class: src.dg_class,
    attach_packing_list: src.attach_packing_list,
    attach_bl_awb_copy: src.attach_bl_awb_copy,
    attach_carnet: src.attach_carnet,
    attach_vehicle_title: src.attach_vehicle_title,
    attach_msds: src.attach_msds,
    attach_dangerous_goods_declaration: src.attach_dangerous_goods_declaration,
    attach_health_veterinary: src.attach_health_veterinary,
    attach_fda_moh: src.attach_fda_moh,
    stock_lines: src.stock_lines,
    direction: src.direction,
    border_or_port: src.border_or_port,
    entry_type: src.entry_type,
    declaration_type: src.declaration_type,
    port_of_entry: src.port_of_entry,
    port_of_exit: src.port_of_exit,
    country_of_origin: src.country_of_origin,
    country_of_destination: src.country_of_destination,
    incoterms: src.incoterms,
    invoice_value_amount: src.invoice_value_amount,
    invoice_currency: src.invoice_currency,
    attach_coo: src.attach_coo,
    attach_poa: src.attach_poa,
    attach_permit: src.attach_permit,
    cargo_lines: src.cargo_lines,
    origin_city_country: src.origin_city_country,
    dest_city_country: src.dest_city_country,
    vehicle_type: src.vehicle_type,
    border_crossing: src.border_crossing,
    tracking_number: src.tracking_number,
    etd: src.etd,
    eta: src.eta,
    freight_terms: src.freight_terms,
    cfs_warehouse: src.cfs_warehouse,
  };
}

/** Convert stored / GET form into UpsertDto for inbox remirror / PUT. */
export function portalBookingFormToUpsertDto(
  form: PortalBookingForm | PortalBookingFormUpsertDto,
): PortalBookingFormUpsertDto {
  const picked = pickFormFields(form);
  return {
    ...picked,
    commodity: picked.commodity || '',
    parties: picked.parties ?? [],
    // Preserve caller intent — never force complete (that can trigger backend job convert).
    mark_complete: Boolean(picked.mark_complete),
    consent_accepted: Boolean(picked.consent_accepted),
  };
}

type SchemaDtoName =
  | 'UpsertSeaFclBookingFormDto'
  | 'UpsertSeaLclBookingFormDto'
  | 'UpsertLandBookingFormDto'
  | 'UpsertRoadFreightBookingFormDto'
  | 'UpsertCourierBookingFormDto'
  | 'UpsertCustomsClearanceBookingFormDto'
  | 'UpsertWarehouseBookingFormDto'
  | 'UpsertNvoccBookingFormDto'
  | 'UpsertAirComplianceBookingFormDto';

function bookingFormSchemaDtoForJobType(jobType?: string): SchemaDtoName {
  const jt = String(jobType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (jt.startsWith('AIR')) return 'UpsertAirComplianceBookingFormDto';
  if (jt.startsWith('NVOCC')) return 'UpsertNvoccBookingFormDto';
  if (jt.startsWith('SEA_LCL') || jt === 'SEA_LCL') return 'UpsertSeaLclBookingFormDto';
  if (jt.startsWith('SEA')) return 'UpsertSeaFclBookingFormDto';
  if (jt.startsWith('ROAD')) return 'UpsertRoadFreightBookingFormDto';
  if (jt.startsWith('COURIER')) return 'UpsertCourierBookingFormDto';
  if (jt.startsWith('WAREHOUSE')) return 'UpsertWarehouseBookingFormDto';
  if (jt.startsWith('CUSTOMS') || jt === 'CC') return 'UpsertCustomsClearanceBookingFormDto';
  if (jt.startsWith('LAND')) return 'UpsertLandBookingFormDto';
  return 'UpsertSeaFclBookingFormDto';
}

/**
 * Strip fields the mode booking-form DTO does not accept.
 * Extra NVOCC/compliance keys on Sea/Land PUTs often cause API 500s.
 */
export function sanitizePortalBookingFormUpsertDto(
  dto: PortalBookingFormUpsertDto,
  jobType?: string,
): PortalBookingFormUpsertDto {
  const schemaName = bookingFormSchemaDtoForJobType(jobType);
  const allowed = new Set<string>(API_SCHEMA_KEYS[schemaName] ?? []);
  const partyKeys = new Set<string>(API_SCHEMA_KEYS.BookingFormPartyDto ?? []);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto as Record<string, unknown>)) {
    if (value === undefined) continue;
    if (!allowed.has(key)) continue;
    if (key === 'parties' && Array.isArray(value)) {
      out.parties = value.map((party) => {
        if (!party || typeof party !== 'object') return party;
        const cleaned: Record<string, unknown> = {};
        for (const [pk, pv] of Object.entries(party as Record<string, unknown>)) {
          if (pv === undefined) continue;
          if (partyKeys.size && !partyKeys.has(pk)) continue;
          cleaned[pk] = pv;
        }
        return cleaned;
      });
      continue;
    }
    out[key] = value;
  }
  if (!Array.isArray(out.parties)) out.parties = dto.parties ?? [];
  if (typeof out.commodity !== 'string') out.commodity = dto.commodity || '';
  out.mark_complete = Boolean(dto.mark_complete);
  out.consent_accepted = Boolean(dto.consent_accepted);
  return out as PortalBookingFormUpsertDto;
}

function normalizeDocumentRefs(raw: unknown): PortalBookingFormDocumentRef[] | undefined {
  if (!Array.isArray(raw) || !raw.length) return undefined;
  const out: PortalBookingFormDocumentRef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const ref: PortalBookingFormDocumentRef = {
      kind: typeof row.kind === 'string' ? row.kind : undefined,
      id: typeof row.id === 'string' ? row.id : undefined,
      file_name:
        typeof row.file_name === 'string'
          ? row.file_name
          : typeof row.fileName === 'string'
            ? row.fileName
            : undefined,
      file_url:
        typeof row.file_url === 'string'
          ? row.file_url
          : typeof row.fileUrl === 'string'
            ? row.fileUrl
            : undefined,
      download_url:
        typeof row.download_url === 'string'
          ? row.download_url
          : typeof row.downloadUrl === 'string'
            ? row.downloadUrl
            : undefined,
      s3_key:
        typeof row.s3_key === 'string'
          ? row.s3_key
          : typeof row.s3Key === 'string'
            ? row.s3Key
            : undefined,
    };
    if (ref.id || ref.file_name || ref.file_url || ref.download_url || ref.s3_key || ref.kind) {
      out.push(ref);
    }
  }
  return out.length ? out : undefined;
}

export function readPortalBookingFormDraft(quotationId: string): PortalBookingForm | null {
  if (!quotationId || typeof localStorage === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem(storageKey(quotationId)) ??
      localStorage.getItem(`kf.portal.bookingForm.v1:${quotationId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredBookingForm;
    if (!parsed || typeof parsed !== 'object') return null;
    const documents = normalizeDocumentRefs(parsed.documents);
    return {
      quotation_id: quotationId,
      ...pickFormFields(parsed),
      ...(documents ? { documents } : {}),
      ...(parsed.customer_submitted ? { customer_submitted: true } : {}),
    };
  } catch {
    return null;
  }
}

export function writePortalBookingFormDraft(
  quotationId: string,
  dto: PortalBookingFormUpsertDto,
  meta?: {
    quoteNumber?: string;
    jobType?: string;
    documents?: PortalBookingFormDocumentRef[];
    /** Customer Submit — not the same as Ops mark_complete. */
    customerSubmitted?: boolean;
  },
): PortalBookingForm {
  const fields = pickFormFields(dto);
  // Keep prior upload refs unless caller replaces them (save without re-upload).
  let documents = normalizeDocumentRefs(meta?.documents);
  let priorCustomerSubmitted = false;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(storageKey(quotationId));
      if (raw) {
        const prev = JSON.parse(raw) as StoredBookingForm;
        if (!documents) documents = normalizeDocumentRefs(prev.documents);
        priorCustomerSubmitted = prev.customer_submitted === true;
      }
    } catch {
      /* ignore */
    }
  }
  const customerSubmitted = meta?.customerSubmitted === true || priorCustomerSubmitted;
  // Mode-booking customer Submit stores customer_submitted and keeps mark_complete false
  // (Ops Completes later). NVOCC/Air compliance may still persist mark_complete true.
  const markComplete = customerSubmitted ? false : Boolean(fields.mark_complete);
  const form: StoredBookingForm = {
    quotation_id: quotationId,
    ...fields,
    mark_complete: markComplete,
    saved_at: new Date().toISOString(),
    quote_number: meta?.quoteNumber,
    job_type: meta?.jobType,
    ...(customerSubmitted ? { customer_submitted: true } : {}),
    ...(documents ? { documents } : {}),
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey(quotationId), JSON.stringify(form));
  }
  return {
    quotation_id: quotationId,
    ...fields,
    mark_complete: markComplete,
    ...(customerSubmitted ? { customer_submitted: true } : {}),
    ...(documents ? { documents } : {}),
  };
}

export function buildPortalBookingFormMessagePayload(opts: {
  quotationId: string;
  quoteNumber?: string;
  jobType?: string;
  jobId?: string;
  bookingId?: string;
  dto: PortalBookingFormUpsertDto;
  documents?: PortalBookingFormDocumentRef[];
}): PortalBookingFormMessagePayload {
  const { quotationId, quoteNumber, jobType, jobId, bookingId, dto, documents } = opts;
  const fromDto = (dto as { documents?: PortalBookingFormDocumentRef[] }).documents;
  const docs = documents?.length ? documents : fromDto;
  return {
    v: 2,
    quotationId,
    quoteNumber,
    jobType,
    jobId: jobId || undefined,
    bookingId: bookingId || undefined,
    submittedAt: new Date().toISOString(),
    ...dto,
    ...(docs?.length ? { documents: docs } : {}),
  };
}

export function formatBookingFormMessageBody(opts: {
  quotationId: string;
  quoteNumber?: string;
  jobType?: string;
  jobId?: string;
  bookingId?: string;
  dto: PortalBookingFormUpsertDto;
  documents?: PortalBookingFormDocumentRef[];
}): string {
  const { quotationId, quoteNumber, jobType, dto } = opts;
  const isWarehouse =
    String(jobType ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_') === 'WAREHOUSE';
  const shipper = dto.parties.find((p) => p.party_kind === 'SHIPPER');
  const consignee = dto.parties.find((p) => p.party_kind === 'CONSIGNEE');
  const notify = dto.parties.find((p) => p.party_kind === 'NOTIFY');
  const partyBlock = (label: string, p?: (typeof dto.parties)[number]) =>
    [
      `${label}:`,
      `  Name: ${p?.full_name || '—'}`,
      `  Address: ${p?.address || '—'}`,
      `  City: ${p?.city || '—'}`,
      `  Country: ${p?.country || '—'}`,
      `  Other: ${p?.other_details || '—'}`,
    ].join('\n');

  const payload = buildPortalBookingFormMessagePayload(opts);

  return [
    isWarehouse
      ? 'CUSTOMER BOOKING FORM (UpsertWarehouseBookingFormDto — portal draft / messages; no portal warehouse booking-form API yet)'
      : 'CUSTOMER BOOKING FORM (UpsertNvoccBookingFormDto)',
    `Quote: ${quoteNumber || quotationId}`,
    `Quotation ID: ${quotationId}`,
    `Job type: ${jobType || '—'}`,
    `Job number: ${opts.jobNumber || opts.jobId || '—'}`,
    `Booking ID: ${opts.bookingId || '—'}`,
    `Mark complete: ${dto.mark_complete ? 'YES' : 'draft'}`,
    '',
    `date_of_request: ${dto.date_of_request || '—'}`,
    `client_booking_no: ${dto.client_booking_no || '—'}`,
    `teu_count: ${dto.teu_count ?? '—'}`,
    `pol: ${dto.pol ?? '—'}`,
    `pod: ${dto.pod ?? '—'}`,
    `origin_door_address: ${dto.origin_door_address || '—'}`,
    `dest_door_address: ${dto.dest_door_address || '—'}`,
    `warehouse_name: ${dto.warehouse_name || '—'}`,
    `warehouse_id: ${dto.warehouse_id || '—'}`,
    `expected_inbound_at: ${dto.expected_inbound_at || '—'}`,
    `expected_outbound_at: ${dto.expected_outbound_at || '—'}`,
    `storage_days_requested: ${dto.storage_days_requested ?? '—'}`,
    `bonded: ${dto.bonded ? 'Yes' : 'No'}`,
    `temperature_controlled: ${dto.temperature_controlled ? 'Yes' : 'No'}`,
    `cargo_category: ${dto.cargo_category || '—'}`,
    `dg_class: ${dto.dg_class || '—'}`,
    `pieces: ${dto.pieces ?? '—'}`,
    `volume_cbm: ${dto.volume_cbm ?? '—'}`,
    `gross_weight_kg: ${dto.gross_weight_kg ?? '—'}`,
    `net_weight_kg: ${dto.net_weight_kg ?? '—'}`,
    `shipper_owned_container: ${dto.shipper_owned_container ? 'Yes' : 'No'}`,
    `is_dg: ${dto.is_dg ? 'Yes' : 'No'}`,
    `commodity: ${dto.commodity}`,
    `hs_code: ${dto.hs_code || '—'}`,
    `final_use: ${dto.final_use || '—'}`,
    `activity_sector: ${dto.activity_sector || '—'}`,
    `voyage_ref: ${dto.voyage_ref || '—'}`,
    `booking_agent_line: ${dto.booking_agent_line || '—'}`,
    `agent_requester_name: ${dto.agent_requester_name || '—'}`,
    `sq_bl_booking_reference: ${dto.sq_bl_booking_reference || '—'}`,
    `handling_instructions: ${dto.handling_instructions || '—'}`,
    `stock_lines: ${dto.stock_lines?.length ? JSON.stringify(dto.stock_lines) : '—'}`,
    `attach_packing_list: ${dto.attach_packing_list ? 'Yes' : 'No'}`,
    `attach_bl_awb_copy: ${dto.attach_bl_awb_copy ? 'Yes' : 'No'}`,
    `attach_msds: ${dto.attach_msds ? 'Yes' : 'No'}`,
    `attach_dangerous_goods_declaration: ${dto.attach_dangerous_goods_declaration ? 'Yes' : 'No'}`,
    '',
    partyBlock('Shipper', shipper),
    '',
    partyBlock('Consignee', consignee),
    '',
    partyBlock('Notify', notify),
    '',
    `request_details: ${dto.request_details || '—'}`,
    `consent_accepted: ${dto.consent_accepted ? 'Yes' : 'No'}`,
    '',
    'Customer filled this form in the portal after quote approval.',
    'Ops: customer approved — continue Generate Shipment → confirm/approve → Generate Job (or NVOCC/Air gated invoice flow).',
    '',
    PORTAL_BOOKING_FORM_JSON_START,
    JSON.stringify(payload),
    PORTAL_BOOKING_FORM_JSON_END,
  ].join('\n');
}

/** Compact body for remirror — avoids API truncation of the long human-readable mirror. */
export function formatBookingFormMessageBodyCompact(opts: {
  quotationId: string;
  quoteNumber?: string;
  jobType?: string;
  jobId?: string;
  bookingId?: string;
  dto: PortalBookingFormUpsertDto;
  documents?: PortalBookingFormDocumentRef[];
}): string {
  const payload = buildPortalBookingFormMessagePayload(opts);
  return [
    'CUSTOMER BOOKING FORM',
    `Quote: ${opts.quoteNumber || opts.quotationId}`,
    `Quotation ID: ${opts.quotationId}`,
    `Job type: ${opts.jobType || '—'}`,
    `Job number: ${opts.jobNumber || opts.jobId || '—'}`,
    `Booking ID: ${opts.bookingId || '—'}`,
    `Mark complete: YES`,
    '',
    PORTAL_BOOKING_FORM_JSON_START,
    JSON.stringify(payload),
    PORTAL_BOOKING_FORM_JSON_END,
  ].join('\n');
}

export function bookingFormInboxSubject(opts: {
  quoteLabel: string;
  quotationId?: string;
  bookingId?: string;
  jobId?: string;
}): string {
  const bits = [
    `[Customer booking form] ${opts.quoteLabel}`,
    opts.quotationId ? `qid:${opts.quotationId}` : '',
    opts.bookingId ? `bid:${opts.bookingId}` : '',
    opts.jobId ? `jid:${opts.jobId}` : '',
    'BOOKING_FORM_COMPLETE',
  ].filter(Boolean);
  return bits.join(' ').slice(0, 200);
}

export function parsePortalBookingFormMessagePayload(
  body?: string | null,
): PortalBookingFormMessagePayload | null {
  if (!body) return null;
  const start = body.indexOf(PORTAL_BOOKING_FORM_JSON_START);
  const end = body.indexOf(PORTAL_BOOKING_FORM_JSON_END);
  if (start < 0 || end < 0 || end <= start) return null;
  const raw = body.slice(start + PORTAL_BOOKING_FORM_JSON_START.length, end).trim();
  try {
    const parsed = JSON.parse(raw) as PortalBookingFormMessagePayload;
    if (!parsed || !parsed.quotationId) return null;
    if (parsed.v !== 1 && parsed.v !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function portalBookingFormPayloadMatches(
  payload: PortalBookingFormMessagePayload,
  filter: {
    jobId?: string;
    quotationId?: string;
    quoteNumber?: string;
    bookingId?: string;
  },
): boolean {
  const jobId = filter.jobId?.trim();
  const bookingId = filter.bookingId?.trim();
  const quotationId = filter.quotationId?.trim().toLowerCase();
  const quoteNumber = filter.quoteNumber?.trim().toUpperCase();
  if (!jobId && !bookingId && !quotationId && !quoteNumber) return false;
  if (jobId && payload.jobId && payload.jobId === jobId) return true;
  if (bookingId && payload.bookingId && payload.bookingId === bookingId) return true;
  // Legacy: NVOCC sometimes stamped booking id into jobId.
  if (bookingId && payload.jobId && payload.jobId === bookingId) return true;
  if (
    quotationId &&
    String(payload.quotationId ?? '')
      .trim()
      .toLowerCase() === quotationId
  ) {
    return true;
  }
  if (quoteNumber && payload.quoteNumber?.trim().toUpperCase() === quoteNumber) return true;
  return false;
}
