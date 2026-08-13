import type {
  CallOutcome, CallPurpose, CallType, CrmReportType, EnquiryStatus, FollowUpStatus,
  LeadSource, LeadStatus, PeriodType, Priority, ServiceType,
} from '../constants/crm.constants';

export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number }
export interface ListResult<T> { items: T[]; meta: PaginationMeta }
export interface BaseEntity { id: string; created_at?: string; updated_at?: string; [key: string]: unknown }

export interface Lead extends BaseEntity {
  company_name: string; contact_name: string; email?: string; phone?: string;
  potential_volume?: string; service_requirements?: string; source?: LeadSource;
  status: LeadStatus; assigned_salesperson_id?: string; priority?: Priority;
  tags: string[]; notes?: string; lost_reason?: string;
}
export interface CreateLeadDto {
  company_name: string; contact_name: string; email?: string; phone?: string;
  potential_volume?: string; service_requirements?: string; source?: LeadSource;
  status?: LeadStatus; assigned_salesperson_id?: string; priority?: Priority;
  tags?: string[]; notes?: string; lost_reason?: string;
}
export type UpdateLeadDto = Partial<CreateLeadDto>;
export interface LeadListParams { page?: number; limit?: number; status?: LeadStatus; source?: LeadSource; assigned_salesperson_id?: string; search?: string }

export interface CallLog extends BaseEntity {
  date_time: string; contact_person: string; call_type: CallType; purpose: CallPurpose;
  discussion_summary: string; outcome: CallOutcome; lead_id?: string; party_id?: string;
  salesperson_id?: string; next_action?: string; next_followup_date?: string; duration_minutes?: number;
}
export interface CreateCallLogDto {
  date_time: string; contact_person: string; call_type: CallType; purpose: CallPurpose;
  discussion_summary: string; outcome: CallOutcome; lead_id?: string; party_id?: string;
  next_action?: string; next_followup_date?: string; gps_latitude?: number;
  gps_longitude?: number; duration_minutes?: number;
}
export interface CallLogListParams { page?: number; limit?: number; date?: string; salesperson_id?: string; lead_id?: string; party_id?: string }

export interface FollowUp extends BaseEntity {
  due_date: string; subject: string; status: FollowUpStatus; lead_id?: string;
  party_id?: string; enquiry_id?: string; notes?: string; owner_id?: string;
}
export interface CreateFollowUpDto { due_date: string; subject: string; lead_id?: string; party_id?: string; enquiry_id?: string; notes?: string; owner_id?: string }
export interface PatchFollowUpDto { status?: FollowUpStatus; due_date?: string; notes?: string }
export interface FollowUpListParams { page?: number; limit?: number; status?: FollowUpStatus; team?: boolean; owner_id?: string; from?: string; to?: string }

export interface Enquiry extends BaseEntity {
  service_type: ServiceType; currency_code: string; status: EnquiryStatus;
  lead_id?: string; party_id?: string; salesperson_id?: string; origin_port_id?: string;
  dest_port_id?: string; cargo_details?: string; incoterms?: string; special_requirements?: string;
}
export interface CreateEnquiryDto {
  service_type: ServiceType; currency_code: string; lead_id?: string; party_id?: string;
  salesperson_id?: string; origin_port_id?: string; dest_port_id?: string;
  cargo_details?: string; incoterms?: string; special_requirements?: string; status?: EnquiryStatus;
}
export type UpdateEnquiryDto = Partial<CreateEnquiryDto>;
export interface EnquiryListParams { page?: number; limit?: number; status?: EnquiryStatus; salesperson_id?: string }

export interface Budget extends BaseEntity {
  salesperson_id: string; period_type: PeriodType; period_start: string; target_amount: number;
  job_type?: ServiceType; target_volume?: number; actual_amount?: number;
}
export interface CreateBudgetDto { salesperson_id: string; period_type: PeriodType; period_start: string; target_amount: number; job_type?: ServiceType; target_volume?: number }
export interface DashboardOverview { metrics: Array<{ label: string; value: number | string }>; raw: Record<string, unknown> }
export interface DashboardParams { from?: string; to?: string; salesperson_id?: string }
export interface ReportParams extends DashboardParams { type: CrmReportType }

export interface Subscriber extends BaseEntity { email: string; full_name?: string; party_id?: string; country_code?: string; tags: string[]; unsubscribed_at?: string; is_subscribed?: boolean }
export interface CreateSubscriberDto { email: string; full_name?: string; party_id?: string; country_code?: string; tags?: string[] }
export interface CampaignTemplate extends BaseEntity { name: string; subject: string; body: string }
export interface CreateCampaignTemplateDto { name: string; subject: string; body: string }
export interface Campaign extends CampaignTemplate { scheduled_at?: string; status?: string; filter_party_type?: string; filter_country?: string }
export interface CreateCampaignDto extends CreateCampaignTemplateDto { scheduled_at?: string; filter_party_type?: string; filter_country?: string }
