import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { resolveSessionCompanyIdAsync } from '@/lib/resolveSessionCompanyId';
import { withGatewayRetry } from '@/lib/wakeApi';
import { ensureJobNumberFormatReady } from '@/features/organization/utils/ensureJobNumberFormat';
import { normalizeJob } from '@/features/jobs/utils/normalizeJob';
import { quotationToCreateJobDto } from '../utils/createJobFromQuotation';
import { QUOTATION_API } from '../api/quotation.api';
import { JOB_POST_AXIOS_CONFIG } from '@/features/jobs/utils/buildJobCreateCandidates';
import { ensureJobBranchReady, resolveOptionalBranchId } from '@/features/jobs/utils/ensureJobBranchReady';
import {
  normalizeQuotation,
  normalizeQuotationLine,
  normalizeQuotationLines,
  normalizeQuotations,
} from '../utils/normalizeQuotation';
import {
  prepareOnlineQuotePayload,
  prepareQuotationLinePayload,
  prepareQuotationPayload,
} from '../utils/prepareQuotationPayload';
import { normalizeQuotationPdfInfo } from '../utils/normalizeQuotationPdf';
import { quotationTotalAmount } from '../utils/quotationDisplay';
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

/** Dig out a quotation-like object from varied online-quote response envelopes. */
function extractQuotationCandidate(raw: unknown): unknown {
  const candidates: unknown[] = [raw, unwrapEntity(raw)];
  const root = asRecord(raw);
  if (root) {
    candidates.push(
      root.data,
      root.quotation,
      root.result,
      root.payload,
      root.item,
      asRecord(root.data)?.quotation,
      asRecord(root.data)?.result,
      asRecord(root.data)?.item,
    );
  }
  for (const c of candidates) {
    if (!c) continue;
    const rec = asRecord(c);
    if (!rec) continue;
    if (rec.id || rec.quotation_id || rec.quotation_number || rec.quote_no) return c;
  }
  return unwrapEntity(raw);
}

function extractQuotationId(raw: unknown): string | null {
  const visited = new Set<unknown>();
  const stack: unknown[] = [raw, unwrapEntity(raw)];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || visited.has(cur)) continue;
    visited.add(cur);
    const rec = asRecord(cur);
    if (!rec) continue;
    for (const key of ['id', 'quotation_id', 'quote_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.quotation, rec.result, rec.payload, rec.item]) {
      if (nest) stack.push(nest);
    }
  }
  return null;
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

function mergeQuotationForList(base: Quotation, detail: Quotation): Quotation {
  return {
    ...base,
    customer_name: base.customer_name || detail.customer_name,
    origin_port_id: base.origin_port_id || detail.origin_port_id,
    dest_port_id: base.dest_port_id || detail.dest_port_id,
    origin_port_code: base.origin_port_code || detail.origin_port_code,
    dest_port_code: base.dest_port_code || detail.dest_port_code,
    origin_port_name: base.origin_port_name || detail.origin_port_name,
    dest_port_name: base.dest_port_name || detail.dest_port_name,
    subtotal: base.subtotal ?? detail.subtotal,
    tax_total: base.tax_total ?? detail.tax_total,
    total_amount: base.total_amount ?? detail.total_amount,
    revenue_total: base.revenue_total ?? detail.revenue_total,
    cost_total: base.cost_total ?? detail.cost_total,
    discount_percent: base.discount_percent ?? detail.discount_percent,
    discount_amount: base.discount_amount ?? detail.discount_amount,
    lines: base.lines?.length ? base.lines : detail.lines,
    currency_code: base.currency_code || detail.currency_code,
  };
}

function needsListEnrichment(q: Quotation): boolean {
  const hasRouteIds = Boolean(q.origin_port_id || q.dest_port_id);
  const hasRouteLabels = Boolean(
    q.origin_port_code || q.dest_port_code || q.origin_port_name || q.dest_port_name,
  );
  return hasRouteIds && !hasRouteLabels;
}

async function enrichQuotationsForList(quotations: Quotation[]): Promise<Quotation[]> {
  const targets = quotations.filter(
    (q) => quotationTotalAmount(q) == null || needsListEnrichment(q),
  );
  if (!targets.length) return quotations;

  const detailById = new Map<string, Quotation>();
  await Promise.all(
    targets.slice(0, 25).map(async (q) => {
      try {
        const res = await withGatewayRetry(() =>
          axiosInstance.get<ApiEnvelope<Quotation> | Quotation>(QUOTATION_API.byId(q.id)),
        );
        const detail = normalizeQuotation(unwrapEntity(res.data));
        if (detail) detailById.set(q.id, detail);
      } catch {
        // Keep list row as-is when detail fetch fails.
      }
    }),
  );

  if (!detailById.size) return quotations;
  return quotations.map((q) => {
    const detail = detailById.get(q.id);
    return detail ? mergeQuotationForList(q, detail) : q;
  });
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
    body !== undefined
      ? axiosInstance.post<unknown>(url, body)
      : axiosInstance.post<unknown>(url),
  );
  const quotation = normalizeQuotation(unwrapEntity(res.data));
  if (!quotation) throw new Error('Action succeeded but no quotation was returned.');
  return quotation;
}

