export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ShipmentActions {
  can_generate_job?: boolean;
  can_change_status?: boolean;
  can_change_bl_status?: boolean;
  can_change_department?: boolean;
  can_copy?: boolean;
  can_split?: boolean;
  can_merge?: boolean;
  can_switch_bl?: boolean;
  can_create_submaster?: boolean;
  can_edi?: boolean;
  can_kpi?: boolean;
  can_tracking?: boolean;
  can_bl_entry?: boolean;
  can_awb?: boolean;
  can_booking_form?: boolean;
  can_hbl_document?: boolean;
  /** EDI action path segments when provided by backend. */
  allowed_edi_actions?: string[];
  /** Permitted status values when provided by backend. */
  allowed_statuses?: string[];
  allowed_bl_statuses?: string[];
  raw?: Record<string, unknown>;
}

export interface ShipmentDetailTab {
  key: string;
  label?: string;
}

export interface Shipment {
  id: string;
  shipment_number?: string;
  reference?: string;
  status?: string;
  bl_status?: string;
  job_type?: string;
  service_type?: string;
  party_id?: string;
  party_name?: string;
  customer_id?: string;
  customer_name?: string;
  quotation_id?: string;
  quotation_number?: string;
  enquiry_id?: string;
  enquiry_number?: string;
  job_id?: string;
  job_number?: string;
  department_id?: string;
  department_name?: string;
  company_id?: string;
  company_name?: string;
  salesperson_id?: string;
  salesperson_name?: string;
  branch_id?: string;
  branch_name?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  origin_port_name?: string;
  dest_port_name?: string;
  por?: string;
  pol?: string;
  pod?: string;
  pof?: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  cargo_details?: string;
  commodity?: string;
  container_count?: number;
  container_type_id?: string;
  container_type_name?: string;
  incoterms?: string;
  freight_payment_type?: string;
  currency_code?: string;
  mbl_number?: string;
  hbl_number?: string;
  etd?: string;
  eta?: string;
  vessel_name?: string;
  voyage_number?: string;
  carrier_name?: string;
  created_at?: string;
  updated_at?: string;
  actions?: ShipmentActions;
  /** From GET /shipments/:id/detail when present. */
  tabs?: ShipmentDetailTab[];
  path_hints?: string[];
  ops_continuum?: Record<string, unknown>;
  header?: Record<string, unknown>;
  links?: Record<string, unknown>;
  sections?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ShipmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  job_type?: string;
  /** OpenAPI: customer_id (party / customer UUID). */
  customer_id?: string;
  /** @deprecated Prefer customer_id — mapped to customer_id on GET /shipments. */
  party_id?: string;
  job_id?: string;
  quotation_id?: string;
  /** GET /shipments?voyage_number=&vessel_name= */
  voyage_number?: string;
  vessel_name?: string;
}

export interface ShipmentListResult {
  shipments: Shipment[];
  meta: PaginationMeta;
}

/**
 * POST /shipments — OpenAPI CreateShipmentDto.
 * Required: job_type, customer_id.
 */
export interface CreateShipmentDto {
  job_type: string;
  customer_id: string;
  /** @deprecated Mapped to customer_id before POST; never sent as party_id. */
  party_id?: string;
  quotation_id?: string;
  enquiry_id?: string;
  company_id?: string;
  branch_id?: string;
  department_id?: string;
  shipper_id?: string;
  consignee_id?: string;
  notify_party_id?: string;
  delivery_agent_id?: string;
  carrier_agent_id?: string;
  salesperson_id?: string;
  carrier_id?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  por_port_id?: string;
  pof_port_id?: string;
  place_of_delivery?: string;
  shipment_date?: string;
  customer_address?: string;
  freight_terms?: string;
  freight_payable_at?: string;
  freight_payment_type?: string;
  marks_numbers?: string;
  is_cross_trade?: boolean;
  etd?: string;
  eta?: string;
  atd?: string;
  ata?: string;
  onboard_date?: string;
  vessel_name?: string;
  voyage_number?: string;
  flight_number?: string;
  commodity?: string;
  hs_code?: string;
  gross_weight?: number;
  chargeable_weight?: number;
  volume_cbm?: number;
  pieces?: number;
  container_type_id?: string;
  container_count?: number;
  container_numbers?: string;
  seal_numbers?: string;
  incoterms?: string;
  is_dg?: boolean;
  dg_class?: string;
  notes?: string;
  hbl_number?: string;
  hbl_date?: string;
  bl_status?: string;
  charges?: CreateShipmentChargeDto[];
}

export type UpdateShipmentDto = Partial<Omit<CreateShipmentDto, 'job_type' | 'customer_id'>> & {
  job_type?: string;
  customer_id?: string;
  party_id?: string;
  status?: string;
};

export interface ChangeShipmentStatusDto {
  status: string;
  remarks?: string;
}

export interface ChangeShipmentBlStatusDto {
  bl_status: string;
  hbl_number?: string;
  hbl_date?: string;
}

export interface ChangeShipmentDepartmentDto {
  department_id: string;
  branch_id?: string;
}

export interface SplitShipmentDto {
  charge_ids?: string[];
}

export interface MergeShipmentsDto {
  source_shipment_ids: string[];
}

/** POST /shipments/:id/generate-job — OpenAPI GenerateJobFromShipmentDto. */
export type ShipmentGenerateJobMode = 'HOUSE' | 'DIRECT';

export interface GenerateJobFromShipmentDto {
  mode: ShipmentGenerateJobMode;
}

/** Nested on CreateShipmentDto.charges — OpenAPI CreateShipmentChargeDto. */
export interface CreateShipmentChargeDto {
  description: string;
  unit_price: number;
  charge_code_id?: string;
  quantity?: number;
  currency_code?: string;
  is_cost?: boolean;
  party_id?: string;
}

/** POST /shipments/:id/get-charges — pull from quotation / party standards. */
export interface GetShipmentChargesDto {
  quotation_id?: string;
  include_standard_charges?: boolean;
  [key: string]: unknown;
}

/** POST /shipments/:id/copy-charges */
export interface CopyShipmentChargesDto {
  source_shipment_id?: string;
  source_job_id?: string;
  source_quotation_id?: string;
  [key: string]: unknown;
}

/**
 * OpenAPI ChangeShipmentStatusDto.status enum — full Change Status catalog
 * when detail `actions.allowed_statuses` is omitted.
 */
export const SHIPMENT_STATUSES = [
  'BOOKED',
  'CONFIRMED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD',
] as const;

/**
 * OpenAPI ChangeShipmentBlStatusDto.bl_status enum — full Change BL Status catalog
 * when detail `actions.allowed_bl_statuses` is omitted.
 */
export const SHIPMENT_BL_STATUSES = [
  'DRAFT',
  'ORIGINAL',
  'SURRENDERED',
  'TELEX_RELEASE',
  'SEAWAY',
  'CANCELLED',
] as const;

/** OpenAPI GenerateShipmentEdiDto — same enum as job EDI */
export type GenerateShipmentEdiDto = {
  edi_type: string;
};
