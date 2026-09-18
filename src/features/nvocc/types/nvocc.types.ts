import type {
  NvoccCargoStatus,
  NvoccCargoType,
  NvoccCommodityType,
  NvoccEnquiryStatus,
  NvoccTariffStatus,
  NvoccVoyageStatus,
} from '../constants/nvocc.constants';

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

export interface NvoccTariff {
  id: string;
  trade_lane: string;
  pol_region?: string;
  pod_region?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  commodity_type?: NvoccCommodityType;
  container_type_id?: string;
  lcl_rate_cbm?: number;
  lcl_rate_wm?: number;
  lcl_minimum_charge?: number;
  fcl_rate?: number;
  origin_thc?: number;
  dest_thc?: number;
  bl_fee?: number;
  baf_surcharge?: number;
  caf_surcharge?: number;
  pss_surcharge?: number;
  gri_surcharge?: number;
  rate_valid_from?: string;
  rate_valid_to?: string;
  customer_id?: string;
  currency_code?: string;
  status?: NvoccTariffStatus;
  created_at?: string;
  updated_at?: string;
}

export interface NvoccVoyage {
  id: string;
  voyage_number?: string;
  vessel_id?: string;
  vessel_name?: string;
  shipping_line_id?: string;
  pol_id?: string;
  pod_id?: string;
  pol_name?: string;
  pod_name?: string;
  transshipment_port_id?: string;
  etd?: string;
  eta?: string;
  si_cutoff?: string;
  vgm_cutoff?: string;
  cy_cutoff?: string;
  cargo_cutoff?: string;
  slot_allocation_containers?: number;
  lcl_capacity_cbm?: number;
  mbl_number?: string;
  nvocc_freight_rate?: number;
  carrier_cost?: number;
  agent_pol_id?: string;
  agent_pod_id?: string;
  remarks?: string;
  voyage_status?: NvoccVoyageStatus;
  created_at?: string;
  updated_at?: string;
}

export interface NvoccEnquiry {
  id: string;
  enquiry_number?: string;
  customer_id?: string;
  customer_name?: string;
  voyage_id?: string;
  cargo_type?: NvoccCargoType;
  container_type_id?: string;
  container_count?: number;
  cbm?: number;
  gross_weight?: number;
  pieces?: number;
  commodity?: string;
  hs_code?: string;
  incoterms?: string;
  freight_terms?: string;
  rate_quoted?: number;
  rate_validity?: string;
  salesperson_id?: string;
  follow_up_date?: string;
  enquiry_status?: NvoccEnquiryStatus;
  created_at?: string;
  updated_at?: string;
}

