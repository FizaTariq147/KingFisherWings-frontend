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
  /** Required by POST /portal/quotations/estimate */
  packages: PortalCargoPackageDto[];
  /** Required by POST /portal/quotations/estimate */
  service_codes: string[];
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

/**
 * POST /portal/quotations/request — enquiry only.
 * Do not send packages or service_codes (forbidden / estimate-only).
 */
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
}

export interface PortalServiceCatalogItem {
  code: string;
  name: string;
  jobType?: string;
  pricingBasis?: string;
  unitPrice?: number;
  currencyCode?: string;
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
  }>;
  total?: number;
  currencyCode?: string;
  raw?: Record<string, unknown>;
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
  packages?: PortalQuotationPackage[];
  /** Direct file URL when API includes one */
  pdfUrl?: string;
  /** Explicit readiness flag when API includes one */
  pdfReady?: boolean;
  negotiationPricing?: import('@/features/quotations/types/quotationExtended.types').NegotiationPricing;
  lines?: Array<{
    id: string;
    description: string;
    amount?: number;
    currencyCode?: string;
  }>;
}
