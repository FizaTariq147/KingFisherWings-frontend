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

export interface JobAirDetail {
  airline_id?: string;
  origin_airport_id?: string;
  dest_airport_id?: string;
  hawb_number?: string;
  mawb_number?: string;
  flight_number?: string;
  awb_type?: string;
  freight_type?: string;
  conversion_factor?: number;
}

export interface JobSeaFclDetail {
  shipping_line_id?: string;
  vessel_id?: string;
  voyage_number?: string;
  booking_reference?: string;
  hbl_number?: string;
  mbl_number?: string;
  port_of_loading_id?: string;
  port_of_discharge_id?: string;
  si_cutoff?: string;
  vgm_cutoff?: string;
  cy_cutoff?: string;
  si_submitted_at?: string;
  vgm_submitted_at?: string;
  bl_type?: string;
  freight_terms?: string;
  sailed_at?: string;
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
  party_id?: string;
  line_total?: number;
}

export interface JobMilestone {
  id: string;
  milestone: string;
  planned_date?: string;
  actual_date?: string;
  is_completed?: boolean;
}

export interface JobNote {
  id: string;
  note: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobContainer {
  id: string;
  container_type_id: string;
  container_number?: string;
  seal_number?: string;
  status?: ContainerStatus;
  gross_weight?: number;
  volume_cbm?: number;
  is_soc?: boolean;
  gate_in_at?: string;
}

export interface JobCargo {
  id: string;
  description?: string;
  packages?: number;
  gross_weight?: number;
  net_weight?: number;
  volume_cbm?: number;
  container_id?: string;
  hs_code?: string;
}

export interface JobDocument {
  id: string;
  document_type: JobDocumentType | string;
  file_name: string;
  file_url?: string;
  status?: string;
  is_finalized?: boolean;
}

export interface JobBillOfLading {
  id: string;
  bl_type: string;
  bl_number?: string;
  is_original?: boolean;
  is_surrendered?: boolean;
}

export interface JobStuffingRecord {
  id: string;
  supervisor_name: string;
  stuffing_date: string;
  notes?: string;
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
  /** Display codes when list/detail payload includes nested or denormalized ports. */
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
  is_billable?: boolean;
  party_id?: string;
}

export type UpdateJobChargeDto = Partial<CreateJobChargeDto>;

export interface CreateJobNoteDto {
  note: string;
}

export type UpdateJobNoteDto = Partial<CreateJobNoteDto>;

export interface CreateCustomMilestoneDto {
  milestone: string;
  planned_date?: string;
}

export interface UpdateJobMilestoneDto {
  actual_date?: string;
  planned_date?: string;
}

export interface UpdateAirJobDetailDto extends Partial<JobAirDetail> {}

export interface UpdateSeaFclJobDetailDto extends Partial<JobSeaFclDetail> {}

export interface CreateJobContainerDto {
  container_type_id: string;
  container_number?: string;
  seal_number?: string;
  status?: ContainerStatus;
  gross_weight?: number;
  volume_cbm?: number;
  is_soc?: boolean;
  gate_in_at?: string;
}

export type UpdateJobContainerDto = Partial<CreateJobContainerDto>;

export interface CreateJobCargoDto {
  description?: string;
  packages?: number;
  gross_weight?: number;
  net_weight?: number;
  volume_cbm?: number;
  container_id?: string;
  hs_code?: string;
}

export type UpdateJobCargoDto = Partial<CreateJobCargoDto>;

export interface CreateJobDocumentDto {
  document_type: JobDocumentType | string;
  file_name: string;
  file_url: string;
}

export type UpdateJobDocumentDto = Partial<CreateJobDocumentDto>;

export interface GenerateJobDocumentDto {
  layout_variant?: string;
  is_original?: boolean;
  bl_id?: string;
  number_of_originals?: number;
  rider_terms?: string;
  transhipment_port?: string;
}

export interface SendPreAlertDto {
  to_email: string;
  message?: string;
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

export interface CreateBillOfLadingDto {
  bl_type: string;
  bl_number?: string;
  [key: string]: unknown;
}

export type UpdateBillOfLadingDto = Partial<CreateBillOfLadingDto>;

export interface CreateStuffingRecordDto {
  supervisor_name: string;
  stuffing_date: string;
  notes?: string;
}

export type UpdateStuffingRecordDto = Partial<CreateStuffingRecordDto>;

export interface MasterOption {
  value: string;
  label: string;
}
