import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { ZIP_DISTANCE_API } from '../api/zipDistance.api';
import { normalizeZipDistance, normalizeZipDistances } from '../utils/normalizeZipDistance';
import { prepareZipDistancePayload } from '../utils/prepareZipDistancePayload';
import {
  forgetSessionZipDistance,
  listSessionZipDistances,
  rememberSessionZipDistance,
} from '../utils/zipDistanceSessionRegistry';
import type {
  CreateZipDistanceDto,
  PaginationMeta,
  UpdateZipDistanceDto,
  ZipDistance,
  ZipDistanceListParams,
  ZipDistanceListResult,
} from '../types/zipDistance.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: ZipDistanceListParams,
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

function pickArray(...candidates: unknown[]): unknown[] | null {
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return null;
}

function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };

  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };

  const named = pickArray(
    envelope.items,
    envelope.results,
    envelope.records,
    envelope.zip_distances,
    envelope.zipDistances,
    envelope.rows,
  );
  if (named) return { items: named, meta: envelope.meta };

  if (Array.isArray(envelope.data)) {
    return { items: envelope.data, meta: envelope.meta };
  }

  const nested = asRecord(envelope.data);
  if (nested) {
    const list =
      pickArray(
        nested.items,
        nested.results,
        nested.records,
        nested.zip_distances,
        nested.zipDistances,
        nested.rows,
        nested.data,
      ) ?? [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }

  for (const value of Object.values(envelope)) {
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((row) => row && typeof row === 'object' && 'id' in (row as object))
    ) {
      return { items: value, meta: envelope.meta };
    }
  }

  return { items: [] };
}

function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope) return raw;
  if ('data' in envelope) {
    const data = envelope.data;
    const nested = asRecord(data);
    if (nested && (nested.id || nested.zip_distance_id)) return data;
    if (nested?.zip_distance) return nested.zip_distance;
    return data;
  }
  if (envelope.zip_distance) return envelope.zip_distance;
  return raw;
}

function extractId(raw: unknown): string | null {
  const stack: unknown[] = [raw, unwrapEntity(raw)];
  const seen = new Set<unknown>();
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);
    const rec = asRecord(cur);
    if (!rec) continue;
    for (const key of ['id', 'zip_distance_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.zip_distance, rec.result]) {
      if (nest) stack.push(nest);
    }
  }
  return null;
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: {
      status?: number;
      data?: { message?: string | string[]; error?: string };
    };
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

function assertId(id: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid zip distance id.');
}

function isQuotationRouteShadowError(error: unknown): boolean {
  const axiosErr = error as {
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const status = axiosErr.response?.status;
  if (status !== 400 && status !== 422) return false;
  const message = axiosErr.response?.data?.message;
  const text = Array.isArray(message) ? message.join(' ') : String(message ?? '');
  return /uuid is expected/i.test(text);
}

function buildListQuery(
  params: ZipDistanceListParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.order === 'asc' || params.order === 'desc') query.order = params.order;
  if (params.search?.trim()) query.search = params.search.trim();
  if (typeof params.is_active === 'boolean') query.is_active = params.is_active;
  return query;
}

function filterLocalZipDistances(
  items: ZipDistance[],
  params: ZipDistanceListParams,
): ZipDistance[] {
  let next = [...items];
  if (typeof params.is_active === 'boolean') {
    next = next.filter((z) => (z.is_active !== false) === params.is_active);
  }
  const q = params.search?.trim().toLowerCase();
  if (q) {
    next = next.filter((z) => {
      const hay = [z.from_zip, z.from_city, z.to_zip, z.to_city, z.unit]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }
  next.sort((a, b) => {
    const left = a.created_at || a.from_zip || a.id;
    const right = b.created_at || b.from_zip || b.id;
    return params.order === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
  });
  return next;
}

async function fetchZipDistanceById(id: string): Promise<ZipDistance> {
  const res = await withGatewayRetry(() =>
    axiosInstance.get<ApiEnvelope<ZipDistance> | ZipDistance>(ZIP_DISTANCE_API.byId(id), {
      withCredentials: false,
    }),
  );
  const item = normalizeZipDistance(unwrapEntity(res.data));
  if (!item) throw new Error('Zip distance not found.');
  return item;
}

async function hydrateSessionZipDistances(): Promise<ZipDistance[]> {
  const remembered = listSessionZipDistances();
  if (remembered.length === 0) return [];
  const out: ZipDistance[] = [];
  for (const row of remembered) {
    if (!isUuid(row.id)) {
      out.push(row);
      continue;
    }
    try {
      const fresh = await fetchZipDistanceById(row.id);
      rememberSessionZipDistance(fresh);
      out.push(fresh);
    } catch {
      out.push(row);
    }
  }
  return out;
}

export const zipDistanceService = {
  async list(params: ZipDistanceListParams = {}): Promise<ZipDistanceListResult> {
    const tryRemote = async (query?: Record<string, string | number | boolean>) => {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ZIP_DISTANCE_API.list, {
          params: query,
          withCredentials: false,
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const normalized = normalizeZipDistances(items);
      return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
    };

    try {
      try {
        return await tryRemote({
          page: params.page ?? 1,
          limit: params.limit ?? 20,
        });
      } catch (firstError) {
        if (!isQuotationRouteShadowError(firstError)) {
          return await tryRemote(buildListQuery(params));
        }
        throw firstError;
      }
    } catch (error) {
      if (!isQuotationRouteShadowError(error)) {
        throw formatAxiosError(error);
      }

      // Collection GET shadowed by GET /quotations/:id — load via GET /quotations/zip-distances/{id}.
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(
          '[zipDistance.list] GET /quotations/zip-distances shadowed — loading via GET /quotations/zip-distances/{id}',
        );
      }

      const sessionRows = filterLocalZipDistances(await hydrateSessionZipDistances(), params);
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const start = (page - 1) * limit;
      const slice = sessionRows.slice(start, start + limit);
      return {
        items: slice,
        meta: {
          page,
          limit,
          total: sessionRows.length,
          totalPages: Math.max(1, Math.ceil(sessionRows.length / Math.max(limit, 1))),
        },
        backendListUnavailable: true,
      };
    }
  },

  async getById(id: string): Promise<ZipDistance> {
    assertId(id);
    try {
      const item = await fetchZipDistanceById(id);
      rememberSessionZipDistance(item);
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateZipDistanceDto): Promise<ZipDistance> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          ZIP_DISTANCE_API.list,
          prepareZipDistancePayload(dto as Record<string, unknown>),
          { withCredentials: false },
        ),
      );
      let item = normalizeZipDistance(unwrapEntity(res.data));
      if (!item) {
        const id = extractId(res.data);
        if (id) item = await this.getById(id);
      }
      if (!item) throw new Error('Create succeeded but no record was returned.');
      rememberSessionZipDistance(item);
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateZipDistanceDto): Promise<ZipDistance> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          ZIP_DISTANCE_API.byId(id),
          prepareZipDistancePayload(dto as Record<string, unknown>),
          { withCredentials: false },
        ),
      );
      const item = normalizeZipDistance(unwrapEntity(res.data));
      if (!item) throw new Error('Update succeeded but no record was returned.');
      rememberSessionZipDistance(item);
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(ZIP_DISTANCE_API.byId(id), { withCredentials: false }),
      );
      forgetSessionZipDistance(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async setActive(id: string, is_active: boolean): Promise<ZipDistance> {
    return this.update(id, { is_active });
  },
};
