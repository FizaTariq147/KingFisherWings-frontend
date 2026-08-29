import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import type { PaginationMeta } from '../types/nvocc.types';

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope || !('data' in envelope)) return raw;
  const nested = asRecord(envelope.data);
  if (nested && 'data' in nested && Object.keys(nested).length <= 2) return nested.data;
  return envelope.data;
}

export function unwrapList(
  raw: unknown,
  keys: string[] = [],
): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  if (Array.isArray(envelope.data)) return { items: envelope.data, meta: envelope.meta };
  const nested = asRecord(envelope.data) ?? envelope;
  const candidates = ['items', 'results', ...keys];
  for (const key of candidates) {
    if (Array.isArray(nested[key])) {
      return { items: nested[key] as unknown[], meta: nested.meta ?? envelope.meta };
    }
  }
  return { items: [], meta: nested.meta ?? envelope.meta };
}

export function normalizeMeta(
  raw: unknown,
  count: number,
  params: { page?: number; limit?: number },
): PaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? record?.total_count ?? count) || count;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) || Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

export function formatNvoccError(error: unknown): Error {
  return new Error(extractAxiosErrorDetail(error));
}

export function queryParams(params: object) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  );
}

export function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

export function num(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  return undefined;
}

export function idOf(raw: Record<string, unknown>): string {
  return str(raw.id) ?? str(raw.uuid) ?? '';
}

export function prepareNvoccPayload<T extends object>(dto: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(dto).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  );
}
