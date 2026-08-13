import type { PaginationMeta } from '../types/crm.types';

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope || !('data' in envelope)) return raw;
  const nested = asRecord(envelope.data);
  if (nested && 'data' in nested && Object.keys(nested).length <= 2) return nested.data;
  return envelope.data;
}

export function unwrapList(raw: unknown, keys: string[] = []): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  if (Array.isArray(envelope.data)) return { items: envelope.data, meta: envelope.meta };
  const nested = asRecord(envelope.data) ?? envelope;
  const candidates = ['items', 'results', ...keys];
  for (const key of candidates) {
    if (Array.isArray(nested[key])) return { items: nested[key] as unknown[], meta: nested.meta ?? envelope.meta };
  }
  return { items: [], meta: nested.meta ?? envelope.meta };
}

export function normalizeMeta(raw: unknown, count: number, params: { page?: number; limit?: number }): PaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? record?.total_count ?? count) || count;
  const totalPages = Number(record?.totalPages ?? record?.total_pages) || Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

export function formatAxiosError(error: unknown): Error {
  const axiosError = error as { response?: { data?: { message?: string | string[]; error?: string } }; message?: string };
  const message = axiosError.response?.data?.message;
  if (Array.isArray(message)) return new Error(message.join('; '));
  if (typeof message === 'string' && message) return new Error(message);
  if (axiosError.response?.data?.error) return new Error(axiosError.response.data.error);
  return error instanceof Error ? error : new Error(axiosError.message || 'Request failed');
}

export function queryParams(params: object) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null));
}
