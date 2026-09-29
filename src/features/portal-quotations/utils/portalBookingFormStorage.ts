import type { PortalBookingForm, PortalBookingFormUpsertDto } from '../types/portalQuotations.types';

const STORAGE_PREFIX = 'kf.portal.bookingForm.v2:';

/** Machine block so Ops can load customer-filled fields into staff booking forms. */
export const PORTAL_BOOKING_FORM_JSON_START = '---KF_PORTAL_BOOKING_FORM_JSON---';
export const PORTAL_BOOKING_FORM_JSON_END = '---END_KF_PORTAL_BOOKING_FORM_JSON---';

/** Payload mirrors UpsertNvoccBookingFormDto (+ meta for Ops matching). */
export type PortalBookingFormMessagePayload = {
  v: 1 | 2;
  quotationId: string;
  quoteNumber?: string;
  jobType?: string;
  jobId?: string;
  submittedAt: string;
} & Partial<PortalBookingFormUpsertDto>;

type StoredBookingForm = PortalBookingForm & {
  saved_at?: string;
  quote_number?: string;
  job_type?: string;
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
  };
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
    return {
      quotation_id: quotationId,
      ...pickFormFields(parsed),
    };
  } catch {
    return null;
  }
}

export function writePortalBookingFormDraft(
  quotationId: string,
  dto: PortalBookingFormUpsertDto,
  meta?: { quoteNumber?: string; jobType?: string },
): PortalBookingForm {
  const fields = pickFormFields(dto);
  const form: StoredBookingForm = {
    quotation_id: quotationId,
    ...fields,
    saved_at: new Date().toISOString(),
    quote_number: meta?.quoteNumber,
    job_type: meta?.jobType,
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey(quotationId), JSON.stringify(form));
  }
  return { quotation_id: quotationId, ...fields };
}

export function buildPortalBookingFormMessagePayload(opts: {
  quotationId: string;
  quoteNumber?: string;
  jobType?: string;
  jobId?: string;
  dto: PortalBookingFormUpsertDto;
}): PortalBookingFormMessagePayload {
  const { quotationId, quoteNumber, jobType, jobId, dto } = opts;
  return {
    v: 2,
    quotationId,
    quoteNumber,
    jobType,
    jobId: jobId || undefined,
    submittedAt: new Date().toISOString(),
    ...dto,
  };
}

export function formatBookingFormMessageBody(opts: {
  quotationId: string;
  quoteNumber?: string;
  jobType?: string;
  jobId?: string;
  dto: PortalBookingFormUpsertDto;
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
    `Job ID: ${opts.jobId || '—'}`,
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
    'Ops: quotation converts to a job after this submission (Sea/Land/Road/Courier/Warehouse/Customs), or load into staff booking-form / NVOCC send-invoice for gated modes.',
    '',
    PORTAL_BOOKING_FORM_JSON_START,
    JSON.stringify(payload),
    PORTAL_BOOKING_FORM_JSON_END,
  ].join('\n');
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
  filter: { jobId?: string; quotationId?: string; quoteNumber?: string },
): boolean {
  const jobId = filter.jobId?.trim();
  const quotationId = filter.quotationId?.trim();
  const quoteNumber = filter.quoteNumber?.trim().toUpperCase();
  if (!jobId && !quotationId && !quoteNumber) return false;
  if (jobId && payload.jobId && payload.jobId === jobId) return true;
  if (quotationId && payload.quotationId === quotationId) return true;
  if (quoteNumber && payload.quoteNumber?.trim().toUpperCase() === quoteNumber) return true;
  return false;
}
