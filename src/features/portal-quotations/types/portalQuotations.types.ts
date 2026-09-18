import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface PortalQuotationListParams {
  page?: number;
  limit?: number;
  status?: string;
  job_type?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
  order?: 'asc' | 'desc';
}

export interface PortalQuotationRejectDto {
  reason: string;
  notes?: string;
}

export interface PortalCargoPackageDto {
  /** Prefer cm or m — OpenAPI CargoPackageDto accepts either. */
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  length_m?: number;
  width_m?: number;
  height_m?: number;
  /** Required by estimate API. */
  gross_weight_kg: number;
  pieces?: number;
}

export type PortalCustomerLineSource = 'CATALOG' | 'TARIFF' | 'CUSTOMER_PROPOSED';

export interface PortalCustomerLineDto {
  charge_code_id?: string;
  code?: string;
  description?: string;
  quantity?: number;
  unit_price: number;
  unit?: string;
  source?: PortalCustomerLineSource;
}

export interface PortalEstimateSnapshotDto {
  currency_code?: string;
  estimated_total?: number;
  captured_at?: string;
}

export interface PortalQuotationEstimateDto {
  job_type: string;
  currency_code: string;
  origin_port_id?: string;
  dest_port_id?: string;
  commodity?: string;
  gross_weight?: number;
  chargeable_weight?: number;
  volume_cbm?: number;
  pieces?: number;
  container_type_id?: string;
  special_requirements?: string;
  valid_until?: string;
  container_count?: number;
  packages?: PortalCargoPackageDto[];
  service_codes?: string[];
  customer_lines?: PortalCustomerLineDto[];
  estimate_snapshot?: PortalEstimateSnapshotDto;
}

export interface PortalCostingOptionsDto {
  job_type: string;
  currency_code: string;
  origin_port_id?: string;
  dest_port_id?: string;
  gross_weight?: number;
  chargeable_weight?: number;
  volume_cbm?: number;
  pieces?: number;
  container_type_id?: string;
  container_count?: number;
  packages?: PortalCargoPackageDto[];
  service_codes?: string[];
}

export interface PortalQuotationCounterOfferDto {
  message: string;
  /** Required — stored as customer_proposed_total until tenant accepts */
  proposed_total: number;
  proposed_lines?: Array<{
    description?: string;
    quantity?: number;
    unit_price?: number;
    amount?: number;
  }>;
}

/** POST /portal/quotations/request — lean enquiry or costing-enriched draft. */
export interface PortalQuotationRequestDto {
  job_type: string;
  currency_code: string;
  origin_port_id?: string;
  dest_port_id?: string;
  commodity?: string;
  gross_weight?: number;
  chargeable_weight?: number;
  volume_cbm?: number;
  pieces?: number;
  container_type_id?: string;
  special_requirements?: string;
  valid_until?: string;
  container_count?: number;
  packages?: PortalCargoPackageDto[];
  service_codes?: string[];
  customer_lines?: PortalCustomerLineDto[];
  estimate_snapshot?: PortalEstimateSnapshotDto;
}

export interface PortalServiceCatalogItem {
  code: string;
  name: string;
  jobType?: string;
  pricingBasis?: string;
  unitPrice?: number;
  currencyCode?: string;
  chargeCodeId?: string;
  source?: PortalCustomerLineSource | string;
  raw?: Record<string, unknown>;
}

export interface PortalQuotationPackage {
  id?: string;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  grossWeightKg?: number;
  pieces?: number;
  cbm?: number;
}

export interface PortalQuotationEstimateResult {
  volumeCbm?: number;
  chargeableWeight?: number;
  lines: Array<{
    code?: string;
    description: string;
    amount?: number;
    currencyCode?: string;
    pricingSource?: string;
    unitPrice?: number;
    quantity?: number;
  }>;
  total?: number;
  currencyCode?: string;
  raw?: Record<string, unknown>;
}

export interface PortalEstimateSnapshot {
  currencyCode?: string;
  estimatedTotal?: number;
  capturedAt?: string;
}

export interface PortalQuotationSummary {
  total: number;
  open: number;
  won: number;
  lost: number;
  byStatus: Record<string, number>;
  raw?: Record<string, unknown>;
}