function extractJobIdFromConvertResponse(raw: unknown): string {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return '';
  const nestedJob = asRecord(data.job);
  const candidates = [
    data.job_id,
    data.jobId,
    nestedJob?.id,
    root?.job_id,
    root?.jobId,
  ];
  for (const value of candidates) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  const asJob = normalizeJob(data);
  if (asJob?.id) return asJob.id;
  return '';
}

function extractInvoiceIdFromConvertResponse(raw: unknown): string {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return '';
  const nestedInvoice = asRecord(data.invoice);
  const candidates = [
    data.invoice_id,
    data.invoiceId,
    nestedInvoice?.id,
    root?.invoice_id,
    root?.invoiceId,
  ];
  for (const value of candidates) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  return '';
}

export type ConvertToJobResult = Quotation & {
  job_id?: string;
  invoice_id?: string;
};

async function postConvertToJob(id: string, quotation: Quotation): Promise<ConvertToJobResult> {
  // POST /quotations/{id}/convert-to-job — v2 may return { job, invoice }.
  const res = await withGatewayRetry(() =>
    axiosInstance.post<unknown>(
      QUOTATION_API.convertToJob(id),
      undefined,
      JOB_POST_AXIOS_CONFIG,
    ),
  );
  const raw = unwrapEntity(res.data);
  const invoiceId = extractInvoiceIdFromConvertResponse(raw) || extractInvoiceIdFromConvertResponse(res.data);
  const updated = normalizeQuotation(raw);
  if (updated) {
    return {
      ...updated,
      ...(invoiceId ? { invoice_id: invoiceId } : {}),
      ...(extractJobIdFromConvertResponse(raw) ? { job_id: extractJobIdFromConvertResponse(raw) } : {}),
    };
  }

  const jobId = extractJobIdFromConvertResponse(raw) || extractJobIdFromConvertResponse(res.data);
  if (jobId) {
    return {
      ...quotation,
      job_id: jobId,
      status: 'CONVERTED',
      ...(invoiceId ? { invoice_id: invoiceId } : {}),
    };
  }

  try {
    const refreshRes = await withGatewayRetry(() =>
      axiosInstance.get<unknown>(QUOTATION_API.byId(id)),
    );
    const refreshed = normalizeQuotation(unwrapEntity(refreshRes.data));
    if (refreshed && (refreshed.job_id || refreshed.status === 'CONVERTED')) {
      return {
        ...refreshed,
        ...(invoiceId ? { invoice_id: invoiceId } : {}),
      };
    }
  } catch {
    /* fall through */
  }

  throw new Error('Convert succeeded but no job id was returned.');
}

async function createJobFallbackFromQuotation(quotation: Quotation): Promise<Quotation> {
  const { jobService } = await import('@/features/jobs/services/job.service');
  const job = await jobService.create(await quotationToCreateJobDto(quotation));
  return {
    ...quotation,
    job_id: job.id,
    status: 'CONVERTED',
  };
}

async function withSessionCompany<T extends { company_id?: string }>(dto: T): Promise<T> {
  if (dto.company_id && isUuid(dto.company_id)) return dto;
  const companyId = await resolveSessionCompanyIdAsync();
  if (!companyId) return dto;
  return { ...dto, company_id: companyId };
}

async function withSessionQuotationContext<
  T extends { company_id?: string; branch_id?: string },
>(dto: T): Promise<T> {
  let out = await withSessionCompany(dto);
  if (out.branch_id && isUuid(out.branch_id)) return out;
  const branchId = await resolveOptionalBranchId(out.company_id);
  if (!branchId) return out;
  return { ...out, branch_id: branchId };
}

