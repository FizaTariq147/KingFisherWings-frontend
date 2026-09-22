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

export interface CcDetails {
  job_id: string;
  direction?: string;
  customs_office?: string;
  port_id?: string;
  importer_id?: string;
  exporter_id?: string;
  broker_ref?: string;
  entry_type?: string;
  notes?: string;
  raw?: Record<string, unknown>;
}

export type UpdateCcDetailsDto = Partial<
  Omit<CcDetails, 'job_id' | 'raw'>
> &
  Record<string, unknown>;

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

export interface CcLine {
  id: string;
  job_id?: string;
  description?: string;
  hs_code?: string;
  quantity?: number;
  unit?: string;
  unit_value?: number;
  currency_code?: string;
  country_of_origin?: string;
  classified?: boolean;
  notes?: string;
  raw?: Record<string, unknown>;
}

export type CreateCcLineDto = {
  description?: string;
  hs_code?: string;
  quantity?: number;
  unit?: string;
  unit_value?: number;
  currency_code?: string;
  country_of_origin?: string;
  notes?: string;
} & Record<string, unknown>;

export type UpdateCcLineDto = Partial<CreateCcLineDto>;

export type ClassifyCcLineDto = {
  hs_code?: string;
  notes?: string;
} & Record<string, unknown>;

export interface CcChecklistItem {
  id: string;
  job_id?: string;
  code?: string;
  label?: string;
  required?: boolean;
  status?: string;
  completed?: boolean;
  document_id?: string;
  notes?: string;
  raw?: Record<string, unknown>;
}

export type UpdateCcChecklistItemDto = {
  status?: string;
  completed?: boolean;
  document_id?: string;
  notes?: string;
} & Record<string, unknown>;

export interface CcFiling {
  job_id?: string;
  filing_type?: string;
  entry_number?: string;
  filed_at?: string;
  customs_office?: string;
  notes?: string;
  raw?: Record<string, unknown>;
}

export type UpdateCcFilingDto = Partial<Omit<CcFiling, 'job_id' | 'raw'>> &
  Record<string, unknown>;

export interface CcQuery {
  id: string;
  job_id?: string;
  subject?: string;
  body?: string;
  status?: string;
  raised_at?: string;
  closed_at?: string;
  response?: string;
  raw?: Record<string, unknown>;
}

export type CreateCcQueryDto = {
  subject?: string;
  body?: string;
} & Record<string, unknown>;

export type UpdateCcQueryDto = Partial<CreateCcQueryDto> & {
  status?: string;
  response?: string;
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

export type DutyPaymentRequestDto = {
  amount?: number;
  currency_code?: string;
  notes?: string;
} & Record<string, unknown>;

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
  payload?: Record<string, unknown>;
  validated?: boolean;
  submitted_locally?: boolean;
  validation_errors?: string[];
  raw?: Record<string, unknown>;
}

export type UpsertCcDeclarationDto = Record<string, unknown>;

export type CcStageActionDto = Record<string, unknown>;

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