export interface PortalQuotationListItem {
  id: string;
  number: string;
  status?: string;
  jobType?: string;
  currencyCode?: string;
  origin?: string;
  destination?: string;
  validUntil?: string;
  createdAt?: string;
  raw?: Record<string, unknown>;
}

export interface PortalQuotationListResult {
  items: PortalQuotationListItem[];
  meta: PortalPaginationMeta;
}

export interface PortalQuotationDetail extends PortalQuotationListItem {
  commodity?: string;
  pieces?: number;
  grossWeight?: number;
  chargeableWeight?: number;
  volumeCbm?: number;
  specialRequirements?: string;
  source?: string;
  negotiationRound?: number;
  convertedJobNumber?: string;
  /** Linked job / shipment id after air approve (or convert). */
  jobId?: string;
  /** Linked NVOCC booking id for portal compliance form APIs. */
  bookingId?: string;
  packages?: PortalQuotationPackage[];
  /** Direct file URL when API includes one */
  pdfUrl?: string;
  /** Explicit readiness flag when API includes one */
  pdfReady?: boolean;
  portalEstimateSnapshot?: PortalEstimateSnapshot;
  negotiationPricing?: import('@/features/quotations/types/quotationExtended.types').NegotiationPricing;
  lines?: Array<{
    id: string;
    description: string;
    amount?: number;
    currencyCode?: string;
    chargeCode?: string;
    unit?: string;
    quantity?: number;
    unitPrice?: number;
    taxPercent?: number;
    taxAmount?: number;
    exchangeRate?: number;
    pricingSource?: string;
  }>;
}

/** Portal / Ops booking party — matches NvoccBookingFormPartyDto. */
export type PortalBookingFormParty = {
  party_kind: 'SHIPPER' | 'CONSIGNEE' | 'NOTIFY';
  full_name: string;
  address?: string;
  city?: string;
  country?: string;
  entity_kind?: 'COMPANY' | 'INDIVIDUAL';
  /** Email, phone, website, local IDs */
  other_details?: string;
};

/**
 * Customer + Ops booking form — field names match UpsertNvoccBookingFormDto
 * (GET/PUT /nvocc/bookings/:id/booking-form).
 */
export type PortalBookingForm = {
  id?: string;
  quotation_id?: string;
  date_of_request?: string;
  voyage_ref?: string;
  /** Booking No (if known) from client */
  client_booking_no?: string;
  gross_weight_kg?: number;
  net_weight_kg?: number;
  pol?: string;
  pod?: string;
  shipper_owned_container?: boolean;
  is_dg?: boolean;
  teu_count?: number;
  commodity?: string;
  hs_code?: string;
  final_use?: string;
  activity_sector?: 'CIVILIAN' | 'MILITARY' | 'NUCLEAR' | string;
  insurance_details?: string;
  lc_bank_details?: string;
  attach_commercial_invoice?: boolean;
  attach_correspondence?: boolean;
  attach_cod_form?: boolean;
  attach_licence?: boolean;
  booking_agent_line?: string;
  agent_requester_name?: string;
  sq_bl_booking_reference?: string;
  request_details?: string;
  consent_accepted?: boolean;
  mark_complete?: boolean;
  parties?: PortalBookingFormParty[];
};

/** PUT body whitelist — UpsertNvoccBookingFormDto. */
export type PortalBookingFormUpsertDto = {
  date_of_request?: string;
  voyage_ref?: string;
  client_booking_no?: string;
  gross_weight_kg?: number;
  net_weight_kg?: number;
  pol: string;
  pod: string;
  shipper_owned_container?: boolean;
  is_dg?: boolean;
  teu_count?: number;
  commodity: string;
  hs_code?: string;
  final_use?: string;
  activity_sector?: 'CIVILIAN' | 'MILITARY' | 'NUCLEAR' | string;
  insurance_details?: string;
  lc_bank_details?: string;
  attach_commercial_invoice?: boolean;
  attach_correspondence?: boolean;
  attach_cod_form?: boolean;
  attach_licence?: boolean;
  booking_agent_line?: string;
  agent_requester_name?: string;
  sq_bl_booking_reference?: string;
  request_details?: string;
  parties: PortalBookingFormParty[];
  mark_complete?: boolean;
  consent_accepted?: boolean;
};