export const quotationService = {
  async list(params: QuotationListParams = {}): Promise<QuotationListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.list, { params: buildListQuery(params) }),
      );
      const { items, meta } = unwrapList(res.data);
      const quotations = await enrichQuotationsForList(normalizeQuotations(items));
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
      const withCompany = await withSessionQuotationContext(dto);
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          QUOTATION_API.create,
          prepareQuotationPayload(withCompany as Record<string, unknown>),
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
      const withCompany = await withSessionQuotationContext(dto);
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          QUOTATION_API.byId(id),
          prepareQuotationPayload(withCompany as Record<string, unknown>),
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

  async convertToJob(id: string): Promise<ConvertToJobResult> {
    assertId(id);
    let quotation: Quotation | undefined;
    try {
      quotation = await this.getById(id);
      const { canConvertQuotationToJob } = await import('../utils/quotationStatus');
      if (!canConvertQuotationToJob(quotation.status)) {
        throw new Error(
          `Quotation must be customer-approved before convert (current status: ${quotation.status}).`,
        );
      }

      const companyId =
        quotation.company_id && isUuid(quotation.company_id)
          ? quotation.company_id
          : await resolveSessionCompanyIdAsync();

      if (!companyId || !isUuid(companyId)) {
        throw new Error(
          'This quotation has no Company. Open the quotation, select Company on the form, save, then convert — or ensure your user is linked to a company.',
        );
      }

      quotation = { ...quotation, company_id: companyId };

      await ensureJobNumberFormatReady();
      const branchId = await ensureJobBranchReady(quotation.company_id);

      try {
        return await postConvertToJob(id, { ...quotation, branch_id: branchId });
      } catch (convertErr) {
        const convertStatus = (convertErr as { response?: { status?: number } })?.response
          ?.status;
        if (convertStatus !== 500) {
          if ((convertErr as { response?: unknown }).response) {
            throw formatAxiosError(convertErr);
          }
          throw convertErr;
        }

        try {
          return await createJobFallbackFromQuotation({ ...quotation, branch_id: branchId });
        } catch (fallbackErr) {
          throw formatAxiosError(fallbackErr);
        }
      }
    } catch (error) {
      if (error instanceof Error && !(error as { response?: unknown }).response) {
        throw error;
      }
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
        axiosInstance.get<unknown>(QUOTATION_API.pdf(id), {
          withCredentials: false,
        }),
      );
      return normalizeQuotationPdfInfo(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // No PDF yet / backend still processing / opaque 5xx — treat as empty, not a hard failure.
      if (status === 404 || status === 204 || (typeof status === 'number' && status >= 500)) {
        return {};
      }
      throw formatAxiosError(error);
    }
  },

  async generatePdf(id: string, dto: GenerateQuotationPdfDto): Promise<QuotationPdfInfo> {
    assertId(id);
    const mode = String(dto.mode ?? 'CUSTOMER').trim().toUpperCase();
    if (mode !== 'CUSTOMER' && mode !== 'INTERNAL') {
      throw new Error('PDF mode must be CUSTOMER or INTERNAL.');
    }
    const body: Record<string, unknown> = { mode };
    const layout = dto.layout_variant?.trim();
    if (layout) body.layout_variant = layout.slice(0, 50);

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.pdf(id), body, {
          withCredentials: false,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return normalizeQuotationPdfInfo(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const formatted = formatAxiosError(error);
      if (status != null && status >= 500) {
        throw new Error(
          `${formatted.message}. PDF generation failed on the server (often missing template, queue, or Chromium on Render). Confirm in Network that POST /quotations/{id}/pdf body is { "mode": "CUSTOMER"|"INTERNAL" }.`,
        );
      }
      throw formatted;
    }
  },

  async getPdfStatus(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.pdfStatus(id), {
          withCredentials: false,
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || (typeof status === 'number' && status >= 500)) {
        return { status: status === 404 ? 'NOT_FOUND' : 'ERROR' };
      }
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
      const body = prepareOnlineQuotePayload(dto as Record<string, unknown>);
      if (!body.tenant_slug || !body.job_type || !body.currency_code) {
        throw new Error('tenant_slug, job_type, and currency_code are required.');
      }
      if (!body.customer_id && !(body.contact_email && body.contact_name)) {
        throw new Error(
          'Provide customer_id, or both contact_name and contact_email for online quote.',
        );
      }

      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.onlineQuote, body),
      );

      const candidate = extractQuotationCandidate(res.data);
      let quotation = normalizeQuotation(candidate);

      if (!quotation) {
        const id = extractQuotationId(res.data) ?? extractQuotationId(candidate);
        if (id) {
          try {
            quotation = await this.getById(id);
          } catch {
            // fall through to clearer error below
          }
        }
      }

      if (!quotation) {
        // Empty / undocumented 201 body — still treat as success if HTTP succeeded.
        throw new Error(
          'Online quote was accepted by the server, but the response did not include a quotation object. Open All Quotations to find the new draft, or ask backend to return the created quotation (or its id) in the 201 body.',
        );
      }
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
