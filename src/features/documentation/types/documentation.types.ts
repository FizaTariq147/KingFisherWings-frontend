export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface DocumentationListParams {
  page?: number;
  limit?: number;
  order?: string;
  search?: string;
  branch_id?: string;
  department_id?: string;
  billing_party_id?: string;
  status?: string;
  /** UAE MPCI — alias of status (DocumentationMpciStatus). */
  filing_status?: string;
  from_date?: string;
  to_date?: string;
  job_type?: string;
  /** MPCI + closed-job lists. */
  job_id?: string;
}

export interface BoeListParams extends DocumentationListParams {
  boe_type?: string;
}

export interface ChargeTemplateListParams extends DocumentationListParams {
  is_active?: boolean;
}

export interface DocumentationRecord {
  id: string;
  [key: string]: unknown;
}

export interface CreateBoeRecordDto {
  boe_number: string;
  boe_date?: string;
  boe_type?: string;
  status?: string;
  job_id?: string;
  branch_id?: string;
  customs_office?: string;
  port_id?: string;
  party_id?: string;
}

export type UpdateBoeRecordDto = Partial<CreateBoeRecordDto>;

export interface BulkCostLineDto {
  job_id: string;
  charge_code_id?: string;
  description: string;
  currency_code: string;
  exchange_rate?: number;
  fcy_amount: number;
  sale_or_cost?: string;
  dr_cr?: string;
  tax_group_id?: string;
}

export interface BulkCostBatchDto {
  organization_id?: string;
  vessel_id?: string;
  voyage_number?: string;
  prorate_method?: string;
  lines: BulkCostLineDto[];
}

export interface ChargeTemplateLineDto {
  charge_code_id?: string;
  description: string;
  sale_or_cost?: string;
  dr_cr?: string;
  currency_code: string;
  default_amount?: number;
  tax_group_id?: string;
  sort_order?: number;
}

export interface CreateChargeTemplateDto {
  name: string;
  description?: string;
  job_types?: string[];
  is_active?: boolean;
  lines: ChargeTemplateLineDto[];
}

export type UpdateChargeTemplateDto = Partial<CreateChargeTemplateDto>;

export interface ApplyChargeTemplateDto {
  job_id: string;
}

export interface UpdateDeliveryOrderDto {
  do_number: string;
  do_date?: string;
  do_status?: 'ISSUED' | 'DELIVERED' | 'CANCELLED';
}

/** At least one of shipment_status / bl_status required (BE Phase 1). */
export interface UpdateShipmentBlStatusDto {
  shipment_status?: string;
  bl_status?: string;
}

/** PATCH /documentation/jobs/:jobId/doc-fields — Docs BE Phase 1. */
export interface UpdateJobDocFieldsDto {
  portnet_ref_no?: string;
  saber_certificate_no?: string;
  ra_code?: string;
  overseas_agent_party_id?: string;
  vgm_cutoff_date?: string;
  voyage_number?: string;
}

export interface CgmVoyageDto {
  vessel_name?: string;
  voyage_number?: string;
  pol_id?: string;
  pod_id?: string;
  etd?: string;
  eta?: string;
  remarks?: string;
}

export type UpdateCgmVoyageDto = Partial<CgmVoyageDto>;

export interface CreateMpciFilingDto {
  job_id?: string;
  mbl_number?: string;
  filing_type?: string;
  remarks?: string;
}

export interface AirTrackingParams {
  mawb_number: string;
}

export interface DocumentationReportParams extends DocumentationListParams {
  job_type?: string;
  department?: string;
}
