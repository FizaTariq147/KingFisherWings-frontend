import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { QUOTATION_API } from '../api/quotation.api';
import {
  normalizeQuotation,
  normalizeQuotationLine,
  normalizeQuotationLines,
  normalizeQuotations,
} from '../utils/normalizeQuotation';
import {
  prepareQuotationLinePayload,
  prepareQuotationPayload,
} from '../utils/prepareQuotationPayload';
import type {
  ApprovalDecisionDto,
  CreateOnlineQuoteDto,
  CreateQuotationDto,
  CreateQuotationLineDto,
  ExpireDueResult,
  GenerateQuotationPdfDto,
  MarkLostDto,
  PaginationMeta,
  Quotation,
  QuotationAnalyticsParams,
  QuotationLine,
  QuotationListParams,
  QuotationListResult,
  QuotationPdfInfo,
  QuotationReportParams,
  SendQuotationEmailDto,
  UpdateQuotationDto,
  UpdateQuotationLineDto,
} from '../types/quotation.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: { page?: number; limit?: number },
): PaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) return { items: data, meta: envelope.meta };
  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.quotations) && nested.quotations) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  return { items: [] };
}

function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Request failed');
}

function assertId(id: string, label = 'quotation'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(
  params: QuotationListParams | QuotationReportParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    order: params.order ?? 'desc',
  };
  const copyKeys = [
    'search',
    'status',
    'job_type',
    'incoterm',
    'created_by',
    'from_date',
    'to_date',
  ] as const;
  for (const key of copyKeys) {
    const val = params[key];
    if (typeof val === 'string' && val.trim()) query[key] = val.trim();
  }
  const uuidKeys = [
    'customer_id',
    'salesperson_id',
    'branch_id',
    'company_id',
    'department_id',
    'carrier_id',
    'origin_port_id',
    'dest_port_id',
    'container_type_id',
  ] as const;
  for (const key of uuidKeys) {
    const val = params[key];
    if (typeof val === 'string' && isUuid(val)) query[key] = val;
  }
  return query;
}

function buildAnalyticsQuery(
  params: QuotationAnalyticsParams,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.from_date?.trim()) query.from_date = params.from_date.trim();
  if (params.to_date?.trim()) query.to_date = params.to_date.trim();
  if (params.job_type) query.job_type = params.job_type;
  for (const key of ['branch_id', 'salesperson_id', 'customer_id'] as const) {
    const val = params[key];
    if (val && isUuid(val)) query[key] = val;
  }
  return query;
}

async function postAction(url: string, body?: unknown): Promise<Quotation> {
  const res = await withGatewayRetry(() =>
    axiosInstance.post<unknown>(url, body ?? {}),
  );
  const quotation = normalizeQuotation(unwrapEntity(res.data));
  if (!quotation) throw new Error('Action succeeded but no quotation was returned.');
  return quotation;
}

