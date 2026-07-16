import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
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
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(INVOICE_API.send(id), {
          to_email: dto.to_email.trim(),
          ...(dto.message?.trim() ? { message: dto.message.trim().slice(0, 500) } : {}),
        }),
      );
      const invoice = normalizeInvoice(unwrapEntity(res.data));
      if (invoice) return invoice;
      return this.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
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
