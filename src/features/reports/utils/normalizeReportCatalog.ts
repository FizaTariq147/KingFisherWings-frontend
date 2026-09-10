import type {
  ReportExportFormat,
  ReportFamily,
  ReportJob,
  ReportJobStatus,
  ReportTemplate,
  ReportTemplateMeta,
  ReportTemplateParamField,
} from '../types/reportCatalog.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

const FAMILIES = new Set([
  'ops_list',
  'sea_docs',
  'air_docs',
  'commercial',
  'finance',
  'wms',
  'quotation',
  'other',
]);

function normalizeFamily(value: unknown): ReportFamily {
  const raw = String(value ?? 'other').trim().toLowerCase();
  return (FAMILIES.has(raw) ? raw : 'other') as ReportFamily;
}

function normalizeFormats(raw: unknown): ReportExportFormat[] {
  const list = Array.isArray(raw) ? raw : [];
  const out: ReportExportFormat[] = [];
  for (const item of list) {
    const u = String(item).toUpperCase();
    if (u === 'PDF' || u === 'XLSX' || u === 'CSV') out.push(u);
  }
  return out.length ? out : ['PDF'];
}

function normalizeContexts(raw: unknown): ReportTemplate['contexts'] {
  const list = Array.isArray(raw) ? raw : [];
  const allowed = new Set(['job', 'quotation', 'invoice', 'gl', 'wms', 'list', 'party']);
  const out: ReportTemplate['contexts'] = [];
  for (const item of list) {
    const s = String(item).toLowerCase();
    if (allowed.has(s)) out.push(s as ReportTemplate['contexts'][number]);
  }
  return out.length ? out : ['list'];
}

function normalizeParam(raw: unknown): ReportTemplateParamField | null {
  const r = asRecord(raw);
  if (!r) return null;
  const name = str(r.name) || str(r.key);
  if (!name) return null;
  const typeRaw = String(r.type ?? 'string').toLowerCase();
  const type = (
    ['string', 'number', 'date', 'boolean', 'uuid', 'select'].includes(typeRaw)
      ? typeRaw
      : 'string'
  ) as ReportTemplateParamField['type'];
  const optionsRaw = Array.isArray(r.options) ? r.options : [];
  const options = optionsRaw
    .map((o) => {
      const rec = asRecord(o);
      if (!rec) return null;
      const value = str(rec.value) ?? str(rec.id);
      if (!value) return null;
      return { value, label: str(rec.label) ?? value };
    })
    .filter((o): o is { value: string; label: string } => Boolean(o));
  return {
    name,
    label: str(r.label) ?? name,
    type,
    required: bool(r.required) ?? false,
    ...(options.length ? { options } : {}),
    ...(r.default !== undefined ? { default: r.default as string | number | boolean | null } : {}),
  };
}

export function metaToTemplate(meta: ReportTemplateMeta, index: number): ReportTemplate {
  return {
    id: meta.code || `local-${index}`,
    code: meta.code,
    name: meta.name,
    family: meta.family,
    contexts: meta.contexts,
    formats: meta.formats,
    description: meta.description,
    is_active: true,
    rolloutPhase: meta.rolloutPhase,
    gapStatus: meta.gapStatus,
    existingPath: meta.existingPath,
    parameters: meta.defaultParams,
  };
}

export function normalizeReportTemplate(raw: unknown, fallback?: ReportTemplateMeta): ReportTemplate | null {
  const r = asRecord(raw);
  if (!r && !fallback) return null;
  if (!r && fallback) return metaToTemplate(fallback, 0);

  const code = str(r?.code) || str(r?.template_code) || fallback?.code;
  const name = str(r?.name) || str(r?.title) || fallback?.name;
  if (!code || !name) return null;

  const paramsSource =
    r?.parameters ?? r?.parameter_schema ?? r?.fields ?? fallback?.defaultParams;
  const parameters = Array.isArray(paramsSource)
    ? paramsSource.map(normalizeParam).filter((p): p is ReportTemplateParamField => Boolean(p))
    : fallback?.defaultParams;

  return {
    id: str(r?.id) || code,
    code,
    name,
    family: normalizeFamily(r?.family ?? r?.category ?? fallback?.family),
    contexts: normalizeContexts(r?.contexts ?? r?.context ?? fallback?.contexts),
    formats: normalizeFormats(r?.formats ?? r?.export_formats ?? fallback?.formats),
    description: str(r?.description) || fallback?.description,
    is_active: bool(r?.is_active ?? r?.isActive) ?? true,
    rolloutPhase: fallback?.rolloutPhase,
    gapStatus: fallback?.gapStatus,
    existingPath: fallback?.existingPath,
    parameters,
  };
}

export function normalizeReportTemplateList(raw: unknown): {
  items: unknown[];
  meta?: unknown;
} {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  if (Array.isArray(envelope.data)) return { items: envelope.data, meta: envelope.meta };
  const nested = asRecord(envelope.data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.templates) && nested.templates) ||
      (Array.isArray(nested.results) && nested.results) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  const list =
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.templates) && envelope.templates) ||
    [];
  return { items: list, meta: envelope.meta };
}

export function normalizeReportJob(raw: unknown): ReportJob | null {
  const r = asRecord(raw);
  if (!r) return null;
  const nested = asRecord(r.data) ?? r;
  const id = str(nested.id) || str(nested.job_id) || str(nested.report_job_id);
  if (!id) return null;
  const statusRaw = String(nested.status ?? 'queued').toLowerCase();
  const status: ReportJobStatus = (
    ['queued', 'running', 'ready', 'failed'].includes(statusRaw) ? statusRaw : 'queued'
  ) as ReportJobStatus;
  const formatRaw = String(nested.format ?? '').toUpperCase();
  const format =
    formatRaw === 'PDF' || formatRaw === 'XLSX' || formatRaw === 'CSV'
      ? (formatRaw as ReportExportFormat)
      : undefined;
  return {
    id,
    status,
    error: str(nested.error) || str(nested.message),
    download_url: str(nested.download_url) || str(nested.downloadUrl) || str(nested.pdf_url),
    expires_at: str(nested.expires_at) || str(nested.expiresAt),
    format,
    template_code: str(nested.template_code) || str(nested.code),
  };
}