export interface NvoccBooking {
  id: string;
  booking_number?: string;
  voyage_id?: string;
  enquiry_id?: string;
  shipper_id?: string;
  consignee_id?: string;
  notify_id?: string;
  agent_pol_id?: string;
  agent_pod_id?: string;
  cargo_type?: NvoccCargoType;
  container_type_id?: string;
  container_count?: number;
  cbm_allocated?: number;
  gross_weight?: number;
  pieces?: number;
  commodity?: string;
  hs_code?: string;
  is_dg?: boolean;
  marks_numbers?: string;
  incoterms?: string;
  freight_terms?: string;
  other_charges_terms?: string;
  shipper_ref?: string;
  job_type?: string;
  booking_status?: string;
  hbl_number?: string;
  job_id?: string;
  job_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NvoccLoadListItem {
  id: string;
  booking_id?: string;
  booking_number?: string;
  container_number?: string;
  seal_number?: string;
  container_type_id?: string;
  pieces?: number;
  gross_weight_kg?: number;
  cbm?: number;
  commodity?: string;
  marks_numbers?: string;
  cargo_status?: NvoccCargoStatus;
  cargo_received_date?: string;
  stuffing_date?: string;
  vessel_loaded_date?: string;
}

export interface NvoccTariffListParams {
  status?: NvoccTariffStatus;
  search?: string;
}

export interface NvoccVoyageListParams {
  voyage_status?: NvoccVoyageStatus;
  vessel_id?: string;
  pol_id?: string;
  pod_id?: string;
  etd_from?: string;
  etd_to?: string;
  search?: string;
}

export interface NvoccEnquiryListParams {
  enquiry_status?: NvoccEnquiryStatus;
  voyage_id?: string;
  customer_id?: string;
  salesperson_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface NvoccBookingListParams {
  voyage_id?: string;
  shipper_id?: string;
  cargo_type?: NvoccCargoType;
  booking_status?: string;
  search?: string;
}

export interface CreateNvoccTariffDto {
  trade_lane: string;
  pol_region?: string;
  pod_region?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  commodity_type?: NvoccCommodityType;
  container_type_id?: string;
  lcl_rate_cbm?: number;
  lcl_rate_wm?: number;
  lcl_minimum_charge?: number;
  fcl_rate?: number;
  origin_thc?: number;
  dest_thc?: number;
  bl_fee?: number;
  baf_surcharge?: number;
  caf_surcharge?: number;
  pss_surcharge?: number;
  gri_surcharge?: number;
  rate_valid_from: string;
  rate_valid_to?: string;
  customer_id?: string;
  currency_code: string;
  status?: NvoccTariffStatus;
}

export type UpdateNvoccTariffDto = Partial<CreateNvoccTariffDto>;

export interface CreateNvoccVoyageDto {
  vessel_id?: string;
  shipping_line_id?: string;
  pol_id?: string;
  pod_id?: string;
  transshipment_port_id?: string;
  etd?: string;
  eta?: string;
  si_cutoff?: string;
  vgm_cutoff?: string;
  cy_cutoff?: string;
  cargo_cutoff?: string;
  slot_allocation_containers?: number;
  lcl_capacity_cbm?: number;
  mbl_number?: string;
  nvocc_freight_rate?: number;
  carrier_cost?: number;
  agent_pol_id?: string;
  agent_pod_id?: string;
  remarks?: string;
}

export interface UpdateNvoccVoyageDto extends CreateNvoccVoyageDto {
  voyage_status?: NvoccVoyageStatus;
}

export interface CopyNvoccVoyageDto {
  etd?: string;
  eta?: string;
}

export interface CreateNvoccEnquiryDto {
  customer_id?: string;
  voyage_id?: string;
  cargo_type?: NvoccCargoType;
  container_type_id?: string;
  container_count?: number;
  cbm?: number;
  gross_weight?: number;
  pieces?: number;
  commodity?: string;
  hs_code?: string;
  incoterms?: string;
  freight_terms?: string;
  rate_quoted?: number;
  rate_validity?: string;
  salesperson_id?: string;
  follow_up_date?: string;
}

export interface UpdateNvoccEnquiryDto extends CreateNvoccEnquiryDto {
  enquiry_status?: NvoccEnquiryStatus;
}

export interface SendNvoccRateDto {
  to_email: string;
  cc_email?: string;
  subject?: string;
  message?: string;
}

export interface MarkNvoccEnquiryLostDto {
  loss_reason: string;
}

export interface CreateNvoccBookingDto {
  voyage_id: string;
  enquiry_id?: string;
  shipper_id?: string;
  consignee_id?: string;
  notify_id?: string;
  agent_pol_id?: string;
  agent_pod_id?: string;
  cargo_type: NvoccCargoType;
  container_type_id?: string;
  container_count?: number;
  cbm_allocated?: number;
  gross_weight?: number;
  pieces?: number;
  commodity?: string;
  hs_code?: string;
  is_dg?: boolean;
  dg_un_number?: string;
  dg_class?: string;
  dg_packing_group?: string;
  marks_numbers?: string;
  incoterms?: string;
  freight_terms?: string;
  other_charges_terms?: string;
  shipper_ref?: string;
  job_type?: string;
  apply_tariff?: boolean;
}

export type UpdateNvoccBookingDto = Partial<CreateNvoccBookingDto>;

export interface ConvertNvoccBookingToJobDto {
  company_id?: string;
  branch_id?: string;
  department_id?: string;
}

export interface SendCutoffReminderDto {
  to_email?: string;
  message?: string;
}

export interface AssignLoadListContainerDto {
  container_number: string;
  seal_number?: string;
  container_type_id?: string;
}

export type UpdateNvoccLoadListItemDto = Partial<
  Omit<AssignLoadListContainerDto, 'container_number'> & {
    container_number?: string;
    pieces?: number;
    gross_weight_kg?: number;
    cbm?: number;
    commodity?: string;
    marks_numbers?: string;
    cargo_status?: NvoccCargoStatus;
    cargo_received_date?: string;
    stuffing_date?: string;
    vessel_loaded_date?: string;
  }
>;

export interface NvoccTariffLookupParams {
  origin_port_id?: string;
  dest_port_id?: string;
  commodity_type?: NvoccCommodityType;
  container_type_id?: string;
  cargo_type?: NvoccCargoType;
  customer_id?: string;
}

export interface NvoccTradeLaneReportParams {
  from?: string;
  to?: string;
  group_by?: string;
}

export interface NvoccUtilizationReportParams {
  voyage_status?: NvoccVoyageStatus;
  from?: string;
}

export interface RecordNvoccMblReceivedDto {
  mbl_number?: string;
}

/** Sea-export workflow booking form (GET/PUT /nvocc/bookings/:id/booking-form). */
export type NvoccBookingFormPartyKind = 'SHIPPER' | 'CONSIGNEE' | 'NOTIFY';
export type NvoccBookingFormEntityKind = 'COMPANY' | 'INDIVIDUAL';

export interface NvoccBookingFormParty {
  party_kind: NvoccBookingFormPartyKind;
  full_name?: string;
  address?: string;
  city?: string;
  country?: string;
  entity_kind?: NvoccBookingFormEntityKind;
  other_details?: string;
}

export type NvoccBookingForm = Record<string, unknown> & {
  id?: string;
  booking_id?: string;
  date_of_request?: string;
  voyage_ref?: string;
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
  activity_sector?: string;
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
  parties?: NvoccBookingFormParty[];
  mark_complete?: boolean;
};

/** PUT body — whitelist matches UpsertNvoccBookingFormDto (forbidUnknownValues). */
export type UpdateNvoccBookingFormDto = {
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
  activity_sector?: string;
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
  parties: NvoccBookingFormParty[];
  mark_complete?: boolean;
  consent_accepted?: boolean;
  admin_override?: boolean;
  stage_override_reason?: string;
};

export interface NvoccContainerRequest {
  id: string;
  job_id?: string;
  container_type_id?: string;
  container_type_code?: string;
  quantity?: number;
  status?: string;
  cro_number?: string;
  container_number?: string;
  issued_at?: string;
  allocated_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNvoccContainerRequestDto {
  container_type_id?: string;
  quantity?: number;
  notes?: string;
  [key: string]: unknown;
}

export type NvoccWorkflowActionDto = Record<string, unknown>;