export const quotationService = {
  async list(params: QuotationListParams = {}): Promise<QuotationListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.list, { params: buildListQuery(params) }),
      );
      const { items, meta } = unwrapList(res.data);
      const quotations = normalizeQuotations(items);
      return { quotations, meta: normalizeMeta(meta, quotations.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Quotation> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<Quotation> | Quotation>(QUOTATION_API.byId(id)),
      );
      const quotation = normalizeQuotation(unwrapEntity(res.data));
      if (!quotation) throw new Error('Quotation not found.');
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateQuotationDto): Promise<Quotation> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          QUOTATION_API.create,
          prepareQuotationPayload(dto as Record<string, unknown>),
        ),
      );
      const quotation = normalizeQuotation(unwrapEntity(res.data));
      if (!quotation) throw new Error('Create succeeded but no quotation was returned.');
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateQuotationDto): Promise<Quotation> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          QUOTATION_API.byId(id),
          prepareQuotationPayload(dto as Record<string, unknown>),
        ),
      );
      const quotation = normalizeQuotation(unwrapEntity(res.data));
      if (!quotation) throw new Error('Update succeeded but no quotation was returned.');
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(QUOTATION_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listRevisions(id: string): Promise<Quotation[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.revisions(id)),
      );
      const { items } = unwrapList(res.data);
      const fromItems = normalizeQuotations(items);
      if (fromItems.length) return fromItems;
      const entity = unwrapEntity(res.data);
      if (Array.isArray(entity)) return normalizeQuotations(entity);
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addLine(id: string, dto: CreateQuotationLineDto): Promise<QuotationLine> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          QUOTATION_API.lines(id),
          prepareQuotationLinePayload(dto as Record<string, unknown>),
        ),
      );
      const line = normalizeQuotationLine(unwrapEntity(res.data));
      if (!line) {
        // Some APIs return the full quotation after adding a line.
        const quotation = normalizeQuotation(unwrapEntity(res.data));
        const last = quotation?.lines?.[quotation.lines.length - 1];
        if (last) return last;
        throw new Error('Add line succeeded but no line was returned.');
      }
      return line;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateLine(
    id: string,
    lineId: string,
    dto: UpdateQuotationLineDto,
  ): Promise<QuotationLine> {
    assertId(id);
    assertId(lineId, 'line');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          QUOTATION_API.lineById(id, lineId),
          prepareQuotationLinePayload(dto as Record<string, unknown>),
        ),
      );
      const line = normalizeQuotationLine(unwrapEntity(res.data));
      if (!line) throw new Error('Update line succeeded but no line was returned.');
      return line;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async removeLine(id: string, lineId: string): Promise<void> {
    assertId(id);
    assertId(lineId, 'line');
    try {
      await withGatewayRetry(() => axiosInstance.delete(QUOTATION_API.lineById(id, lineId)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async applyTariff(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.applyTariff(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async submit(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.submit(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async approve(id: string, dto: ApprovalDecisionDto = {}): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.approve(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reject(id: string, dto: ApprovalDecisionDto = {}): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.reject(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async send(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.send(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async markWon(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.markWon(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async markLost(id: string, dto: MarkLostDto): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.markLost(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async duplicate(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.duplicate(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async convertToJob(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.convertToJob(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async archive(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.archive(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async expire(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.expire(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async expireDue(): Promise<ExpireDueResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.expireDue),
      );
      const data = unwrapEntity(res.data);
      return (asRecord(data) ?? { message: 'Expire-due completed.' }) as ExpireDueResult;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getPdf(id: string): Promise<QuotationPdfInfo> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.pdf(id)),
      );
      const data = unwrapEntity(res.data);
      return (asRecord(data) ?? {}) as QuotationPdfInfo;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generatePdf(id: string, dto: GenerateQuotationPdfDto): Promise<QuotationPdfInfo> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.pdf(id), dto),
      );
      const data = unwrapEntity(res.data);
      return (asRecord(data) ?? {}) as QuotationPdfInfo;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getPdfStatus(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.pdfStatus(id)),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async sendEmail(id: string, dto: SendQuotationEmailDto): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.sendEmail(id), dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createOnlineQuote(dto: CreateOnlineQuoteDto): Promise<Quotation> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.onlineQuote, dto),
      );
      const quotation = normalizeQuotation(unwrapEntity(res.data));
      if (!quotation) throw new Error('Online quote created but no quotation was returned.');
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportChargewise(params: QuotationReportParams = {}): Promise<{
    items: unknown[];
    meta: PaginationMeta;
  }> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.chargewise, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportAnalytics(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.analytics, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportConversion(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.conversion, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportLostReasons(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.lostReasons, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportResponseTime(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.responseTime, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** Helper used when a mutation returns lines nested on the quotation. */
  normalizeLinesFromQuotation(quotation: Quotation): QuotationLine[] {
    return normalizeQuotationLines(quotation.lines ?? []);
  },
};
