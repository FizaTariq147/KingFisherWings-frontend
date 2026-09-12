import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { REPORT_CATALOG_API, REPORT_TEMPLATES_MAX_LIMIT } from '../api/reportCatalog.api';
import { FRESA_REPORT_REGISTRY, filterRegistry, getRegistryByCode } from '../data/fresaReportRegistry';
import type {
  ReportBindRendererDto,
  ReportExportFormat,
  ReportGenerateRequest,
  ReportJob,
  ReportRendererOption,
  ReportTemplate,
  ReportTemplateImportResult,
  ReportTemplateListResult,
  ReportTemplateMeta,
} from '../types/reportCatalog.types';
import {
  metaToTemplate,
  normalizeReportJob,
  normalizeReportRendererOptions,
  normalizeReportTemplate,
  normalizeReportTemplateImportResult,
  normalizeReportTemplateList,
  toReportImportRow,
} from '../utils/normalizeReportCatalog';

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: {
      status?: number;
      statusText?: string;
      data?: { message?: string | string[]; error?: string };
    };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  const status = axiosErr.response?.status;
  if (status === 413) {
    return new Error('request entity too large');
  }
  if (status) {
    const statusText = axiosErr.response?.statusText?.trim();
    return new Error(statusText || `Request failed (${status})`);
  }
  return new Error(axiosErr.message || 'Request failed');
}

function axiosStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status;
}

/** Endpoint missing / gateway down — safe to browse local FRESA taxonomy. */
function isCatalogUnavailable(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404 || status === 501 || status === 502 || status === 503;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function localList(params: {
  page?: number;
  limit?: number;
  search?: string;
  family?: string;
  context?: string;
  rolloutPhase?: number;
}): ReportTemplateListResult {
  const filtered = filterRegistry({
    search: params.search,
    family: (params.family as 'all') || 'all',
    context: params.context || 'all',
    rolloutPhase: params.rolloutPhase,
  });
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, REPORT_TEMPLATES_MAX_LIMIT);
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit).map((meta, i) => metaToTemplate(meta, start + i));
  return {
    items: slice,
    meta: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / Math.max(limit, 1))),
    },
    fromLocalRegistry: true,
    backendUnavailable: true,
  };
}

/** Build POST /reports/generate body per ReportGenerateDto. */
export function buildReportGenerateBody(dto: ReportGenerateRequest): Record<string, unknown> {
  const format = String(dto.format || 'PDF').toUpperCase() as ReportExportFormat;
  const body: Record<string, unknown> = {
    format: format === 'XLSX' || format === 'CSV' ? format : 'PDF',
  };

  const code = dto.code?.trim();
  const templateId = dto.template_id?.trim();

  if (templateId && isUuid(templateId)) {
    body.template_id = templateId;
  }
  if (code) {
    body.code = code;
  } else if (templateId && !isUuid(templateId)) {
    body.code = templateId;
  }

  if (dto.parameters && Object.keys(dto.parameters).length > 0) {
    body.parameters = dto.parameters;
  }

  if (dto.context) {
    const context: Record<string, string> = {};
    for (const key of ['job_id', 'quotation_id', 'invoice_id', 'party_id'] as const) {
      const value = dto.context[key]?.trim();
      if (value) context[key] = value;
    }
    if (Object.keys(context).length > 0) body.context = context;
  }

  return body;
}

async function parseBlobError(blob: Blob, status?: number): Promise<Error> {
  try {
    const text = await blob.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed) as { message?: string | string[]; error?: string };
      if (Array.isArray(parsed.message)) return new Error(parsed.message.map(String).join('; '));
      if (typeof parsed.message === 'string' && parsed.message.trim()) {
        return new Error(parsed.message);
      }
      if (typeof parsed.error === 'string' && parsed.error.trim()) return new Error(parsed.error);
    }
  } catch {
    /* ignore */
  }
  return new Error(status ? `Download failed (${status})` : 'Download failed.');
}

