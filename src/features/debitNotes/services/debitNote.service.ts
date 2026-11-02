import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { DEBIT_NOTE_API } from '../api/debitNote.api';
import { enrichDebitNotesDisplay } from '../utils/enrichDebitNoteDisplay';
import {
  normalizeDebitNote,
  normalizeDebitNotes,
} from '../utils/normalizeDebitNote';
import { prepareDebitNotePayload } from '../utils/prepareDebitNotePayload';
import type {
  CreateDebitNoteDto,
  DebitNote,
  DebitNoteListParams,
  DebitNoteListResult,
  PaginationMeta,
} from '../types/debitNote.types';

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
      (Array.isArray(nested.debit_notes) && nested.debit_notes) ||
      (Array.isArray(nested.debitNotes) && nested.debitNotes) ||
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

function assertId(id: string, label = 'debit note'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(params: DebitNoteListParams): Record<string, string | number> {
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

export const debitNoteService = {
  async list(params: DebitNoteListParams = {}): Promise<DebitNoteListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(DEBIT_NOTE_API.list, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const debitNotes = await enrichDebitNotesDisplay(normalizeDebitNotes(items));
      return { debitNotes, meta: normalizeMeta(meta, debitNotes.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<DebitNote> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<DebitNote> | DebitNote>(DEBIT_NOTE_API.byId(id)),
      );
      const debitNote = normalizeDebitNote(unwrapEntity(res.data));
      if (!debitNote) throw new Error('Debit note not found.');
      const [enriched] = await enrichDebitNotesDisplay([debitNote]);
      return enriched ?? debitNote;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateDebitNoteDto): Promise<DebitNote> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          DEBIT_NOTE_API.create,
          prepareDebitNotePayload(dto as Record<string, unknown>),
        ),
      );
      const debitNote = normalizeDebitNote(unwrapEntity(res.data));
      if (!debitNote) throw new Error('Create succeeded but no debit note was returned.');
      return debitNote;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async post(id: string): Promise<DebitNote> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(DEBIT_NOTE_API.post(id)),
      );
      const debitNote = normalizeDebitNote(unwrapEntity(res.data));
      if (!debitNote) throw new Error('Post succeeded but no debit note was returned.');
      return debitNote;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /debit-notes/:id/attachment — download customer/staff payment proof. */
  async downloadAttachment(id: string, fallbackName = 'debit-note-attachment'): Promise<void> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<Blob>(DEBIT_NOTE_API.attachment(id), {
          responseType: 'blob',
          headers: { Accept: 'application/octet-stream, */*' },
        }),
      );
      const fromHeader = filenameFromContentDisposition(
        String(res.headers?.['content-disposition'] ?? ''),
      );
      triggerBlobDownload(res.data, fromHeader || fallbackName);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /debit-notes/:id/attachment — upload payment proof (multipart `file` or `attachment`). */
  async uploadAttachment(id: string, file: File): Promise<DebitNote> {
    assertId(id);
    const attempt = async (field: 'file' | 'attachment') => {
      const form = new FormData();
      form.append(field, file, file.name);
      return withGatewayRetry(() =>
        axiosInstance.post<unknown>(DEBIT_NOTE_API.attachment(id), form),
      );
    };
    try {
      let res;
      try {
        res = await attempt('file');
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 400 || status === 422) {
          res = await attempt('attachment');
        } else {
          throw error;
        }
      }
      const note = normalizeDebitNote(unwrapEntity(res.data));
      if (!note) {
        const refreshed = await this.getById(id);
        return {
          ...refreshed,
          has_attachment: true,
          attachment_name: refreshed.attachment_name || file.name,
        };
      }
      return {
        ...note,
        has_attachment: true,
        attachment_name: note.attachment_name || file.name,
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
