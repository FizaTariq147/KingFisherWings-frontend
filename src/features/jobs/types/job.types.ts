import type {
  ContainerStatus,
  JobDocumentType,
  JobStatus,
  JobType,
} from '../constants/job.constants';
import type {
  CreateJobFormValues,
  UpdateJobFormValues,
} from '../schemas/job.schema';

export type { CreateJobFormValues, UpdateJobFormValues } from '../schemas/job.schema';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  job_type?: JobType;
  shipper_id?: string;
  consignee_id?: string;
  salesperson_id?: string;
  branch_id?: string;
  company_id?: string;
  department_id?: string;
  created_by?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  masters_only?: boolean;
  parent_job_id?: string;
  /** OpenAPI: etd | eta | atd | ata — which date from_date/to_date apply to. */
  date_field?: 'etd' | 'eta' | 'atd' | 'ata';
  from_date?: string;
  to_date?: string;
  order?: 'asc' | 'desc';
  container_number?: string;
  vessel_id?: string;
  shipping_line_id?: string;
  voyage_number?: string;
  container_type_id?: string;
  /** Client-side: filter list to segment job types (not sent if single job_type set). */
  job_types?: JobType[];
  vehicle_number?: string;
  trucker_id?: string;
  tracking_number?: string;
}

/** Matches Swagger UpdateAirJobDetailDto / nested air_details. */
export interface JobAirDetail {
  airline_id?: string;
  origin_airport_id?: string;
  dest_airport_id?: string;
  hawb_number?: string;
  mawb_number?: string;
  flight_number?: string;
  flight_date?: string;
  screened?: boolean;
  screening_ref?: string;
  awb_type?: 'Direct' | 'Back-to-Back' | 'Consol' | string;
  freight_type?: 'Prepaid' | 'Collect' | string;
  conversion_factor?: number;
}

/** GET/PUT /jobs/:id/air-booking-form — UpsertAirBookingFormDto */
export type AirBookingFormPartyKind = 'SHIPPER' | 'CONSIGNEE' | 'NOTIFY';
export type AirBookingFormEntityKind = 'COMPANY' | 'INDIVIDUAL';

export interface AirBookingFormParty {
  party_kind: AirBookingFormPartyKind;
  full_name?: string;
  address?: string;
  city?: string;
  country?: string;
  entity_kind?: AirBookingFormEntityKind;
  other_details?: string;
}

/** Air pallet line — AirPalletLineDto (booking + compliance). */
export interface AirPalletLineDto {
  pallet_type: string;
  count: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
}

export type AirBookingForm = Record<string, unknown> & {
  air_pallet_type_id?: string;
  pieces?: number;
  gross_weight_kg?: number;
  chargeable_weight_kg?: number;
  volume_cbm?: number;
  pallet_count?: number;
  pallets?: AirPalletLineDto[];
  commodity?: string;
  special_handling?: string;
  notes?: string;
  is_dg?: boolean;
  flight_number?: string;
  flight_date?: string;
  origin_airport_code?: string;
  dest_airport_code?: string;
  arrival_flight_number?: string;
  mawb_from_origin?: string;
  agent_at_origin?: string;
  delivery_address?: string;
  customs_value?: number;
  parties?: AirBookingFormParty[];
  mark_complete?: boolean;
};

export type UpdateAirBookingFormDto = {
  admin_override?: boolean;
  stage_override_reason?: string;
  /** @deprecated Not on UpsertAirBookingFormDto — use ULD request APIs */
  air_pallet_type_id?: string;
  pieces?: number;
  gross_weight_kg?: number;
  chargeable_weight_kg?: number;
  volume_cbm?: number;
  pallet_count?: number;
  pallets?: AirPalletLineDto[];
  /** maxLength 500 */
  commodity?: string;
  special_handling?: string;
  notes?: string;
  is_dg?: boolean;
  /** maxLength 20 */
  flight_number?: string;
  flight_date?: string;
  /** maxLength 10 — IATA/ICAO code */
  origin_airport_code?: string;
  /** maxLength 10 — IATA/ICAO code */
  dest_airport_code?: string;
  /** maxLength 20 */
  arrival_flight_number?: string;
  /** maxLength 50 */
  mawb_from_origin?: string;
  /** maxLength 200 */
  agent_at_origin?: string;
  delivery_address?: string;
  customs_value?: number;
  parties?: AirBookingFormParty[];
  mark_complete?: boolean;
};

/**
 * Staff GET/PUT /jobs/:id/air/compliance-form
 * Portal GET/PUT /portal/shipments/:id/compliance-form
 * — UpsertAirComplianceBookingFormDto / SubmitAirComplianceFormDto
 */
export type AirCompliancePartyDto = AirBookingFormParty;

export type UpsertAirComplianceBookingFormDto = {
  date_of_request?: string;
  voyage_ref?: string;
  client_booking_no?: string;
  service_scope?: JobServiceScope | string;
  origin_door_address?: string;
  dest_door_address?: string;
  origin_airport_code?: string;
  dest_airport_code?: string;
  pieces?: number;
  gross_weight_kg?: number;
  net_weight_kg?: number;
  chargeable_weight_kg?: number;
  volume_cbm?: number;
  pallet_count?: number;
  pallets?: AirPalletLineDto[];
  is_dg?: boolean;
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
  parties?: AirCompliancePartyDto[];
  mark_complete?: boolean;
  consent_accepted?: boolean;
  admin_override?: boolean;
  stage_override_reason?: string;
};