export const reportCatalogService = {
  /**
   * GET /reports/templates
   * Falls back to local FRESA taxonomy only when the catalog API is unavailable.
   */
  async listTemplates(params: {
    page?: number;
    limit?: number;
    search?: string;
    family?: string;
    context?: string;
    includeInactive?: boolean;
    rolloutPhase?: number;
  } = {}): Promise<ReportTemplateListResult> {
    const page = params.page ?? 1;
    const limit = Math.min(Math.max(params.limit ?? 50, 1), REPORT_TEMPLATES_MAX_LIMIT);

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(REPORT_CATALOG_API.templates, {
          params: {
            page,
            limit,
            ...(params.search?.trim() ? { search: params.search.trim() } : {}),
            ...(params.family && params.family !== 'all' ? { family: params.family } : {}),
            ...(params.context && params.context !== 'all' ? { context: params.context } : {}),
            ...(params.includeInactive ? { include_inactive: true } : {}),
          },
        }),
      );
      const { items, meta } = normalizeReportTemplateList(res.data);
      const templates = items
        .map((item) => {
          const rec = item as { code?: string };
          const fallback = rec?.code ? getRegistryByCode(String(rec.code)) : undefined;
          return normalizeReportTemplate(item, fallback);
        })
        .filter((t): t is ReportTemplate => Boolean(t))
        .filter((t) => params.includeInactive || t.is_active)
        .filter(
          (t) => params.rolloutPhase == null || (t.rolloutPhase ?? 99) <= params.rolloutPhase,
        );

      const metaRec = (meta && typeof meta === 'object' ? meta : {}) as Record<string, unknown>;
      const total = Number(metaRec.total ?? templates.length) || templates.length;
      return {
        items: templates,
        meta: {
          page: Number(metaRec.page ?? page) || page,
          limit: Number(metaRec.limit ?? limit) || limit,
          total,
          totalPages:
            Number(metaRec.totalPages ?? metaRec.total_pages) ||
            Math.max(1, Math.ceil(total / Math.max(limit, 1))),
        },
        fromLocalRegistry: false,
        backendUnavailable: false,
      };
    } catch (error) {
      if (isCatalogUnavailable(error)) return localList({ ...params, limit });
      throw formatAxiosError(error);
    }
  },

  /**
   * Load templates across pages for FRESA-style sectioned browse.
   * Caps at maxPages * limit to avoid runaway requests.
   */
  async listTemplatesBrowse(params: {
    search?: string;
    family?: string;
    context?: string;
    includeInactive?: boolean;
    rolloutPhase?: number;
    limit?: number;
    maxPages?: number;
  } = {}): Promise<ReportTemplateListResult> {
    const limit = Math.min(Math.max(params.limit ?? REPORT_TEMPLATES_MAX_LIMIT, 1), REPORT_TEMPLATES_MAX_LIMIT);
    const maxPages = Math.min(Math.max(params.maxPages ?? 10, 1), 20);
    const first = await this.listTemplates({
      ...params,
      page: 1,
      limit,
    });
    if (first.fromLocalRegistry || first.backendUnavailable) {
      return first;
    }
    const totalPages = Math.min(first.meta.totalPages || 1, maxPages);
    if (totalPages <= 1) return first;

    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        this.listTemplates({
          ...params,
          page: i + 2,
          limit,
        }),
      ),
    );
    const items = [...first.items];
    for (const page of rest) {
      for (const t of page.items) {
        if (!items.some((x) => x.code === t.code || x.id === t.id)) items.push(t);
      }
    }
    return {
      items,
      meta: {
        page: 1,
        limit: items.length,
        total: first.meta.total,
        totalPages: first.meta.totalPages,
      },
      fromLocalRegistry: false,
      backendUnavailable: false,
    };
  },

  /** GET /reports/templates/:idOrCode */
  async getTemplate(idOrCode: string): Promise<ReportTemplate> {
    const key = idOrCode.trim();
    const local = getRegistryByCode(key) ?? FRESA_REPORT_REGISTRY.find((t) => t.code === key);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(REPORT_CATALOG_API.template(key)),
      );
      const template = normalizeReportTemplate(res.data, local);
      if (!template) throw new Error('Report template not found.');
      return template;
    } catch (error) {
      if (isCatalogUnavailable(error) && local) return metaToTemplate(local, 0);
      throw formatAxiosError(error);
    }
  },

  /**
   * POST /reports/templates/import — single chunk.
   * Body: { templates: [] }. Entries stay inactive unless pack-protected.
   */
  async importTemplatesChunk(
    templates: Array<ReportTemplateMeta | ReportTemplate | Record<string, unknown>>,
  ): Promise<ReportTemplateImportResult> {
    const rows = templates.map((t) => {
      if (t && typeof t === 'object' && 'code' in t && 'name' in t) {
        return toReportImportRow(t as ReportTemplateMeta);
      }
      return t as Record<string, unknown>;
    });
    const res = await withGatewayRetry(() =>
      axiosInstance.post<unknown>(REPORT_CATALOG_API.importRegistry, { templates: rows }),
    );
    return normalizeReportTemplateImportResult(res.data);
  },

  /**
   * Import many templates in batches (avoids Nest/Express "request entity too large").
   * Shrinks batch size automatically on 413 / entity-too-large.
   */
  async importTemplates(
    templates: Array<ReportTemplateMeta | ReportTemplate | Record<string, unknown>>,
    options?: { batchSize?: number; onProgress?: (done: number, total: number) => void },
  ): Promise<ReportTemplateImportResult> {
    const total = templates.length;
    if (!total) {
      return { inserted: 0, updated: 0, skipped: 0, total: 0, message: 'Nothing to import.' };
    }

    let batchSize = Math.max(1, Math.min(options?.batchSize ?? 25, total));
    let offset = 0;
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let batches = 0;

    while (offset < total) {
      const chunk = templates.slice(offset, offset + batchSize);
      try {
        const part = await this.importTemplatesChunk(chunk);
        inserted += part.inserted;
        updated += part.updated;
        skipped += part.skipped;
        batches += 1;
        offset += chunk.length;
        options?.onProgress?.(offset, total);
      } catch (error) {
        const status = axiosStatus(error);
        const msg = formatAxiosError(error).message;
        const tooLarge =
          status === 413 ||
          /entity too large|payload too large|request too large|413/i.test(msg);
        if (tooLarge && batchSize > 1) {
          batchSize = Math.max(1, Math.floor(batchSize / 2));
          continue;
        }
        if (tooLarge) {
          throw new Error(
            'Import failed: request entity too large even for a single template. Ask backend to raise the body size limit for POST /reports/templates/import.',
          );
        }
        throw formatAxiosError(error);
      }
    }

    return {
      inserted,
      updated,
      skipped,
      total,
      message: `Imported in ${batches} batch(es) of up to ${batchSize}: inserted ${inserted}, updated ${updated}, skipped ${skipped}.`,
    };
  },

  /** Import the full local FRESA taxonomy into the tenant catalog (inactive by default). */
  async importFresaRegistry(
    onProgress?: (done: number, total: number) => void,
  ): Promise<ReportTemplateImportResult> {
    return this.importTemplates(FRESA_REPORT_REGISTRY, { batchSize: 25, onProgress });
  },

  /** GET /reports/templates/renderers — implemented Puppeteer pack keys. */
  async listRenderers(): Promise<ReportRendererOption[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(REPORT_CATALOG_API.renderers),
      );
      return normalizeReportRendererOptions(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * POST /reports/templates/:code/bind-renderer
   * Bind to an implemented pack key (clears pending.*). Optional activate=true.
   */
  async bindRenderer(
    code: string,
    dto: ReportBindRendererDto,
  ): Promise<ReportTemplate> {
    const key = code.trim();
    const rendererKey = dto.renderer_key?.trim();
    if (!key) throw new Error('Template code is required.');
    if (!rendererKey) throw new Error('Select a renderer pack key.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(REPORT_CATALOG_API.bindRenderer(key), {
          renderer_key: rendererKey,
          ...(dto.activate ? { activate: true } : {}),
          ...(dto.formats?.length ? { formats: dto.formats } : {}),
        }),
      );
      const template = normalizeReportTemplate(res.data, getRegistryByCode(key));
      if (template) return template;
      return this.getTemplate(key);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * POST /reports/templates/:code/activate
   * If still pending.*, pass renderer_key to bind+activate in one call.
   */
  async activateTemplate(
    codeOrTemplate: string | ReportTemplate,
    options?: { renderer_key?: string },
  ): Promise<ReportTemplate> {
    const seed =
      typeof codeOrTemplate === 'string'
        ? await this.getTemplate(codeOrTemplate.trim())
        : codeOrTemplate;
    const code = seed.code?.trim();
    if (!code) throw new Error('Template code is required.');

    const rendererKey = options?.renderer_key?.trim();
    const body = rendererKey ? { renderer_key: rendererKey } : {};

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(REPORT_CATALOG_API.activate(code), body),
      );
      const template = normalizeReportTemplate(res.data, getRegistryByCode(code));
      if (template) return template;
      return this.getTemplate(code);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /reports/templates/:code/deactivate */
  async deactivateTemplate(code: string): Promise<ReportTemplate> {
    const key = code.trim();
    if (!key) throw new Error('Template code is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(REPORT_CATALOG_API.deactivate(key)),
      );
      const template = normalizeReportTemplate(res.data, getRegistryByCode(key));
      if (template) return template;
      return this.getTemplate(key);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /reports/generate → 201 ReportJob */
  async generate(dto: ReportGenerateRequest): Promise<ReportJob> {
    const body = buildReportGenerateBody(dto);
    if (!body.template_id && !body.code) {
      throw new Error('Select a report template before generating.');
    }
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(REPORT_CATALOG_API.generate, body),
      );
      const job = normalizeReportJob(res.data);
      if (!job) throw new Error('Generate accepted but no job id was returned.');
      return job;
    } catch (error) {
      if (isCatalogUnavailable(error)) {
        throw new Error(
          'Report generate API is unavailable (404/501). Check that POST /reports/generate is deployed.',
        );
      }
      throw formatAxiosError(error);
    }
  },

  /** GET /reports/jobs/:jobId */
  async getJob(jobId: string): Promise<ReportJob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(REPORT_CATALOG_API.job(jobId)),
      );
      const job = normalizeReportJob(res.data);
      if (!job) throw new Error('Report job not found.');
      return job;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /reports/jobs/:jobId/download */
  async download(jobId: string): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<Blob>(REPORT_CATALOG_API.download(jobId), {
          responseType: 'blob',
        }),
      );
      const blob = res.data;
      const contentType =
        typeof res.headers?.['content-type'] === 'string' ? res.headers['content-type'] : '';
      if (
        blob instanceof Blob &&
        blob.size > 0 &&
        blob.size < 8192 &&
        /json/i.test(contentType)
      ) {
        throw await parseBlobError(blob, res.status);
      }
      return blob;
    } catch (error) {
      const axiosErr = error as { response?: { status?: number; data?: Blob } };
      if (axiosErr.response?.data instanceof Blob) {
        throw await parseBlobError(axiosErr.response.data, axiosErr.response.status);
      }
      throw formatAxiosError(error);
    }
  },
};
