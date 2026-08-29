import type {
  NvoccBooking,
  NvoccEnquiry,
  NvoccLoadListItem,
  NvoccTariff,
  NvoccVoyage,
} from '../types/nvocc.types';
import { asRecord, bool, idOf, num, str } from './nvoccUnwrap';

function nestedName(raw: Record<string, unknown>, key: string): string | undefined {
  const nested = asRecord(raw[key]);
  if (!nested) return str(raw[`${key}_name`]);
  return str(nested.name) ?? str(nested.label) ?? str(nested.code);
}

function nestedNumber(raw: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = str(raw[key]);
    if (value) return value;
  }
  return undefined;
}

export function normalizeNvoccTariff(raw: unknown): NvoccTariff | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = idOf(record);
  if (!id) return null;
  return {
    id,
    trade_lane: str(record.trade_lane) ?? '',
    pol_region: str(record.pol_region),
    pod_region: str(record.pod_region),
    origin_port_id: str(record.origin_port_id),
    dest_port_id: str(record.dest_port_id),
    commodity_type: str(record.commodity_type) as NvoccTariff['commodity_type'],
    container_type_id: str(record.container_type_id),
    lcl_rate_cbm: num(record.lcl_rate_cbm),
    lcl_rate_wm: num(record.lcl_rate_wm),
    lcl_minimum_charge: num(record.lcl_minimum_charge),
    fcl_rate: num(record.fcl_rate),
    origin_thc: num(record.origin_thc),
    dest_thc: num(record.dest_thc),
    bl_fee: num(record.bl_fee),
    baf_surcharge: num(record.baf_surcharge),
    caf_surcharge: num(record.caf_surcharge),
    pss_surcharge: num(record.pss_surcharge),
    gri_surcharge: num(record.gri_surcharge),
    rate_valid_from: str(record.rate_valid_from),
    rate_valid_to: str(record.rate_valid_to),
    customer_id: str(record.customer_id),
    currency_code: str(record.currency_code),
    status: str(record.status) as NvoccTariff['status'],
    created_at: str(record.created_at),
    updated_at: str(record.updated_at),
  };
}

export function normalizeNvoccVoyage(raw: unknown): NvoccVoyage | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = idOf(record);
  if (!id) return null;
  return {
    id,
    voyage_number: nestedNumber(record, 'voyage_number', 'voyage_no', 'number'),
    vessel_id: str(record.vessel_id),
    vessel_name: nestedName(record, 'vessel'),
    shipping_line_id: str(record.shipping_line_id),
    pol_id: str(record.pol_id),
    pod_id: str(record.pod_id),
    pol_name: nestedName(record, 'pol') ?? nestedName(record, 'origin_port'),
    pod_name: nestedName(record, 'pod') ?? nestedName(record, 'dest_port'),
    transshipment_port_id: str(record.transshipment_port_id),
    etd: str(record.etd),
    eta: str(record.eta),
    si_cutoff: str(record.si_cutoff),
    vgm_cutoff: str(record.vgm_cutoff),
    cy_cutoff: str(record.cy_cutoff),
    cargo_cutoff: str(record.cargo_cutoff),
    slot_allocation_containers: num(record.slot_allocation_containers),
    lcl_capacity_cbm: num(record.lcl_capacity_cbm),
    mbl_number: str(record.mbl_number),
    nvocc_freight_rate: num(record.nvocc_freight_rate),
    carrier_cost: num(record.carrier_cost),
    agent_pol_id: str(record.agent_pol_id),
    agent_pod_id: str(record.agent_pod_id),
    remarks: str(record.remarks),
    voyage_status: str(record.voyage_status) as NvoccVoyage['voyage_status'],
    created_at: str(record.created_at),
    updated_at: str(record.updated_at),
  };
}

