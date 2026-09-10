import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { REPORT_CATALOG_API } from '../api/reportCatalog.api';
import { FRESA_REPORT_REGISTRY, filterRegistry, getRegistryByCode } from '../data/fresaReportRegistry';
import type {
  ReportGenerateRequest,
  ReportJob,
  ReportTemplate,
  ReportTemplateListResult,
} from '../types/reportCatalog.types';
import {
  metaToTemplate,
  normalizeReportJob,
  normalizeReportTemplate,
  normalizeReportTemplateList,
} from '../utils/normalizeReportCatalog';

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: { status?: number; data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  const status = axiosErr.response?.status;
  if (status) return new Error(`Request failed (${status})`);
  return new Error(axiosErr.message || 'Request failed');
}

function isUnavailable(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404 || status === 501 || status === 502 || status === 503;
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
  const limit = params.limit ?? 50;
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

export const reportCatalogService = {
  async listTemplates(params: {
    page?: number;
    limit?: number;
    search?: string;
    family?: string;
    context?: string;
    /** When set, only templates with rolloutPhase <= this value (family rollout). */
    rolloutPhase?: number;
  } = {}): Promise<ReportTemplateListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(REPORT_CATALOG_API.templates, {
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 50,
            ...(params.search?.trim() ? { search: params.search.trim() } : {}),
            ...(params.family && params.family !== 'all' ? { family: params.family } : {}),
            ...(params.context && params.context !== 'all' ? { context: params.context } : {}),
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
        .filter((t) => t.is_active)
        .filter((t) =>
          params.rolloutPhase == null || (t.rolloutPhase ?? 99) <= params.rolloutPhase,
        );

      const page = params.page ?? 1;
      const limit = params.limit ?? 50;
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
      };
    } catch (error) {
      if (isUnavailable(error)) return localList(params);
      throw formatAxiosError(error);
    }
  },

  async getTemplate(idOrCode: string): Promise<ReportTemplate> {
    const local = getRegistryByCode(idOrCode) ?? FRESA_REPORT_REGISTRY.find((t) => t.code === idOrCode);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(REPORT_CATALOG_API.template(idOrCode)),
      );
      const template = normalizeReportTemplate(res.data, local);
      if (!template) throw new Error('Report template not found.');
      return template;
    } catch (error) {
      if (isUnavailable(error) && local) return metaToTemplate(local, 0);
      if (local) return metaToTemplate(local, 0);
      throw formatAxiosError(error);
    }
  },

  async generate(dto: ReportGenerateRequest): Promise<ReportJob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(REPORT_CATALOG_API.generate, dto),
      );
      const job = normalizeReportJob(res.data);
      if (!job) throw new Error('Generate accepted but no job id was returned.');
      return job;
    } catch (error) {
      if (isUnavailable(error)) {
        throw new Error(
          'Report generate API is not available yet (404/501). Backend must implement POST /reports/generate. Existing quotation/invoice PDFs are unchanged.',
        );
      }
      throw formatAxiosError(error);
    }
  },

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

  async download(jobId: string): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<Blob>(REPORT_CATALOG_API.download(jobId), {
          responseType: 'blob',
        }),
      );
      return res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
