import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { wakeApi, withGatewayRetry } from '@/lib/wakeApi';
import {
  formatShareEmailError,
  normalizeShareEmailResult,
  SHARE_EMAIL_TIMEOUT_MS,
} from '@/features/shared/share-email';
import { INVOICE_API } from '../api/invoice.api';
import {
  normalizeInvoice,
  normalizeInvoiceLine,
  normalizeInvoices,
} from '../utils/normalizeInvoice';
import {
  prepareInvoiceLinePayload,
  prepareInvoicePayload,
} from '../utils/prepareInvoicePayload';
import { normalizeInvoicePdfInfo } from '../utils/normalizeInvoicePdf';
import type {
  CreateInvoiceDto,
  CreateInvoiceLineDto,
  Invoice,
  InvoiceLine,
  InvoiceListParams,
  InvoiceListResult,
  InvoicePdfInfo,
  PaginationMeta,
  SendInvoiceEmailDto,
  UpdateInvoiceDto,
  UpdateInvoiceLineDto,
} from '../types/invoice.types';

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
      (Array.isArray(nested.invoices) && nested.invoices) ||
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

function assertId(id: string, label = 'invoice'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(params: InvoiceListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  for (const key of ['search', 'status', 'invoice_type', 'from_date', 'to_date'] as const) {
    const val = params[key];
    if (typeof val === 'string' && val.trim()) query[key] = val.trim();
  }
  for (const key of ['party_id', 'job_id'] as const) {
    const val = params[key];
    if (typeof val === 'string' && isUuid(val)) query[key] = val;
  }
  return query;
}

async function postAction(url: string, body?: unknown): Promise<Invoice> {
  const res = await withGatewayRetry(() =>
    axiosInstance.post<unknown>(url, body ?? {}),
  );
  const invoice = normalizeInvoice(unwrapEntity(res.data));
  if (!invoice) throw new Error('Action succeeded but no invoice was returned.');
  return invoice;
}

export const invoiceService = {
  async list(params: InvoiceListParams = {}): Promise<InvoiceListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(INVOICE_API.list, { params: buildListQuery(params) }),
      );
      const { items, meta } = unwrapList(res.data);
      const invoices = normalizeInvoices(items);
      return { invoices, meta: normalizeMeta(meta, invoices.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listOverdue(): Promise<Invoice[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(INVOICE_API.overdue),
      );
      const { items } = unwrapList(res.data);
      if (items.length) return normalizeInvoices(items);
      const entity = unwrapEntity(res.data);
      if (Array.isArray(entity)) return normalizeInvoices(entity);
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Invoice> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<Invoice> | Invoice>(INVOICE_API.byId(id)),
      );
      const invoice = normalizeInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('Invoice not found.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          INVOICE_API.create,
          prepareInvoicePayload(dto as Record<string, unknown>),
        ),
      );
      const invoice = normalizeInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('Create succeeded but no invoice was returned.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          INVOICE_API.byId(id),
          prepareInvoicePayload(dto as Record<string, unknown>),
        ),
      );
      const invoice = normalizeInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('Update succeeded but no invoice was returned.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async remove(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(INVOICE_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createFromJob(jobId: string): Promise<Invoice> {
    assertId(jobId, 'job');
    try {
      return await postAction(INVOICE_API.fromJob(jobId));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * Ensure a draft customer invoice exists for a job (air/NVOCC send-invoice needs invoice_id).
   * 1) POST /invoices/from-job/:jobId (needs uninvoiced billable charges)
   * 2) GET /invoices?job_id=
   * 3) POST /invoices with party + job + lines (fallback: job charges, else quotation lines, else placeholder)
   */
  async ensureDraftForJob(job: {
    id: string;
    shipper_id?: string;
    billing_party_id?: string;
    company_id?: string;
    branch_id?: string;
    currency_code?: string;
    charges?: Array<{
      description?: string;
      charge_code?: string;
      charge_code_id?: string;
      quantity?: number;
      unit_price?: number;
      is_cost?: boolean;
      is_billable?: boolean;
    }>;
    /** Prefer these when job has no billable charges yet (from linked quotation). */
    quotationLines?: CreateInvoiceLineDto[];
    lineHint?: string;
  }): Promise<Invoice> {
    assertId(job.id, 'job');

    let fromJobError = '';
    try {
      const fromJob = await this.createFromJob(job.id);
      // from-job may return a zero-line invoice when job charges were empty — fill from quotation.
      return await this.applyQuotationLinesIfNeeded(fromJob, job.quotationLines);
    } catch (err) {
      fromJobError = err instanceof Error ? err.message : String(err);
    }

    try {
      const listed = await this.list({ job_id: job.id, limit: 10, page: 1 });
      const existing = listed.invoices.find((inv) => isUuid(inv.id));
      if (existing) {
        const detail = existing.lines?.length
          ? existing
          : (await this.getById(existing.id).catch(() => existing));
        return await this.applyQuotationLinesIfNeeded(detail, job.quotationLines);
      }
    } catch {
      /* continue to create */
    }

    const partyId =
      (job.billing_party_id && isUuid(job.billing_party_id) && job.billing_party_id) ||
      (job.shipper_id && isUuid(job.shipper_id) && job.shipper_id) ||
      '';
    if (!partyId) {
      throw new Error(
        fromJobError
          ? `${fromJobError} — also no shipper/billing party on the job to create a draft invoice.`
          : 'Job has no shipper/billing party. Set shipper on the job, add billable charges, then retry.',
      );
    }

    const currency = (job.currency_code || 'AED').trim().toUpperCase().slice(0, 3) || 'AED';
    const billable = (job.charges ?? []).filter(
      (c) => c.is_cost !== true && c.is_billable !== false,
    );
    const quotationLines = (job.quotationLines ?? []).filter(
      (l) => String(l.description ?? '').trim().length > 0,
    );
    const lines =
      billable.length > 0
        ? billable.map((c, index) => ({
            description: (c.description || c.charge_code || `Charge ${index + 1}`).slice(0, 300),
            quantity: Number(c.quantity) > 0 ? Number(c.quantity) : 1,
            unit_price: Number.isFinite(Number(c.unit_price)) ? Number(c.unit_price) : 0,
            charge_code_id:
              c.charge_code_id && isUuid(c.charge_code_id) ? c.charge_code_id : undefined,
            sort_order: index,
          }))
        : quotationLines.length > 0
          ? quotationLines
          : [
              {
                description: (job.lineHint || 'Air freight charges').slice(0, 300),
                quantity: 1,
                unit_price: 0,
                sort_order: 0,
              },
            ];

    try {
      return await this.create({
        party_id: partyId,
        job_id: job.id,
        company_id: job.company_id && isUuid(job.company_id) ? job.company_id : undefined,
        branch_id: job.branch_id && isUuid(job.branch_id) ? job.branch_id : undefined,
        currency_code: currency,
        remarks: fromJobError
          ? `Created after from-job: ${fromJobError.slice(0, 180)}`
          : undefined,
        lines,
      });
    } catch (err) {
      const createErr = err instanceof Error ? err.message : String(err);
      throw new Error(
        [
          fromJobError ? `from-job: ${fromJobError}` : null,
          `POST /invoices: ${createErr}`,
          'Add billable job charges (Charges tab) or ensure shipper is set, then retry.',
        ]
          .filter(Boolean)
          .join(' — '),
      );
    }
  },

  /**
   * If invoice has no meaningful lines, append quotation revenue lines (same as quote charges).
   */
  async applyQuotationLinesIfNeeded(
    invoice: Invoice,
    quotationLines?: CreateInvoiceLineDto[],
  ): Promise<Invoice> {
    const { invoiceNeedsQuotationCharges } = await import(
      '@/features/quotations/utils/quotationRevenueCharges'
    );
    const lines = quotationLines?.filter((l) => String(l.description ?? '').trim().length > 0) ?? [];
    if (!lines.length) return invoice;

    let detail = invoice;
    if (!detail.lines?.length) {
      try {
        detail = await this.getById(invoice.id);
      } catch {
        /* use what we have */
      }
    }
    if (!invoiceNeedsQuotationCharges(detail.lines)) return detail;

    for (const line of lines) {
      try {
        await this.addLine(invoice.id, line);
      } catch {
        /* skip duplicate / validation failures per line */
      }
    }
    try {
      return await this.getById(invoice.id);
    } catch {
      return detail;
    }
  },

  async addLine(id: string, dto: CreateInvoiceLineDto): Promise<InvoiceLine> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          INVOICE_API.lines(id),
          prepareInvoiceLinePayload(dto as Record<string, unknown>),
        ),
      );
      const line = normalizeInvoiceLine(unwrapEntity(res.data));
      if (!line) {
        const invoice = normalizeInvoice(unwrapEntity(res.data));
        const last = invoice?.lines?.[invoice.lines.length - 1];
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
    dto: UpdateInvoiceLineDto,
  ): Promise<InvoiceLine> {
    assertId(id);
    assertId(lineId, 'line');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          INVOICE_API.lineById(id, lineId),
          prepareInvoiceLinePayload(dto as Record<string, unknown>),
        ),
      );
      const line = normalizeInvoiceLine(unwrapEntity(res.data));
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
      await withGatewayRetry(() => axiosInstance.delete(INVOICE_API.lineById(id, lineId)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async post(id: string): Promise<Invoice> {
    assertId(id);
    try {
      return await postAction(INVOICE_API.post(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async send(id: string, dto: SendInvoiceEmailDto): Promise<Invoice> {
    assertId(id);
    try {
      // Wake cold dyno first; PDF + SMTP often needs longer than the default 120s.
      await wakeApi(45_000);
      const res = await axiosInstance.post<unknown>(
        INVOICE_API.send(id),
        {
          to_email: dto.to_email.trim(),
          ...(dto.message?.trim() ? { message: dto.message.trim().slice(0, 500) } : {}),
        },
        { timeout: SHARE_EMAIL_TIMEOUT_MS },
      );
      const share = normalizeShareEmailResult(res.data);
      if (share.success === false) {
        throw new Error(share.message || 'Invoice email was not sent.');
      }
      const invoice = normalizeInvoice(unwrapEntity(res.data));
      if (invoice) return invoice;
      return this.getById(id);
    } catch (error) {
      throw formatShareEmailError(error, 'Could not send invoice email.');
    }
  },

  async getPdf(id: string): Promise<InvoicePdfInfo> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(INVOICE_API.pdf(id), { withCredentials: false }),
      );
      return normalizeInvoicePdfInfo(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 204 || (typeof status === 'number' && status >= 500)) {
        return {};
      }
      throw formatAxiosError(error);
    }
  },

  /**
   * Optional FRESA format payload for catalog AutoPdf / generate params.
   * Additive only — never used by Invoice detail "Generate PDF" (POST /invoices/:id/pdf).
   */
  async getFormatPayload(
    id: string,
    format: string,
  ): Promise<Record<string, unknown> | null> {
    assertId(id);
    const code = format.trim();
    if (!code) return null;
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(INVOICE_API.formatPayload(id), {
          params: { format: code },
          withCredentials: false,
        }),
      );
      const entity = unwrapEntity(res.data);
      const record = asRecord(entity) ?? asRecord(res.data);
      return record;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 501 || status === 204) return null;
      throw formatAxiosError(error);
    }
  },

  async generatePdf(id: string): Promise<InvoicePdfInfo> {
    assertId(id);
    try {
      // Swagger: POST /invoices/{id}/pdf — no request body.
      const res = await withGatewayRetry(() =>
        axiosInstance.request<unknown>({
          method: 'POST',
          url: INVOICE_API.pdf(id),
          withCredentials: false,
          // Avoid sending `{}` / Content-Type that some Nest handlers mishandle.
          data: undefined,
          transformRequest: [
            (_data, headers) => {
              if (headers && typeof headers === 'object') {
                delete (headers as Record<string, unknown>)['Content-Type'];
                delete (headers as Record<string, unknown>)['content-type'];
              }
              return undefined;
            },
          ],
        }),
      );
      return normalizeInvoicePdfInfo(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const formatted = formatAxiosError(error);
      if (status != null && status >= 500) {
        throw new Error(
          `${formatted.message}. Invoice PDF failed on the server (Chromium/Puppeteer or template on Render). Confirm Network: POST /invoices/{id}/pdf with empty body returns 201. This cannot be fixed by installing puppeteer in the frontend.`,
        );
      }
      throw formatted;
    }
  },

  async cancel(id: string): Promise<Invoice> {
    assertId(id);
    try {
      return await postAction(INVOICE_API.cancel(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
