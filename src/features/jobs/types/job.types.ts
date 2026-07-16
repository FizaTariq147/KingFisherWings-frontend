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
  salesperson_id?: string;
  branch_id?: string;
  company_id?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  masters_only?: boolean;
  parent_job_id?: string;
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

/** Matches Swagger UpdateSeaFclJobDetailDto / nested sea_fcl_details. */
export interface JobSeaFclDetail {
  shipping_line_id?: string;
  vessel_id?: string;
  voyage_number?: string;
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

export interface Job {
  id: string;
  job_number?: string;
  job_type: JobType;
  status: JobStatus;
  company_id?: string;
  branch_id?: string;
  department_id?: string;
  parent_job_id?: string;
  shipper_id: string;
  shipper_name?: string;
  consignee_id?: string;
  consignee_name?: string;
  agent_id?: string;
  salesperson_id?: string;
  ops_user_id?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  origin_port_code?: string;
  dest_port_code?: string;
  commodity?: string;
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
  etd?: string;
  eta?: string;
  created_at?: string;
  updated_at?: string;
  air_details?: JobAirDetail;
  sea_fcl_details?: JobSeaFclDetail;
  charges?: JobCharge[];
  milestones?: JobMilestone[];
  notes_list?: JobNote[];
  house_jobs?: Job[];
  containers?: JobContainer[];
  cargo?: JobCargo[];
  documents?: JobDocument[];
  bills_of_lading?: JobBillOfLading[];
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

export interface MasterOption {
  value: string;
  label: string;
}
