import type { ModeBookingForm, StaffBookingFormMode } from '../types/job.types';

/**
 * GET booking-form envelopes often include read-only / meta keys (e.g. job_documents_upload).
 * Echoing them on PUT caused Prisma 500s before BE strip/allowlist — strip on FE too.
 */
export const BOOKING_FORM_ENVELOPE_KEYS = new Set([
  'id',
  'job_id',
  'jobId',
  'quotation_id',
  'quotationId',
  'provisional_job_id',
  'provisionalJobId',
  'created_at',
  'createdAt',
  'updated_at',
  'updatedAt',
  'status',
  'form_status',
  'formStatus',
  'state',
  'job_documents_upload',
  'jobDocumentsUpload',
  'documents',
  'documents_summary',
  'documentsSummary',
  'path_hints',
  'pathHints',
  'actions',
  'meta',
  'links',
  'download_path',
  'downloadPath',
  'raw',
  'data',
]);

const SEA_FCL_KEYS = new Set([
  'date_of_request',
  'client_booking_no',
  'voyage_ref',
  'service_scope',
  'origin_door_address',
  'dest_door_address',
  'commodity',
  'hs_code',
  'cargo_category',
  'is_dg',
  'dg_class',
  'gross_weight_kg',
  'net_weight_kg',
  'volume_cbm',
  'pieces',
  'insurance_details',
  'request_details',
  'attach_commercial_invoice',
  'attach_packing_list',
  'attach_bl_awb_copy',
  'attach_carnet',
  'attach_vehicle_title',
  'attach_msds',
  'attach_dangerous_goods_declaration',
  'attach_health_veterinary',
  'attach_fda_moh',
  'parties',
  'mark_complete',
  'consent_accepted',
  'custom_fields',
  'pol',
  'pod',
  'shipper_owned_container',
  'teu_count',
  'containers',
  'etd',
  'eta',
  'incoterms',
  'freight_terms',
]);

const SEA_LCL_KEYS = new Set([
  ...SEA_FCL_KEYS,
  'cfs_warehouse',
]);

const LAND_KEYS = new Set([
  'date_of_request',
  'client_booking_no',
  'voyage_ref',
  'service_scope',
  'origin_door_address',
  'dest_door_address',
  'commodity',
  'hs_code',
  'cargo_category',
  'is_dg',
  'dg_class',
  'gross_weight_kg',
  'net_weight_kg',
  'volume_cbm',
  'pieces',
  'insurance_details',
  'request_details',
  'attach_commercial_invoice',
  'attach_packing_list',
  'attach_bl_awb_copy',
  'attach_carnet',
  'attach_vehicle_title',
  'attach_msds',
  'attach_dangerous_goods_declaration',
  'attach_health_veterinary',
  'attach_fda_moh',
  'parties',
  'mark_complete',
  'consent_accepted',
  'custom_fields',
  'etd',
  'eta',
  'incoterms',
  'freight_terms',
  'origin_city_country',
  'dest_city_country',
  'vehicle_type',
]);

const ROAD_KEYS = new Set([...LAND_KEYS, 'border_crossing']);

const COURIER_KEYS = new Set([
  ...LAND_KEYS,
  'tracking_number',
]);

const WAREHOUSE_KEYS = new Set([
  'date_of_request',
  'client_booking_no',
  'commodity',
  'hs_code',
  'cargo_category',
  'is_dg',
  'dg_class',
  'gross_weight_kg',
  'net_weight_kg',
  'volume_cbm',
  'pieces',
  'insurance_details',
  'request_details',
  'attach_commercial_invoice',
  'attach_packing_list',
  'attach_bl_awb_copy',
  'attach_carnet',
  'attach_vehicle_title',
  'attach_msds',
  'attach_dangerous_goods_declaration',
  'attach_health_veterinary',
  'attach_fda_moh',
  'parties',
  'mark_complete',
  'consent_accepted',
  'custom_fields',
  'warehouse_id',
  'warehouse_name',
  'expected_inbound_at',
  'expected_outbound_at',
  'storage_days_requested',
  'bonded',
  'temperature_controlled',
  'handling_instructions',
  'freight_job_id',
  'stock_lines',
]);

const CUSTOMS_KEYS = new Set([
  'date_of_request',
  'client_booking_no',
  'commodity',
  'hs_code',
  'cargo_category',
  'is_dg',
  'dg_class',
  'gross_weight_kg',
  'net_weight_kg',
  'volume_cbm',
  'pieces',
  'insurance_details',
  'request_details',
  'attach_commercial_invoice',
  'attach_packing_list',
  'attach_bl_awb_copy',
  'attach_carnet',
  'attach_vehicle_title',
  'attach_msds',
  'attach_dangerous_goods_declaration',
  'attach_health_veterinary',
  'attach_fda_moh',
  'attach_coo',
  'attach_poa',
  'attach_permit',
  'parties',
  'mark_complete',
  'consent_accepted',
  'custom_fields',
  'direction',
  'border_or_port',
  'entry_type',
  'declaration_type',
  'port_of_entry',
  'port_of_exit',
  'country_of_origin',
  'country_of_destination',
  'incoterms',
  'invoice_value_amount',
  'invoice_currency',
  'freight_job_id',
  'cargo_lines',
]);

function allowlistForMode(mode?: StaffBookingFormMode): Set<string> | null {
  switch (mode) {
    case 'SEA_FCL':
      return SEA_FCL_KEYS;
    case 'SEA_LCL':
      return SEA_LCL_KEYS;
    case 'LAND':
      return LAND_KEYS;
    case 'ROAD_FREIGHT':
      return ROAD_KEYS;
    case 'COURIER':
      return COURIER_KEYS;
    case 'WAREHOUSE':
      return WAREHOUSE_KEYS;
    case 'CUSTOMS_CLEARANCE':
      return CUSTOMS_KEYS;
    default:
      return null;
  }
}

/**
 * Strip envelope/meta keys and optionally allowlist writable columns for a mode PUT.
 * `custom_fields: null` is preserved (clears); omitted when undefined.
 */
export function sanitizeModeBookingFormPut(
  dto: Record<string, unknown>,
  mode?: StaffBookingFormMode,
): ModeBookingForm {
  const allow = allowlistForMode(mode);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (value === undefined) continue;
    if (BOOKING_FORM_ENVELOPE_KEYS.has(key)) continue;
    if (allow && !allow.has(key)) continue;
    out[key] = value;
  }
  return out as ModeBookingForm;
}