export type AirComplianceForm = Record<string, unknown> & UpsertAirComplianceBookingFormDto;

/** POST /jobs/:id/air/send-invoice — MarkAirInvoiceSentDto */
export type MarkAirInvoiceSentDto = {
  admin_override?: boolean;
  stage_override_reason?: string;
  invoice_id?: string;
};

export type AirWorkflowActionDto = MarkAirInvoiceSentDto & Record<string, unknown>;

export interface AirUldRequest {
  id: string;
  job_id?: string;
  air_pallet_type_id?: string;
  air_pallet_type_code?: string;
  quantity?: number;
  status?: string;
  uld_number?: string;
  issued_at?: string;
  allocated_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAirUldRequestDto {
  air_pallet_type_id?: string;
  quantity?: number;
  notes?: string;
  [key: string]: unknown;
}

/** Matches Swagger UpdateSeaFclJobDetailDto / nested sea_fcl_details. */
export interface JobSeaFclDetail {
  shipping_line_id?: string;
  vessel_id?: string;
  voyage_number?: string;
  /** Resolved display label (customer module). */
  shipping_line_name?: string;
  vessel_name?: string;
  hbl_number?: string;
  mbl_number?: string;
  booking_number?: string;
  carrier_booking_ref?: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  etd?: string;
  eta?: string;
  actual_eta?: string;
  incoterms?: string;
  stuffing_location?: 'CY' | 'CFS' | 'SHIPPER_PREMISES' | string;
  stuffing_date?: string;
  si_cutoff?: string;
  vgm_cutoff?: string;
  cy_cutoff?: string;
  si_submitted_at?: string;
  si_version?: number;
  vgm_submitted_at?: string;
  vgm_method?: 'SM1' | 'SM2' | string;
  port_of_loading_id?: string;
  port_of_discharge_id?: string;
  bl_type?: 'Original' | 'Seaway' | 'Express Release' | 'Surrendered' | string;
  freight_terms?: 'Prepaid' | 'Collect' | 'Third Party' | string;
  transhipment_port?: string;
  sailed_at?: string;
  mbl_number_from_line?: string;
  hbl_number_from_agent?: string;
  customs_entry_number?: string;
  customs_examination_details?: string;
  customs_duty_amount?: number;
  customs_tax_amount?: number;
  customs_clearance_date?: string;
  customs_status?: 'PENDING' | 'FILED' | 'QUERY' | 'CLEARED' | 'RELEASED' | string;
  customs_broker_id?: string;
  linked_export_job_id?: string;
  cfs_storage_rate_per_day?: number;
  cfs_storage_start_date?: string;
}

/** Matches Swagger UpdateSeaLclJobDetailDto / nested sea_lcl_details. */
export interface JobSeaLclDetail {
  shipping_line_id?: string;
  vessel_id?: string;
  voyage_number?: string;
  /** Resolved display label when API/lookup provides it. */
  vessel_name?: string;
  booking_number?: string;
  carrier_booking_ref?: string;
  hbl_number?: string;
  mbl_number?: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  etd?: string;
  eta?: string;
  actual_eta?: string;
  incoterms?: string;
  freight_terms?: string;
  bl_type?: string;
  port_of_loading_id?: string;
  port_of_discharge_id?: string;
  transhipment_port?: string;
  sailed_at?: string;
  si_cutoff?: string;
  si_submitted_at?: string;
  si_version?: number;
  consolidation_number?: string;
  cfs_warehouse_id?: string;
  cfs_storage_free_days?: number;
  cfs_storage_rate_per_day?: number;
  cfs_storage_start_date?: string;
  storage_rate_basis?: string;
  wms_storage_charge_id?: string;
  customs_broker_id?: string;
  customs_entry_number?: string;
  customs_examination_details?: string;
  customs_duty_amount?: number;
  customs_tax_amount?: number;
  customs_clearance_date?: string;
  customs_status?: string;
  linked_export_job_id?: string;
}

/** Matches Swagger UpdateCourierJobDetailDto / nested courier_details. */
export interface JobCourierDetail {
  courier_vendor_id?: string;
  tracking_number?: string;
  service_type?: string;
  label_format?: string;
  barcode_value?: string;
  pickup_address?: string;
  delivery_address?: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  linked_export_job_id?: string;
  linked_import_job_id?: string;
}

/** Matches Swagger UpdateLandJobDetailDto / nested land_details. */
export interface JobLandDetail {
  trucker_id?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  driver_name?: string;
  driver_license?: string;
  origin_city_country?: string;
  destination_city_country?: string;
  etd?: string;
  eta?: string;
  incoterms?: string;
  freight_terms?: string;
  border_origin_country?: string;
  border_destination_country?: string;
  border_declaration_number?: string;
  border_hs_code?: string;
  border_commodity?: string;
  border_declared_value?: number;
  cross_border_docs_required?: boolean;
}

/** Matches Swagger UpdateRoadFreightJobDetailDto / nested road_freight_details. */
export interface JobRoadFreightDetail extends JobLandDetail {
  trailer_number?: string;
  route_notes?: string;
}

export type JobServiceScope =
  | 'DOOR_TO_DOOR'
  | 'DOOR_TO_PORT'
  | 'PORT_TO_DOOR'
  | 'PORT_TO_PORT';

export type JobCargoCategory =
  | 'GENERAL'
  | 'VEHICLES'
  | 'FOOD_PERISHABLE'
  | 'PHARMA'
  | 'CHEMICALS_DG'
  | 'PERSONAL_EFFECTS'
  | 'PROJECT_OOG'
  | 'LIVESTOCK'
  | 'OTHER';

/** Mode booking form party — BookingFormPartyDto. */
export type BookingFormPartyKind =
  | 'SHIPPER'
  | 'CONSIGNEE'
  | 'NOTIFY'
  | 'BILLING'
  | 'AGENT';

export type BookingFormEntityKind = 'COMPANY' | 'INDIVIDUAL';

export interface BookingFormPartyDto {
  party_kind: BookingFormPartyKind | string;
  full_name?: string;
  address?: string;
  city?: string;
  country?: string;
  entity_kind?: BookingFormEntityKind | string;
  other_details?: string;
}

/** Sea FCL containers line — ContainerSizeLineDto. */
export interface ContainerSizeLineDto {
  container_type_id?: string;
  iso_size?: string;
  count: number;
}

/** Warehouse booking stock line — WhStockLineInputDto. */
export interface WhStockLineInputDto {
  sku_code?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  cbm?: number;
}

/**
 * Shared staff mode booking form —
 * Upsert{SeaFcl|SeaLcl|Land|RoadFreight|Courier|Warehouse|CustomsClearance}BookingFormDto.
 * Mode-specific fields are optional and ignored by other modes.
 */
export type ModeBookingForm = Record<string, unknown> & {
  date_of_request?: string;
  client_booking_no?: string;
  voyage_ref?: string;
  service_scope?: JobServiceScope | string;
  origin_door_address?: string;
  dest_door_address?: string;
  commodity?: string;
  hs_code?: string;
  cargo_category?: JobCargoCategory | string;
  is_dg?: boolean;
  dg_class?: string;
  gross_weight_kg?: number;
  net_weight_kg?: number;
  volume_cbm?: number;
  pieces?: number;
  insurance_details?: string;
  request_details?: string;
  attach_commercial_invoice?: boolean;
  attach_packing_list?: boolean;
  attach_bl_awb_copy?: boolean;
  attach_carnet?: boolean;
  attach_vehicle_title?: boolean;
  attach_msds?: boolean;
  attach_dangerous_goods_declaration?: boolean;
  attach_health_veterinary?: boolean;
  attach_fda_moh?: boolean;
  parties?: BookingFormPartyDto[];
  mark_complete?: boolean;
  consent_accepted?: boolean;
  etd?: string;
  eta?: string;
  incoterms?: string;
  freight_terms?: string;
  /** Sea FCL / LCL */
  pol?: string;
  pod?: string;
  shipper_owned_container?: boolean;
  teu_count?: number;
  containers?: ContainerSizeLineDto[];
  cfs_warehouse?: string;
  /** Land / Road / Courier */
  origin_city_country?: string;
  dest_city_country?: string;
  vehicle_type?: string;
  border_crossing?: string;
  tracking_number?: string;
  /** Warehouse — UpsertWarehouseBookingFormDto */
  warehouse_id?: string;
  warehouse_name?: string;
  expected_inbound_at?: string;
  expected_outbound_at?: string;
  storage_days_requested?: number;
  bonded?: boolean;
  temperature_controlled?: boolean;
  handling_instructions?: string;
  freight_job_id?: string;
  stock_lines?: WhStockLineInputDto[];
  /** Customs Clearance — UpsertCustomsClearanceBookingFormDto */
  direction?: 'IMPORT' | 'EXPORT' | 'TRANSIT' | string;
  border_or_port?: string;
  entry_type?: string;
  declaration_type?: string;
  port_of_entry?: string;
  port_of_exit?: string;
  country_of_origin?: string;
  country_of_destination?: string;
  invoice_value_amount?: number;
  invoice_currency?: string;
  cargo_lines?: CcCargoLineInputDto[];
  attach_coo?: boolean;
  attach_poa?: boolean;
  attach_permit?: boolean;
};

/** Customs booking cargo line — CcCargoLineInputDto. */
export interface CcCargoLineInputDto {
  description?: string;
  hs_code?: string;
  country_of_origin?: string;
  quantity?: number;
  unit?: string;
  value_amount?: number;
  currency_code?: string;
}

export type UpsertSeaFclBookingFormDto = ModeBookingForm;
export type UpsertSeaLclBookingFormDto = ModeBookingForm;
export type UpsertLandBookingFormDto = ModeBookingForm;
export type UpsertRoadFreightBookingFormDto = ModeBookingForm;
export type UpsertCourierBookingFormDto = ModeBookingForm;
export type UpsertWarehouseBookingFormDto = ModeBookingForm;
export type UpsertCustomsClearanceBookingFormDto = ModeBookingForm;

export type StaffBookingFormMode =
  | 'SEA_FCL'
  | 'SEA_LCL'
  | 'LAND'
  | 'ROAD_FREIGHT'
  | 'COURIER'
  | 'WAREHOUSE'
  | 'CUSTOMS_CLEARANCE';

export interface JobCharge {
  id: string;
  charge_code_id: string;
  charge_code?: string;
  description: string;
  quantity?: number;
  unit_price: number;
  currency_code: string;
  exchange_rate?: number;
  tax_rate_id?: string;
  is_cost?: boolean;
  is_billable?: boolean;
  is_provisional?: boolean;
  party_id?: string;
  party_name?: string;
  line_total?: number;
}

export interface JobMilestone {
  id: string;
  milestone: string;
  planned_date?: string;
  actual_date?: string;
  is_completed?: boolean;
  notes?: string;
}

export interface JobNote {
  id: string;
  note: string;
  is_private?: boolean;
  is_pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface JobContainer {
  id: string;
  container_type_id: string;
  container_number?: string;
  seal_number?: string;
  status?: ContainerStatus;
  tare_weight?: number;
  max_payload?: number;
  cubic_capacity?: number;
  gross_weight?: number;
  vgm_weight?: number;
  cbm?: number;
  is_soc?: boolean;
  gate_in_at?: string;
}

export interface JobCargo {
  id: string;
  container_id?: string;
  consignee_id?: string;
  commodity?: string;
  hs_code?: string;
  description?: string;
  marks_numbers?: string;
  packages?: number;
  gross_weight?: number;
  measurement?: number;
}

export interface JobDocument {
  id: string;
  document_type: JobDocumentType | string;
  file_name: string;
  file_url?: string;
  reference_number?: string;
  s3_key?: string;
  file_size?: number;
  mime_type?: string;
  status?: string;
  is_finalized?: boolean;
}

export interface JobBillOfLading {
  id: string;
  bl_type: string;
  bl_number?: string;
  is_original?: boolean;
  is_surrendered?: boolean;
  is_draft?: boolean;
  is_express_release?: boolean;
}

export interface JobStuffingRecord {
  id: string;
  container_id?: string;
  supervisor_name: string;
  stuffing_date: string;
  location?: string;
  goods_condition?: string;
  notes?: string;
}

export interface JobDeposit {
  id: string;
  deposit_type: string;
  deposit_amount: number;
  currency_code?: string;
  deposit_receipt_number?: string;
  deposit_expiry_date?: string;
  remarks?: string;
}

export interface JobPnl {
  revenue?: number;
  cost?: number;
  gross_profit?: number;
  currency_code?: string;
  lines?: Array<Record<string, unknown>>;
}

/** Fresa GET /jobs/:id/detail action flags. */
export interface JobActions {
  can_change_status?: boolean;
  can_reopen?: boolean;
  can_stop?: boolean;
  can_close?: boolean;
  can_cancel?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_copy?: boolean;
  can_gpum?: boolean;
  can_status_options?: boolean;
  can_documents?: boolean;
  can_invoices?: boolean;
  can_pnl?: boolean;
  can_milestones?: boolean;
  can_notes?: boolean;
  can_vendor_offers?: boolean;
  can_logistics?: boolean;
  can_cargo?: boolean;
  can_bl?: boolean;
  can_stuffing?: boolean;
  can_sea_scans?: boolean;
  can_vouchers?: boolean;
  can_house?: boolean;
  can_house_jobs?: boolean;
  can_cc_details?: boolean;
  can_cc_lines?: boolean;
  can_cc_checklist?: boolean;
  can_cc_declaration?: boolean;
  can_cc_queries?: boolean;
  can_cc_finance?: boolean;
  /** Permitted status values when provided by backend. */
  allowed_statuses?: string[];
  raw?: Record<string, unknown>;
  [key: string]: boolean | string[] | Record<string, unknown> | undefined;
}

export interface JobDetailTab {
  key: string;
  label?: string;
}

export interface JobStatusOption {
  value: string;
  label: string;
  /** Approved / Open / Closed grouping when API returns groups. */
  group?: string;
}

export interface ChangeJobStatusDto {
  status: JobStatus | string;
  reason?: string;
}

export interface ReopenJobDto {
  status?: JobStatus | string;
  reason?: string;
}

export interface StopJobDto {
  reason?: string;
}

export interface UpsertJobPartyReferenceDto {
  party_role?: 'CLIENT' | 'SHIPPER' | 'CONSIGNEE' | 'BILLING_PARTY' | 'AGENT' | string;
  party_id?: string;
  reference_type: 'PO_NUMBER' | 'CUSTOMER_REF' | 'OTHER' | string;
  reference_no: string;
}

export interface PatchJobDimensionsDto {
  commodity_description?: string;
  hs_code?: string;
}

/** POST /jobs/:id/organizations — AddJobOrganizationDto */
export interface AddJobOrganizationDto {
  org_type: string;
  party_id?: string;
  create_party?: Record<string, unknown>;
  is_primary_customer?: boolean;
}

/** PUT /jobs/:id/organizations/:orgType */
export interface ReplaceJobOrganizationDto {
  party_id?: string;
  create_party?: Record<string, unknown>;
  is_primary_customer?: boolean;
}

/** POST /jobs/:id/organizations/copy-from */
export interface CopyJobOrganizationsDto {
  source_job_id?: string;
  overwrite?: boolean;
}

/** POST /jobs/:id/dimensions — UpsertJobDimensionLineDto */
export interface UpsertJobDimensionLineDto {
  line_no?: number;
  length_unit?: string;
  length?: number;
  width?: number;
  height?: number;
  no_of_pcs?: number;
  package_type?: string;
  g_weight?: number;
  g_weight_unit?: string;
  v_weight?: number;
  v_weight_unit?: string;
  n_weight?: number;
  n_weight_unit?: string;
  total_weight?: number;
  total_weight_unit?: string;
  volume?: number;
  volume_unit?: string;
  hs_code?: string;
  dimension_type?: string;
  quantity?: number;
  currency_code?: string;
  goods_value?: number;
  total_value?: number;
  [key: string]: unknown;
}

export type UpdateJobDimensionLineDto = UpsertJobDimensionLineDto;

/** PUT /jobs/:id/dimensions/bulk */
export interface BulkJobDimensionsDto {
  lines: UpsertJobDimensionLineDto[];
  replace_all?: boolean;
  sync_to_cargo?: boolean;
}

/** POST /jobs/:id/dimensions/upload/confirm */
export interface ConfirmDimensionUploadDto {
  lines: UpsertJobDimensionLineDto[];
  replace_all?: boolean;
}

/** POST /jobs/:id/dimensions/upload/paste */
export interface PasteDimensionUploadDto {
  content: string;
  confirm?: boolean;
  replace_all?: boolean;
}

/** POST /jobs/:id/dimensions/sync-to-cargo */
export interface SyncDimensionsToCargoDto {
  line_ids?: string[];
  prune_orphans?: boolean;
}

/** PATCH /jobs/:id/department */
export interface PatchJobDepartmentDto {
  branch_id?: string;
  company_id?: string;
  department_id?: string;
  salesperson_id?: string;
}

/** POST /jobs/:id/exchange-rates */
export interface UpsertJobExchangeRateDto {
  currency_code: string;
  exchange_rate: number;
  effective_date?: string;
  source?: string;
  apply_to_charges?: boolean;
}

/** POST/PATCH /jobs/:id/routing-legs */
export interface UpsertJobRoutingLegDto {
  leg_sequence?: number;
  transport_mode?: string;
  port_id?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  etd?: string;
  eta?: string;
  carrier_id?: string;
  vessel_name?: string;
  voyage_number?: string;
}

/** POST/PATCH /jobs/:id/customs-refs */
export interface UpsertJobCustomsRefDto {
  sb_number?: string;
  boe_number?: string;
  customs_house?: string;
  customs_status?: string;
  filed_at?: string;
  cleared_at?: string;
  remarks?: string;
}

export interface JobGpumLineDto {
  user_id: string;
  gp_percent: number;
}

export interface PutJobGpumDto {
  allocations: JobGpumLineDto[];
}

export interface JobGpumAllocation extends JobGpumLineDto {
  user_name?: string;
  id?: string;
}

export interface CalculateStorageChargesDto {
  storage_upto_date: string;
}

export interface ConfirmStorageChargesDto {
  storage_upto_date: string;
  line_keys?: number[];
}

export interface CreateJobChargeAttachmentDto {
  file_name: string;
  file_url: string;
  s3_key?: string;
  file_size?: number;
  mime_type?: string;
}

export interface JobChargeAttachment {
  id?: string;
  file_name: string;
  file_url: string;
  s3_key?: string;
  file_size?: number;
  mime_type?: string;
  created_at?: string;
}

export interface Job {
  id: string;
  job_number?: string;
  job_type: JobType;
  status: JobStatus;
  company_id?: string;
  branch_id?: string;
  department_id?: string;
  parent_job_id?: string;
  /** Linked continuum records when returned by the API. */
  quotation_id?: string;
  quotation_number?: string;
  shipment_id?: string;
  shipment_number?: string;
  enquiry_id?: string;
  enquiry_number?: string;
  currency_code?: string;
  shipper_id: string;
  shipper_name?: string;
  consignee_id?: string;
  consignee_name?: string;
  billing_party_id?: string;
  agent_id?: string;
  agent_name?: string;
  salesperson_id?: string;
  salesperson_name?: string;
  branch_name?: string;
  ops_user_id?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  origin_port_code?: string;
  dest_port_code?: string;
  commodity?: string;
  /** Dimension tab — commodity description (PATCH /jobs/:id/dimensions). */
  commodity_description?: string;
  hs_code?: string;
  gross_weight?: number;
  chargeable_weight?: number;
  volume_cbm?: number;
  pieces?: number;
  container_type_id?: string;
  container_count?: number;
  incoterms?: string;
  is_dg?: boolean;
  dg_class?: string;
  notes?: string;
  customer_remarks?: string;
  tags?: string[];
  /** Tenant job_date_source (ETD/ETA/System) applied on create / generate-job. */
  job_date?: string;
  /** Universal job barcode (CODE128 value used on labels / scans). */
  barcode?: string;
  barcode_value?: string;
  etd?: string;
  eta?: string;
  created_at?: string;
  updated_at?: string;
  /** From GET /jobs/:id/detail */
  actions?: JobActions;
  tabs?: JobDetailTab[];
  client_reference_no?: string;
  client_reference_type?: string;
  air_details?: JobAirDetail;
  sea_fcl_details?: JobSeaFclDetail;
  sea_lcl_details?: JobSeaLclDetail;
  courier_details?: JobCourierDetail;
  land_details?: JobLandDetail;
  road_freight_details?: JobRoadFreightDetail;
  service_scope?: JobServiceScope | string;
  origin_door_address?: string;
  dest_door_address?: string;
  cargo_category?: JobCargoCategory | string;
  charges?: JobCharge[];
  milestones?: JobMilestone[];
  notes_list?: JobNote[];
  house_jobs?: Job[];
  containers?: JobContainer[];
  cargo?: JobCargo[];
  documents?: JobDocument[];
  bills_of_lading?: JobBillOfLading[];
}

export interface JobChangeStatusResult {
  job: Job;
  warnings?: string[];
}

export interface JobListResult {
  jobs: Job[];
  meta: PaginationMeta;
}

export type CreateJobDto = CreateJobFormValues;
export type UpdateJobDto = UpdateJobFormValues;

export interface CreateJobChargeDto {
  charge_code_id: string;
  description: string;
  unit_price: number;
  currency_code: string;
  quantity?: number;
  exchange_rate?: number;
  tax_rate_id?: string;
  is_cost?: boolean;
  is_provisional?: boolean;
  is_billable?: boolean;
  party_id?: string;
}

export type UpdateJobChargeDto = Partial<CreateJobChargeDto>;

/** POST /jobs/:id/get-charges — pull quotation / party standard charges */
export interface GetJobChargesDto {
  from_quotation?: boolean;
  from_party_standard?: boolean;
}

/** POST /jobs/:id/get-job-charges — Fresa Get Job Charges from shipment */
export interface GetJobChargesFromShipmentDto {
  type: 'SHIPMENT';
  shipment_id: string;
  charge_ids?: string[];
  confirm?: boolean;
}

/** POST /jobs/:id/copy-charges */
export interface CopyJobChargesDto {
  from_job_id?: string;
  from_shipment_id?: string;
  from_quotation_id?: string;
  copy_sale?: boolean;
  copy_cost?: boolean;
}

/** POST /jobs/:id/profit-share/preview */
export interface ProfitSharePreviewDto {
  charge_code_id: string;
}

/** POST /jobs/:id/profit-share/add */
export interface ProfitShareAddDto {
  charge_code_id: string;
  profit_share_percent: number;
  profit_share_agent_id: string;
  profit_share_account_id?: string;
  description?: string;
}

/** POST /jobs/:id/prorate-to-shipments */
export interface ProrateToShipmentsDto {
  charge_code_id?: string;
  job_charge_id?: string;
}

/** POST /jobs/:id/charges/composite — OpenAPI CompositeJobChargeDto */
export interface ChargeSectionDto {
  line_no?: number;
  charge_code_id: string;
  unit?: string;
  remarks?: string;
  description: string;
  quantity?: number;
  pp_cc?: 'PP' | 'CC';
  ofd_type?: string;
}

export interface SaleSectionDto {
  bill_to?: string;
  amount?: number;
  qty?: number;
  dr_cr?: 'DR' | 'CR';
  tax_amount?: number;
  remarks?: string;
  currency?: string;
  fcy_amount?: number;
  tax_group_code?: string;
  tax_rate_id?: string;
  ex_rate?: number;
  taxable_amount?: number;
  gross_profit?: number;
  editable?: boolean;
}

export interface CostSectionDto {
  vendor?: string;
  declaration_no?: string;
  dr_cr?: 'DR' | 'CR';
  amount?: number;
  reference_no?: string;
  declaration_date?: string;
  currency?: string;
  fcy_amount?: number;
  date?: string;
  ex_rate?: number;
  tax_amount?: number;
  remarks?: string;
  editable?: boolean;
}

export interface CreateJobChargesCompositeDto {
  charge: ChargeSectionDto;
  sale?: SaleSectionDto;
  cost?: CostSectionDto;
  is_provisional?: boolean;
}

/** PATCH /jobs/:id/charges/:chargeId/sale | /cost */
export type PatchJobChargeSideDto = Partial<CreateJobChargeDto> &
  Partial<SaleSectionDto> &
  Partial<CostSectionDto>;

/** POST /jobs/:id/invoices/sale | /purchase */
export type CreateJobInvoiceFromCostingDto = {
  charge_ids?: string[];
  party_id?: string;
  invoice_date?: string;
  currency_code?: string;
  notes?: string;
} & Record<string, unknown>;

/** PUT /jobs/:id/references · PUT .../references/:type */
export type UpsertJobReferencesDto = {
  references?: Record<string, string>;
} & Record<string, unknown>;

/** PATCH /jobs/:id/closed-overrides */
export type PatchJobClosedOverridesDto = {
  allow_charge_edit?: boolean;
  allow_document_regen?: boolean;
  reason?: string;
} & Record<string, unknown>;

export interface CreateJobNoteDto {
  note: string;
  is_private?: boolean;
  is_pinned?: boolean;
}

export type UpdateJobNoteDto = Partial<CreateJobNoteDto>;

export interface CreateCustomMilestoneDto {
  milestone: string;
  planned_date?: string;
  actual_date?: string;
  notes?: string;
}

export interface UpdateJobMilestoneDto {
  actual_date?: string;
  planned_date?: string;
  notes?: string;
}

export type UpdateAirJobDetailDto = Partial<JobAirDetail>;
export type UpdateSeaFclJobDetailDto = Partial<JobSeaFclDetail>;
export type UpdateSeaLclJobDetailDto = Partial<JobSeaLclDetail>;
export type UpdateCourierJobDetailDto = Partial<JobCourierDetail>;
export type UpdateLandJobDetailDto = Partial<JobLandDetail>;
export type UpdateRoadFreightJobDetailDto = Partial<JobRoadFreightDetail>;

export interface AssignLandTruckerDto {
  trucker_id: string;
  vehicle_number?: string;
  vehicle_type?: 'TRUCK' | 'TRAILER' | 'VAN' | string;
  driver_name?: string;
  driver_license?: string;
}

export interface AssignRoadFreightTruckerDto extends AssignLandTruckerDto {
  trailer_number?: string;
}

export interface RecordLandPickupDto {
  picked_up_at?: string;
}

export type RecordRoadFreightPickupDto = RecordLandPickupDto;

export interface RecordLandBorderCrossingDto {
  border_declaration_number?: string;
  crossed_at?: string;
  milestone?: 'AT_BORDER' | 'CUSTOMS_CLEARED_BORDER' | string;
}

export type RecordRoadFreightBorderCrossingDto = RecordLandBorderCrossingDto;

export interface CreateLandPodDto {
  actual_delivery_date: string;
  delivered_by?: string;
  received_by?: string;
  signature_image_path?: string;
  remarks?: string;
}

export type CreateRoadFreightPodDto = CreateLandPodDto;

export interface CreateJobContainerDto {
  container_type_id: string;
  container_number?: string;
  seal_number?: string;
  tare_weight?: number;
  max_payload?: number;
  cubic_capacity?: number;
  gross_weight?: number;
  vgm_weight?: number;
  cbm?: number;
  status?: ContainerStatus;
  gate_in_at?: string;
  is_soc?: boolean;
}

export type UpdateJobContainerDto = Partial<CreateJobContainerDto>;

export interface CreateJobCargoDto {
  container_id?: string;
  consignee_id?: string;
  commodity?: string;
  hs_code?: string;
  description?: string;
  marks_numbers?: string;
  packages?: number;
  gross_weight?: number;
  measurement?: number;
}

export type UpdateJobCargoDto = Partial<CreateJobCargoDto>;

export interface CreateJobDocumentDto {
  document_type: JobDocumentType | string;
  file_name: string;
  file_url: string;
  reference_number?: string;
  s3_key?: string;
  file_size?: number;
  mime_type?: string;
}

export type UpdateJobDocumentDto = Partial<CreateJobDocumentDto>;

export interface FinalizeJobDocumentDto {
  is_finalized?: boolean;
}

export interface GenerateJobDocumentDto {
  layout_variant?: string;
  is_original?: boolean;
  bl_id?: string;
  number_of_originals?: number;
  rider_terms?: string;
  switched_from_bl_number?: string;
  switch_consignee_id?: string;
  switch_notify_id?: string;
  proxy_forwarder_name?: string;
  proxy_forwarder_address?: string;
  transhipment_port?: string;
}

export interface SendPreAlertDto {
  to_email: string;
  message?: string;
}

export interface SchedulePreAlertDto {
  to_email: string;
  scheduled_at: string;
  message?: string;
}

export interface SendWhatsAppStatusDto {
  to_phone: string;
  message: string;
}

/** POST /jobs/:id/vouchers/generate — GenerateJobVoucherDto */
export interface GenerateJobVoucherDto {
  voucher_type:
    | 'JOURNAL'
    | 'BANK_PAYMENT'
    | 'CASH_PAYMENT'
    | 'BANK_RECEIPT'
    | 'CASH_RECEIPT'
    | 'CONTRA'
    | 'PURCHASE_INVOICE'
    | 'PURCHASE_CREDIT_NOTE'
    | 'OPENING_BALANCE'
    | 'RECURRING'
    | string;
  charge_ids: string[];
  side?: 'SALE' | 'COST' | string;
  narration?: string;
  currency_code?: string;
  auto_post?: boolean;
}

export interface SubmitLclSiDto {
  si_submitted_at?: string;
  si_version?: number;
}

export interface LinkCourierJobDto {
  linked_job_id: string;
}

export interface ConfirmCourierBookingDto {
  tracking_number?: string;
  service_type?: string;
  label_format?: string;
}

export interface ScanCourierCheckpointDto {
  checkpoint?: string;
  location?: string;
  scanned_at?: string;
  barcode_scanned?: string;
  notes?: string;
}

/** POST /jobs/scan — ScanJobBarcodeDto */
export interface ScanJobBarcodeDto {
  barcode: string;
  location?: string;
  notes?: string;
}

export interface CreateCourierPodDto {
  actual_delivery_date?: string;
  delivered_by?: string;
  received_by?: string;
  signature_image_path?: string;
  remarks?: string;
}

export interface AttachLclHouseDto {
  house_job_id: string;
}

export interface LinkLclTranshipmentDto {
  export_job_id: string;
}

export interface LinkLclWmsStorageDto {
  wms_storage_charge_id: string;
}

export interface LclCfsStorageCalculationDto {
  as_of_date?: string;
}

export interface CreateTransportRequestDto {
  request_type?: string;
  pickup_address?: string;
  delivery_address?: string;
  cargo_details?: string;
  distance_km?: number;
  zip_distance_id?: string;
  scheduled_pickup_datetime?: string;
  scheduled_delivery_datetime?: string;
}

export interface SubmitSiDto {
  si_submitted_at?: string;
  si_version?: number;
}

export interface SubmitVgmDto {
  vgm_submitted_at?: string;
  vgm_method?: 'SM1' | 'SM2';
}

export interface AssignCargoToContainerDto {
  cargo_id: string;
}

export interface ContainerSplitPortionDto {
  consignee_id: string;
  packages?: number;
  gross_weight?: number;
  measurement?: number;
  commodity?: string;
  marks_numbers?: string;
}

export interface SplitContainerDto {
  portions: ContainerSplitPortionDto[];
}

export interface ReturnContainerDto {
  returned_at?: string;
  return_condition?: string;
}

export interface CreateBillOfLadingDto {
  bl_type: string;
  bl_number?: string;
  shipper_id?: string;
  consignee_id?: string;
  notify_id?: string;
  pol?: string;
  pod?: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  vessel_name?: string;
  voyage_number?: string;
  etd?: string;
  eta?: string;
  description_of_goods?: string;
  marks_numbers?: string;
  packages?: number;
  gross_weight?: number;
  measurement?: number;
  freight_payable_at?: string;
  freight_terms?: string;
  number_of_originals?: number;
  bl_conditions?: string;
  rider_terms?: string;
  switched_from_bl_number?: string;
  switch_consignee_id?: string;
  switch_notify_id?: string;
  proxy_forwarder_name?: string;
  proxy_forwarder_address?: string;
  paired_bl_id?: string;
  is_draft?: boolean;
  is_original?: boolean;
  is_surrendered?: boolean;
  is_express_release?: boolean;
}

export type UpdateBillOfLadingDto = Partial<CreateBillOfLadingDto>;

export interface CreateStuffingRecordDto {
  supervisor_name: string;
  stuffing_date: string;
  container_id?: string;
  location?: string;
  goods_condition?: string;
  notes?: string;
}

export type UpdateStuffingRecordDto = Partial<CreateStuffingRecordDto>;

export interface CreateJobDepositDto {
  deposit_type: string;
  deposit_amount: number;
  currency_code?: string;
  deposit_receipt_number?: string;
  deposit_expiry_date?: string;
  remarks?: string;
}

export type UpdateJobDepositDto = Partial<CreateJobDepositDto>;

export interface UpsertContainerFreeDaysDto {
  container_id: string;
  free_days_allowed?: number;
  last_free_day_date?: string;
  demurrage_start_date?: string;
  detention_start_date?: string;
  demurrage_rate_per_day?: number;
  detention_rate_per_day?: number;
}

export interface CreateDamageReportDto {
  damage_description: string;
  container_id?: string;
  photo_urls?: string[];
  survey_report_number?: string;
  reported_at?: string;
}

export interface CreatePartDeliveryDto {
  delivery_date: string;
  packages_delivered: number;
  container_id?: string;
  consignee_id?: string;
  remarks?: string;
}

export interface CreateProofOfDeliveryDto {
  actual_delivery_date: string;
  container_id?: string;
  delivered_by?: string;
  received_by?: string;
  signature_image_path?: string;
  remarks?: string;
}

export interface CreatePaymentRequestFromJobDto {
  party_id?: string;
  remarks?: string;
  amount?: number;
  currency_code?: string;
}

export interface CreateSubJobDto {
  job_type?: JobType | string;
  shipper_id?: string;
  consignee_id?: string;
  agent_id?: string;
  commodity?: string;
  notes?: string;
}

export interface CalculateCfsStorageDto {
  as_of_date?: string;
}

export interface UpdateCustomsStatusDto {
  customs_status: 'PENDING' | 'FILED' | 'QUERY' | 'CLEARED' | 'RELEASED' | string;
  customs_clearance_date?: string;
}

export interface LinkTranshipmentDto {
  export_job_id: string;
}

export type LinkAirTranshipmentDto = LinkTranshipmentDto;

export interface CreateCustomsExaminationDto {
  examination_date: string;
  result: 'HELD' | 'RELEASED' | 'SEIZED' | 'QUERY';
  examining_officer?: string;
  items_examined?: string;
  remarks?: string;
}

export interface StorageCalculationParams {
  as_of_date?: string;
}

export interface SendImportNoticeDto {
  to_email?: string;
  cc?: string;
  message?: string;
  schedule_at?: string;
}

export interface MasterOption {
  value: string;
  label: string;
}
