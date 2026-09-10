/** FRESA-aligned report catalog types (frontend registry + backend API). */

export type ReportFamily =
  | 'ops_list'
  | 'sea_docs'
  | 'air_docs'
  | 'commercial'
  | 'finance'
  | 'wms'
  | 'quotation'
  | 'other';

export type ReportContext =
  | 'job'
  | 'quotation'
  | 'invoice'
  | 'gl'
  | 'wms'
  | 'list'
  | 'party';

export type ReportExportFormat = 'PDF' | 'XLSX' | 'CSV';

export type ReportRolloutPhase = 1 | 2 | 3 | 4 | 5 | 6;

export type ReportGapStatus =
  | 'net_new'
  | 'partial_analytics'
  | 'partial_document_pdf'
  | 'covered_analytics'
  | 'covered_document_pdf';

export interface ReportTemplateParamField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'uuid' | 'select';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  default?: string | number | boolean | null;
}

export interface ReportTemplateMeta {
  /** Stable code aligned to FRESA naming, e.g. HBL_DRAFT_JASPER_01 */
  code: string;
  name: string;
  family: ReportFamily;
  contexts: ReportContext[];
  formats: ReportExportFormat[];
  description?: string;
  /** Frontend rollout wave (ops lists first). */
  rolloutPhase: ReportRolloutPhase;
  gapStatus: ReportGapStatus;
  /** Optional mapping to an existing KingFisher screen/API. */
  existingPath?: string;
  /** Default parameter hints when backend schema is unavailable. */
  defaultParams?: ReportTemplateParamField[];
}

export interface ReportTemplate {
  id: string;
  code: string;
  name: string;
  family: ReportFamily;
  contexts: ReportContext[];
  formats: ReportExportFormat[];
  description?: string;
  is_active: boolean;
  rolloutPhase?: ReportRolloutPhase;
  gapStatus?: ReportGapStatus;
  existingPath?: string;
  parameters?: ReportTemplateParamField[];
}

export interface ReportGenerateRequest {
  template_id?: string;
  code?: string;
  format: ReportExportFormat;
  parameters?: Record<string, unknown>;
  context?: {
    job_id?: string;
    quotation_id?: string;
    invoice_id?: string;
    party_id?: string;
  };
}

export type ReportJobStatus = 'queued' | 'running' | 'ready' | 'failed';

export interface ReportJob {
  id: string;
  status: ReportJobStatus;
  error?: string;
  download_url?: string;
  expires_at?: string;
  format?: ReportExportFormat;
  template_code?: string;
}

export interface ReportTemplateListResult {
  items: ReportTemplate[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  /** True when list came from local FRESA registry (API missing). */
  fromLocalRegistry?: boolean;
  backendUnavailable?: boolean;
}

export const REPORT_FAMILY_LABELS: Record<ReportFamily, string> = {
  ops_list: 'Operations lists',
  sea_docs: 'Sea documents',
  air_docs: 'Air documents',
  commercial: 'Commercial / invoices',
  finance: 'Finance & GL',
  wms: 'WMS',
  quotation: 'Quotations',
  other: 'Other',
};

export const REPORT_CONTEXT_LABELS: Record<ReportContext, string> = {
  job: 'Job / shipment',
  quotation: 'Quotation',
  invoice: 'Invoice',
  gl: 'General ledger',
  wms: 'Warehouse',
  list: 'List / filters',
  party: 'Party / customer',
};
