import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { ZIP_DISTANCE_API } from '../api/zipDistance.api';
import { normalizeZipDistance, normalizeZipDistances } from '../utils/normalizeZipDistance';
import { prepareZipDistancePayload } from '../utils/prepareZipDistancePayload';
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
      (Array.isArray(nested.zip_distances) && nested.zip_distances) ||
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
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Request failed');
}

function assertId(id: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid zip distance id.');
}

function buildListQuery(
  params: ZipDistanceListParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    order: params.order ?? 'asc',
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (typeof params.is_active === 'boolean') query.is_active = params.is_active;
  return query;
}

export const zipDistanceService = {
  async list(params: ZipDistanceListParams = {}): Promise<ZipDistanceListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(ZIP_DISTANCE_API.list, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const normalized = normalizeZipDistances(items);
      return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<ZipDistance> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<ZipDistance> | ZipDistance>(ZIP_DISTANCE_API.byId(id)),
      );
      const item = normalizeZipDistance(unwrapEntity(res.data));
      if (!item) throw new Error('Zip distance not found.');
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
        ),
      );
      const item = normalizeZipDistance(unwrapEntity(res.data));
      if (!item) throw new Error('Create succeeded but no record was returned.');
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
        ),
      );
      const item = normalizeZipDistance(unwrapEntity(res.data));
      if (!item) throw new Error('Update succeeded but no record was returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(ZIP_DISTANCE_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async setActive(id: string, is_active: boolean): Promise<ZipDistance> {
    return this.update(id, { is_active });
  },
};
