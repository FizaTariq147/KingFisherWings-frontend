import type {
  ReportExportFormat,
  ReportFamily,
  ReportJob,
  ReportJobStatus,
  ReportRendererOption,
  ReportRolloutPhase,
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

function unwrapPayload(raw: unknown): Record<string, unknown> | null {
  const root = asRecord(raw);
  if (!root) return null;
  const data = asRecord(root.data);
  if (data && (data.id != null || data.code != null || data.name != null || data.status != null)) {
    return data;
  }
  return root;
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
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
  const out: ReportExportFormat[] = [];
  for (const item of list) {
    const u = String(item).toUpperCase();
    if (u === 'PDF' || u === 'XLSX' || u === 'CSV') out.push(u);
  }
  return out.length ? out : ['PDF'];
}

function normalizeContexts(raw: unknown): ReportTemplate['contexts'] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
  const allowed = new Set(['job', 'quotation', 'invoice', 'gl', 'wms', 'list', 'party']);
  const out: ReportTemplate['contexts'] = [];
  for (const item of list) {
    const s = String(item).toLowerCase();
    if (allowed.has(s)) out.push(s as ReportTemplate['contexts'][number]);
  }
  return out.length ? out : ['list'];
}

function normalizeRolloutPhase(value: unknown, fallback?: ReportRolloutPhase): ReportRolloutPhase | undefined {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 1 && n <= 6) return n as ReportRolloutPhase;
  return fallback;
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

/** Convert JSON Schema-ish objects into flat param fields when backend sends schema maps. */
function parametersFromSchemaObject(raw: unknown): ReportTemplateParamField[] | undefined {
  const schema = asRecord(raw);
  if (!schema) return undefined;
  const props = asRecord(schema.properties);
  if (!props) return undefined;
  const required = new Set(
    Array.isArray(schema.required) ? schema.required.map((x) => String(x)) : [],
  );
  const out: ReportTemplateParamField[] = [];
  for (const [name, defRaw] of Object.entries(props)) {
    const def = asRecord(defRaw) ?? {};
    const typeRaw = String(def.type ?? 'string').toLowerCase();
    const type = (
      ['string', 'number', 'date', 'boolean', 'uuid', 'select'].includes(typeRaw)
        ? typeRaw
        : typeRaw === 'integer'
          ? 'number'
          : 'string'
    ) as ReportTemplateParamField['type'];
    const enumVals = Array.isArray(def.enum) ? def.enum : [];
    out.push({
      name,
      label: str(def.title) || str(def.label) || name,
      type: enumVals.length ? 'select' : type,
      required: required.has(name) || Boolean(def.required),
      ...(enumVals.length
        ? {
            options: enumVals.map((v) => ({ value: String(v), label: String(v) })),
          }
        : {}),
      ...(def.default !== undefined
        ? { default: def.default as string | number | boolean | null }
        : {}),
    });
  }
  return out.length ? out : undefined;
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
  const r = unwrapPayload(raw) ?? asRecord(raw);
  if (!r && !fallback) return null;
  if (!r && fallback) return metaToTemplate(fallback, 0);

  const code = str(r?.code) || str(r?.template_code) || fallback?.code;
  const name = str(r?.name) || str(r?.title) || fallback?.name;
  if (!code || !name) return null;

  const paramsSource =
    r?.parameters ?? r?.parameter_schema ?? r?.parameterSchema ?? r?.fields ?? fallback?.defaultParams;
  let parameters: ReportTemplateParamField[] | undefined;
  if (Array.isArray(paramsSource)) {
    parameters = paramsSource
      .map(normalizeParam)
      .filter((p): p is ReportTemplateParamField => Boolean(p));
  } else {
    parameters = parametersFromSchemaObject(paramsSource) ?? fallback?.defaultParams;
  }

  return {
    id: str(r?.id) || code,
    code,
    name,
    family: normalizeFamily(r?.family ?? r?.category ?? fallback?.family),
    contexts: normalizeContexts(r?.contexts ?? r?.context ?? fallback?.contexts),
    formats: normalizeFormats(r?.formats ?? r?.export_formats ?? fallback?.formats),
    description: str(r?.description) || fallback?.description,
    is_active: bool(r?.is_active ?? r?.isActive) ?? true,
    renderer_key:
      str(r?.renderer_key) ||
      str(r?.rendererKey) ||
      str(r?.jasper_key) ||
      str(r?.jasperKey) ||
      str(r?.template_key) ||
      str(r?.templateKey),
    rolloutPhase: normalizeRolloutPhase(r?.rollout_phase ?? r?.rolloutPhase, fallback?.rolloutPhase),
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
      (Array.isArray(nested.data) && nested.data) ||
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
  const nested = unwrapPayload(raw) ?? asRecord(raw);
  if (!nested) return null;
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
    error: str(nested.error) || (status === 'failed' ? str(nested.message) : undefined),
    download_url: str(nested.download_url) || str(nested.downloadUrl) || str(nested.pdf_url),
    expires_at: str(nested.expires_at) || str(nested.expiresAt),
    format,
    template_code: str(nested.template_code) || str(nested.code),
  };
}