export function normalizeNvoccEnquiry(raw: unknown): NvoccEnquiry | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = idOf(record);
  if (!id) return null;
  return {
    id,
    enquiry_number: nestedNumber(record, 'enquiry_number', 'enquiry_no', 'number'),
    customer_id: str(record.customer_id),
    customer_name: nestedName(record, 'customer'),
    voyage_id: str(record.voyage_id),
    cargo_type: str(record.cargo_type) as NvoccEnquiry['cargo_type'],
    container_type_id: str(record.container_type_id),
    container_count: num(record.container_count),
    cbm: num(record.cbm),
    gross_weight: num(record.gross_weight),
    pieces: num(record.pieces),
    commodity: str(record.commodity),
    hs_code: str(record.hs_code),
    incoterms: str(record.incoterms),
    freight_terms: str(record.freight_terms),
    rate_quoted: num(record.rate_quoted),
    rate_validity: str(record.rate_validity),
    salesperson_id: str(record.salesperson_id),
    follow_up_date: str(record.follow_up_date),
    enquiry_status: str(record.enquiry_status) as NvoccEnquiry['enquiry_status'],
    created_at: str(record.created_at),
    updated_at: str(record.updated_at),
  };
}

export function normalizeNvoccBooking(raw: unknown): NvoccBooking | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = idOf(record);
  if (!id) return null;
  return {
    id,
    booking_number: nestedNumber(record, 'booking_number', 'booking_no', 'number'),
    voyage_id: str(record.voyage_id),
    enquiry_id: str(record.enquiry_id),
    shipper_id: str(record.shipper_id),
    consignee_id: str(record.consignee_id),
    notify_id: str(record.notify_id),
    agent_pol_id: str(record.agent_pol_id),
    agent_pod_id: str(record.agent_pod_id),
    cargo_type: str(record.cargo_type) as NvoccBooking['cargo_type'],
    container_type_id: str(record.container_type_id),
    container_count: num(record.container_count),
    cbm_allocated: num(record.cbm_allocated),
    gross_weight: num(record.gross_weight),
    pieces: num(record.pieces),
    commodity: str(record.commodity),
    hs_code: str(record.hs_code),
    is_dg: bool(record.is_dg),
    marks_numbers: str(record.marks_numbers),
    incoterms: str(record.incoterms),
    freight_terms: str(record.freight_terms),
    other_charges_terms: str(record.other_charges_terms),
    shipper_ref: str(record.shipper_ref),
    job_type: str(record.job_type),
    booking_status: str(record.booking_status),
    hbl_number: str(record.hbl_number),
    job_id: str(record.job_id),
    job_number: str(record.job_number),
    created_at: str(record.created_at),
    updated_at: str(record.updated_at),
  };
}

export function normalizeNvoccLoadListItem(raw: unknown): NvoccLoadListItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = idOf(record);
  if (!id) return null;
  return {
    id,
    booking_id: str(record.booking_id),
    booking_number: str(record.booking_number),
    container_number: str(record.container_number),
    seal_number: str(record.seal_number),
    container_type_id: str(record.container_type_id),
    pieces: num(record.pieces),
    gross_weight_kg: num(record.gross_weight_kg),
    cbm: num(record.cbm),
    commodity: str(record.commodity),
    marks_numbers: str(record.marks_numbers),
    cargo_status: str(record.cargo_status) as NvoccLoadListItem['cargo_status'],
    cargo_received_date: str(record.cargo_received_date),
    stuffing_date: str(record.stuffing_date),
    vessel_loaded_date: str(record.vessel_loaded_date),
  };
}

export function normalizeMany<T>(
  items: unknown[],
  normalizer: (raw: unknown) => T | null,
): T[] {
  return items.map(normalizer).filter((item): item is T => item !== null);
}

export function nvoccDisplayNumber(
  entity: { id: string; enquiry_number?: string; booking_number?: string; voyage_number?: string },
  prefix: string,
): string {
  const number =
    entity.enquiry_number ?? entity.booking_number ?? entity.voyage_number ?? undefined;
  return number?.trim() || `${prefix} ${entity.id.slice(0, 8)}`;
}

export function formatNvoccDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
