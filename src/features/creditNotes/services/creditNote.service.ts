import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CREDIT_NOTE_API } from '../api/creditNote.api';
import {
  normalizeCreditNote,
  normalizeCreditNotes,
} from '../utils/normalizeCreditNote';
import { prepareCreditNotePayload } from '../utils/prepareCreditNotePayload';
import type {
  CreateCreditNoteDto,
  CreditNote,
  CreditNoteListParams,
  CreditNoteListResult,
  PaginationMeta,
} from '../types/creditNote.types';

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
      (Array.isArray(nested.credit_notes) && nested.credit_notes) ||
      (Array.isArray(nested.creditNotes) && nested.creditNotes) ||
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

function assertId(id: string, label = 'credit note'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(params: CreditNoteListParams): Record<string, string | number> {
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

export const creditNoteService = {
  async list(params: CreditNoteListParams = {}): Promise<CreditNoteListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(CREDIT_NOTE_API.list, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const creditNotes = normalizeCreditNotes(items);
      return { creditNotes, meta: normalizeMeta(meta, creditNotes.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<CreditNote> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<CreditNote> | CreditNote>(CREDIT_NOTE_API.byId(id)),
      );
      const creditNote = normalizeCreditNote(unwrapEntity(res.data));
      if (!creditNote) throw new Error('Credit note not found.');
      return creditNote;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateCreditNoteDto): Promise<CreditNote> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          CREDIT_NOTE_API.create,
          prepareCreditNotePayload(dto as Record<string, unknown>),
        ),
      );
      const creditNote = normalizeCreditNote(unwrapEntity(res.data));
      if (!creditNote) throw new Error('Create succeeded but no credit note was returned.');
      return creditNote;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async post(id: string): Promise<CreditNote> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(CREDIT_NOTE_API.post(id)),
      );
      const creditNote = normalizeCreditNote(unwrapEntity(res.data));
      if (!creditNote) throw new Error('Post succeeded but no credit note was returned.');
      return creditNote;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