/** Normalize POST /reports/templates/import response (shape may vary). */
export function normalizeReportTemplateImportResult(raw: unknown): {
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  message?: string;
} {
  const r = unwrapPayload(raw) ?? asRecord(raw) ?? {};
  const inserted = Number(r.inserted ?? r.created ?? r.added ?? 0) || 0;
  const updated = Number(r.updated ?? r.modified ?? 0) || 0;
  const skipped = Number(r.skipped ?? r.unchanged ?? 0) || 0;
  const total =
    Number(r.total ?? r.catalog_size ?? r.count ?? inserted + updated + skipped) ||
    inserted + updated + skipped;
  return {
    inserted,
    updated,
    skipped,
    total,
    message: str(r.message) || str(r.detail),
  };
}

/** Map a registry/API template into a lean import body row (no hardcoded report codes). */
export function toReportImportRow(template: {
  code: string;
  name: string;
  family: string;
  contexts: string[];
  formats: string[];
  description?: string;
  parameters?: unknown;
  defaultParams?: unknown;
  renderer_key?: string;
}): Record<string, unknown> {
  const parameters = template.parameters ?? template.defaultParams;
  const hasParams =
    (Array.isArray(parameters) && parameters.length > 0) ||
    (parameters != null &&
      typeof parameters === 'object' &&
      !Array.isArray(parameters) &&
      Object.keys(parameters as object).length > 0);

  const code = String(template.code || '').trim();
  const existingKey = String(template.renderer_key || '').trim();
  // Only forward a real (non-pending) key. Never invent one — backend requires a data pack.
  const readyKey =
    existingKey &&
    !/^pending($|[_.-])/i.test(existingKey) &&
    existingKey.toLowerCase() !== 'pending'
      ? existingKey
      : undefined;

  return {
    code,
    name: template.name,
    family: template.family,
    contexts: template.contexts,
    formats: template.formats,
    ...(readyKey ? { renderer_key: readyKey } : {}),
    ...(template.description ? { description: template.description } : {}),
    ...(hasParams ? { parameters } : {}),
  };
}

/** Friendly message when activate fails because Jasper/data pack is missing. */
export function formatReportActivateError(error: unknown, templateCode?: string): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Activate failed.';
  const code = templateCode?.trim();
  if (/renderer not implemented|data pack|renderer_key\s*=\s*pending/i.test(raw)) {
    return (
      `No Puppeteer data pack bound for ${code || 'this template'} yet. ` +
      `Pick a key from GET /reports/templates/renderers and use Bind renderer (or Activate with that key). ` +
      `There is no Jasper upload — only the implemented packs (~18 keys).`
    );
  }
  return raw;
}

/**
 * Normalize GET /reports/templates/renderers.
 * Accepts string[], { key }[], { renderer_key }[], or nested data/items.
 */
export function normalizeReportRendererOptions(raw: unknown): ReportRendererOption[] {
  const root = asRecord(raw);
  let list: unknown[] = [];
  if (Array.isArray(raw)) list = raw;
  else if (root) {
    const nested = asRecord(root.data);
    list =
      (Array.isArray(root.items) && root.items) ||
      (Array.isArray(root.renderers) && root.renderers) ||
      (Array.isArray(root.keys) && root.keys) ||
      (Array.isArray(root.data) && root.data) ||
      (nested && Array.isArray(nested.items) && nested.items) ||
      (nested && Array.isArray(nested.renderers) && nested.renderers) ||
      (nested && Array.isArray(nested.keys) && nested.keys) ||
      [];
  }

  const out: ReportRendererOption[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    if (typeof item === 'string') {
      const key = item.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ key, label: key });
      continue;
    }
    const rec = asRecord(item);
    if (!rec) continue;
    const key =
      str(rec.key) ||
      str(rec.renderer_key) ||
      str(rec.rendererKey) ||
      str(rec.id) ||
      str(rec.code);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      key,
      label: str(rec.label) || str(rec.name) || str(rec.title) || key,
      description: str(rec.description),
    });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}
