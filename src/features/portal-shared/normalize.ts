/** Shared unwrap/normalize helpers for portal customer + admin responses. */

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

export function pickBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

export function unwrapData(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

export interface PortalPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: { page?: number; limit?: number } = {},
): PortalPaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

export function unwrapList(
  raw: unknown,
  nestedKeys: string[] = ['items', 'results', 'data'],
): { items: unknown[]; meta?: unknown } {
  const unwrapped = unwrapData(raw);
  if (Array.isArray(unwrapped)) return { items: unwrapped, meta: asRecord(raw)?.meta };

  const envelope = asRecord(raw);
  const nested = asRecord(unwrapped);
  if (!nested) return { items: [], meta: envelope?.meta };

  for (const key of nestedKeys) {
    const list = nested[key];
    if (Array.isArray(list)) {
      return { items: list, meta: nested.meta ?? envelope?.meta };
    }
  }

  return { items: [], meta: nested.meta ?? envelope?.meta };
}

export function filenameFromContentDisposition(header?: string): string | undefined {
  if (!header) return undefined;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1]?.trim() || undefined;
}
