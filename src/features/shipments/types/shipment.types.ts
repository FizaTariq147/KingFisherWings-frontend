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
  party_id?: string;
  quotation_id?: string;
}

export interface ShipmentListResult {
  shipments: Shipment[];
  meta: PaginationMeta;
}

export interface CreateShipmentDto {
  quotation_id?: string;
  enquiry_id?: string;
  party_id?: string;
  job_type?: string;
  service_type?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  cargo_details?: string;
  currency_code?: string;
  [key: string]: unknown;
}

export type UpdateShipmentDto = Partial<CreateShipmentDto> & {
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

export const SHIPMENT_STATUSES = [
  'BOOKED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD',
] as const;

export const SHIPMENT_BL_STATUSES = [
  'DRAFT',
  'ORIGINAL',
  'SURRENDERED',
  'TELEX_RELEASE',
  'SEAWAY',
  'CANCELLED',
] as const;
