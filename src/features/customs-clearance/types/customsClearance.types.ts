export type CcStageId =
  | 'open'
  | 'docs'
  | 'classify'
  | 'file'
  | 'assess'
  | 'duty'
  | 'exam'
  | 'clear'
  | 'release'
  | 'invoice'
  | 'close';

export type CcDirection = 'IMPORT' | 'EXPORT' | 'TRANSIT';

export interface CcDashboardStats {
  total?: number;
  open?: number;
  docs_pending?: number;
  in_assessment?: number;
  duty_pending?: number;
  cleared?: number;
  closed?: number;
  by_stage?: Record<string, number>;
  raw?: Record<string, unknown>;
}

export interface CcQueueItem {
  id: string;
  job_id?: string;
  job_number?: string;
  stage?: string;
  status?: string;
  customer_name?: string;
  shipper_id?: string;
  updated_at?: string;
  raw?: Record<string, unknown>;
}

export interface CcQueueResult {
  items: CcQueueItem[];
  meta?: { page?: number; limit?: number; total?: number };
}

/** Matches UpsertCcDetailsDto + response shape. */
export interface CcDetails {
  job_id: string;
  direction?: CcDirection | string;
  cha_party_id?: string;
  border_or_port?: string;
  remarks?: string;
  raw?: Record<string, unknown>;
}

export type UpdateCcDetailsDto = {
  direction?: CcDirection | string;
  cha_party_id?: string;
  border_or_port?: string;
  remarks?: string;
} & Record<string, unknown>;

export interface CcStatus {
  job_id: string;
  stage?: string;
  status?: string;
  opened_at?: string;
  docs_complete_at?: string;
  classified_at?: string;
  filed_at?: string;
  assessed_at?: string;
  duty_paid_at?: string;
  cleared_at?: string;
  released_at?: string;
  invoice_ready_at?: string;
  closed_at?: string;
  raw?: Record<string, unknown>;
}

/** Cargo line — CreateCcCargoLineDto / UpdateCcCargoLineDto. */
export interface CcLine {
  id: string;
  job_id?: string;
  description?: string;
  hs_code?: string;
  quantity?: number;
  unit?: string;
  value_amount?: number;
  currency_code?: string;
  country_of_origin?: string;
  classified?: boolean;
  permit_notes?: string;
  raw?: Record<string, unknown>;
}

export type CreateCcLineDto = {
  description: string;
  hs_code?: string;
  country_of_origin?: string;
  quantity?: number;
  unit?: string;
  value_amount?: number;
  currency_code?: string;
} & Record<string, unknown>;

export type UpdateCcLineDto = Partial<CreateCcLineDto> & {
  description?: string;
};

export type ClassifyCcLineDto = {
  hs_code: string;
  permit_notes?: string;
} & Record<string, unknown>;

export interface CcChecklistItem {
  id: string;
  job_id?: string;
  code?: string;
  label?: string;
  required?: boolean;
  status?: string;
  received?: boolean;
  verified?: boolean;
  completed?: boolean;
  job_document_id?: string;
  raw?: Record<string, unknown>;
}

/** PatchCcChecklistItemDto */
export type UpdateCcChecklistItemDto = {
  received?: boolean;
  verified?: boolean;
  job_document_id?: string;
} & Record<string, unknown>;

/** PatchCcFilingDto / FileCcEntryDto fields. */
export interface CcFiling {
  job_id?: string;
  entry_type?: string;
  entry_number?: string;
  shipping_bill_number?: string;
  filing_date?: string;
  assessed_duty?: number;
  assessed_tax?: number;
  duty_currency?: string;
  raw?: Record<string, unknown>;
}

export type UpdateCcFilingDto = {
  entry_type?: string;
  entry_number?: string;
  shipping_bill_number?: string;
  filing_date?: string;
  assessed_duty?: number;
  assessed_tax?: number;
  duty_currency?: string;
} & Record<string, unknown>;

export type FileCcEntryDto = {
  admin_override?: boolean;
  stage_override_reason?: string;
  entry_type?: string;
  entry_number?: string;
  shipping_bill_number?: string;
  filing_date?: string;
} & Record<string, unknown>;

export type AssessCcDto = {
  admin_override?: boolean;
  stage_override_reason?: string;
  assessed_duty?: number;
  assessed_tax?: number;
  duty_currency?: string;
} & Record<string, unknown>;

export type DutyPaidDto = {
  admin_override?: boolean;
  stage_override_reason?: string;
  paid_by_client?: boolean;
  notes?: string;
} & Record<string, unknown>;

export interface CcQuery {
  id: string;
  job_id?: string;
  query_text?: string;
  response_text?: string;
  status?: string;
  raised_at?: string;
  closed_at?: string;
  raw?: Record<string, unknown>;
}

/** CreateCcQueryDto */
export type CreateCcQueryDto = {
  query_text: string;
} & Record<string, unknown>;

/** PatchCcQueryDto */
export type UpdateCcQueryDto = {
  response_text?: string;
} & Record<string, unknown>;

export interface CcFinancialSummary {
  job_id?: string;
  duty_amount?: number;
  tax_amount?: number;
  fees_amount?: number;
  total_amount?: number;
  currency_code?: string;
  duty_paid?: boolean;
  invoice_id?: string;
  raw?: Record<string, unknown>;
}

export interface CcLinkFreight {
  job_id?: string;
  freight_job_id?: string;
  freight_job_number?: string;
  linked_at?: string;
  raw?: Record<string, unknown>;
}

export type LinkFreightDto = {
  freight_job_id: string;
} & Record<string, unknown>;

export interface CcDeclaration {
  job_id?: string;
  declaration?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  validated?: boolean;
  submitted_locally?: boolean;
  validation_errors?: string[];
  raw?: Record<string, unknown>;
}

/** UpsertCcDeclarationDto — body must wrap payload as `declaration`. */
export type UpsertCcDeclarationDto = {
  declaration: Record<string, unknown>;
} & Record<string, unknown>;

/** CcWorkflowOverrideDto — shared by most stage POSTs. */
export type CcStageActionDto = {
  admin_override?: boolean;
  stage_override_reason?: string;
} & Record<string, unknown>;

export interface HsValidateResult {
  hs_code?: string;
  valid?: boolean;
  description?: string;
  is_prohibited?: boolean;
  is_restricted?: boolean;
  dg_class?: string;
  message?: string;
  raw?: Record<string, unknown>;
}

export type HsValidateDto = {
  hs_code: string;
} & Record<string, unknown>;

/** @deprecated use DutyPaidDto — kept for call-site aliases */
export type DutyPaymentRequestDto = Record<string, unknown>;
