export const CRM_PAGE_SIZE = 20;

export const LEAD_SOURCES = ['REFERRAL', 'COLD_CALL', 'EMAIL', 'EXHIBITION', 'WEBSITE', 'OTHER'] as const;
export const LEAD_STATUSES = ['NEW', 'IN_PROGRESS', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'ON_HOLD'] as const;
export const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;
export const CALL_TYPES = ['VISIT', 'PHONE', 'VIDEO', 'EMAIL'] as const;
export const CALL_PURPOSES = ['PROSPECTING', 'FOLLOW_UP', 'COMPLAINT', 'RENEWAL', 'INTRODUCTION'] as const;
export const CALL_OUTCOMES = ['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'QUOTATION_REQUESTED', 'COMPLAINT_RESOLVED'] as const;
export const FOLLOW_UP_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED'] as const;
export const ENQUIRY_STATUSES = ['NEW', 'QUOTED', 'BOOKED', 'LOST', 'CANCELLED'] as const;
export const SERVICE_TYPES = ['AIR_EXPORT', 'AIR_IMPORT', 'SEA_FCL_EXPORT', 'SEA_FCL_IMPORT', 'SEA_LCL_EXPORT', 'SEA_LCL_IMPORT', 'LAND', 'COURIER', 'CUSTOMS_CLEARANCE', 'NVOCC_EXPORT', 'NVOCC_IMPORT', 'SERVICE_JOB', 'WAREHOUSE'] as const;
export const PERIOD_TYPES = ['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const;
export const CRM_REPORT_TYPES = ['weekly_sales', 'monthly_sales', 'salesman_revenue', 'customer_revenue', 'top_customers', 'top_salesmen', 'trade_lane', 'service_type', 'win_loss', 'call_log_summary', 'lead_pipeline', 'budget_vs_actual', 'enquiry_conversion', 'follow_up_overdue'] as const;

export type LeadSource = typeof LEAD_SOURCES[number];
export type LeadStatus = typeof LEAD_STATUSES[number];
export type Priority = typeof PRIORITIES[number];
export type CallType = typeof CALL_TYPES[number];
export type CallPurpose = typeof CALL_PURPOSES[number];
export type CallOutcome = typeof CALL_OUTCOMES[number];
export type FollowUpStatus = typeof FOLLOW_UP_STATUSES[number];
export type EnquiryStatus = typeof ENQUIRY_STATUSES[number];
export type ServiceType = typeof SERVICE_TYPES[number];
export type PeriodType = typeof PERIOD_TYPES[number];
export type CrmReportType = typeof CRM_REPORT_TYPES[number];

export const crmLabel = (value: string) =>
  value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
