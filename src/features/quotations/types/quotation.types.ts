import type {
  JobType,
  Incoterm,
  LostReason,
  PdfMode,
  QuotationStatus,
} from '../constants/quotation.constants';
import type {
  ApprovalDecisionFormValues,
  CreateOnlineQuoteFormValues,
  CreateQuotationFormValues,
  CreateQuotationLineFormValues,
  GenerateQuotationPdfFormValues,
  MarkLostFormValues,
  SendQuotationEmailFormValues,
  UpdateQuotationFormValues,
  UpdateQuotationLineFormValues,
} from '../schemas/quotation.schema';

export type {
  ApprovalDecisionFormValues,
  CreateOnlineQuoteFormValues,
  CreateQuotationFormValues,
  CreateQuotationLineFormValues,
  GenerateQuotationPdfFormValues,
  MarkLostFormValues,
  SendQuotationEmailFormValues,
  UpdateQuotationFormValues,
  UpdateQuotationLineFormValues,
} from '../schemas/quotation.schema';

export interface QuotationLine {
  id: string;
  quotation_id?: string;
  charge_code_id: string;
  charge_code?: string;
  description: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  currency_code: string;
  exchange_rate?: number;
  tax_rate_id?: string;
  tax_percent?: number;
  tax_amount?: number;
  line_total?: number;
  is_cost?: boolean;
  supplier_id?: string;
  sort_order?: number;
}

export interface QuotationStatusHistoryEntry {
  id?: string;
  from_status?: string;
  to_status?: string;
  status?: string;
  comments?: string;
  created_at?: string;
  created_by?: string;
}

export interface QuotationApproval {
  id?: string;
  decision?: string;
  status?: string;
  comments?: string;
  created_at?: string;
  decided_at?: string;
  created_by?: string;
  approver_name?: string;
}

export interface Quotation {
  id: string;
  quotation_number?: string;
  quote_no?: string;
  status: QuotationStatus;
  company_id?: string;
  job_type: JobType;
  customer_id: string;
  customer_name?: string;
  salesperson_id?: string;
  salesperson_name?: string;
  branch_id?: string;
  department_id?: string;
  carrier_id?: string;
  carrier_name?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  origin_port_code?: string;
  dest_port_code?: string;
  origin_port_name?: string;
  dest_port_name?: string;
  incoterm?: Incoterm | string;
  commodity?: string;
  hs_code?: string;
  gross_weight?: number;
  chargeable_weight?: number;
  volume_cbm?: number;
  pieces?: number;
  container_count?: number;
  container_type_id?: string;
  is_dg?: boolean;
  dg_class?: string;
  special_requirements?: string;
  carrier_preference?: string;
  routing_notes?: string;
  remarks?: string;
  internal_notes?: string;
  transit_time_days?: number;
  valid_until?: string;
  quotation_date?: string;
  currency_code: string;
  exchange_rate?: number;
  discount_percent?: number;
  discount_amount?: number;
  subtotal?: number;
  tax_total?: number;
  total_amount?: number;
  cost_total?: number;
  revenue_total?: number;
  /** Live negotiation offer/counter snapshot from GET /quotations/:id */
  negotiation_pricing?: import('./quotationExtended.types').NegotiationPricing;
  gp_amount?: number;
  gp_percent?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  lost_reason?: LostReason | string;
  lost_notes?: string;
  parent_quotation_id?: string;
  revision_number?: number;
  job_id?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  created_by_name?: string;
  lines?: QuotationLine[];
  status_history?: QuotationStatusHistoryEntry[];
  approvals?: QuotationApproval[];
}

export type CreateQuotationDto = CreateQuotationFormValues;
export type UpdateQuotationDto = UpdateQuotationFormValues;
export type CreateQuotationLineDto = CreateQuotationLineFormValues;
export type UpdateQuotationLineDto = UpdateQuotationLineFormValues;
export type ApprovalDecisionDto = ApprovalDecisionFormValues;
export type MarkLostDto = MarkLostFormValues;
export type GenerateQuotationPdfDto = GenerateQuotationPdfFormValues;
export type SendQuotationEmailDto = SendQuotationEmailFormValues;
export type CreateOnlineQuoteDto = CreateOnlineQuoteFormValues;

export interface QuotationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  job_type?: JobType;
  customer_id?: string;
  salesperson_id?: string;
  branch_id?: string;
  company_id?: string;
  department_id?: string;
  carrier_id?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  container_type_id?: string;
  incoterm?: string;
  created_by?: string;
  from_date?: string;
  to_date?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuotationListResult {
  quotations: Quotation[];
  meta: PaginationMeta;
}

export interface QuotationReportParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  job_type?: JobType;
  customer_id?: string;
  salesperson_id?: string;
  branch_id?: string;
  company_id?: string;
  department_id?: string;
  carrier_id?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  container_type_id?: string;
  incoterm?: string;
  created_by?: string;
  from_date?: string;
  to_date?: string;
  order?: 'asc' | 'desc';
}

export interface QuotationAnalyticsParams {
  from_date?: string;
  to_date?: string;
  branch_id?: string;
  salesperson_id?: string;
  customer_id?: string;
  job_type?: JobType;
}

export interface QuotationPdfInfo {
  customer_pdf_url?: string;
  internal_pdf_url?: string;
  tasks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface ExpireDueResult {
  expired_count?: number;
  message?: string;
  [key: string]: unknown;
}
