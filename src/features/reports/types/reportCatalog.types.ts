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
  /** Backend Jasper/renderer key; activate requires non-pending value. */
  renderer_key?: string;
  rolloutPhase?: ReportRolloutPhase;
  gapStatus?: ReportGapStatus;
  existingPath?: string;
  parameters?: ReportTemplateParamField[];
}

export interface ReportTemplateImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  message?: string;
}

/** One implemented Puppeteer data-pack key from GET /reports/templates/renderers. */
export interface ReportRendererOption {
  key: string;
  label: string;
  description?: string;
}

export interface ReportBindRendererDto {
  renderer_key: string;
  activate?: boolean;
  formats?: ReportExportFormat[];
}

/** True when FE thinks activate is likely to succeed (non-pending renderer_key). */
export function canActivateReportTemplate(
  template: Pick<ReportTemplate, 'renderer_key' | 'is_active'>,
): boolean {
  const key = template.renderer_key?.trim();
  if (!key) return false;
  if (/^pending($|[_.-])/i.test(key) || key.toLowerCase() === 'pending') return false;
  return true;
}

export function reportRendererStatus(
  template: Pick<ReportTemplate, 'renderer_key'>,
): 'ready' | 'pending' | 'missing' {
  const key = template.renderer_key?.trim();
  if (!key) return 'missing';
  if (/^pending($|[_.-])/i.test(key) || key.toLowerCase() === 'pending') return 'pending';
  return 'ready';
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

/** Mirrors backend ReportGenerateDto (+ context nested DTO). */
export type ReportGenerateDto = ReportGenerateRequest;


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

/** Humanize API family/context codes when no static label exists. */
export function reportFamilyLabel(family: string): string {
  return REPORT_FAMILY_LABELS[family as ReportFamily] ?? family.replace(/_/g, ' ');
}

export function reportContextLabel(context: string): string {
  return REPORT_CONTEXT_LABELS[context as ReportContext] ?? context.replace(/_/g, ' ');
}
