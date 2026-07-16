import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { AWB_STOCK_API } from '../api/awbStock.api';
import {
  normalizeAwbAllocations,
  normalizeAwbStockBatch,
  normalizeAwbStockBatches,
  unwrapEntity,
  unwrapList,
} from '../utils/normalizeAwbStock';
import {
  prepareCreateBatchPayload,
  prepareUpdateBatchPayload,
} from '../utils/prepareAwbStockPayload';
import type {
  AllocateAwbDto,
  AwbAllocationListParams,
  AwbAllocationListResult,
  AwbStockBatch,
  AwbStockBatchListParams,
  AwbStockBatchListResult,
  CreateAwbStockBatchDto,
  PaginationMeta,
  TransferAwbBatchDto,
  UpdateAwbStockBatchDto,
  VoidAwbAllocationDto,
} from '../types/awbStock.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
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

function assertId(id: string): void {
  if (!id || !isUuid(id)) throw new Error('Invalid AWB stock id.');
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  page: number,
  limit: number,
): PaginationMeta {
  const record = asRecord(raw);
  const p = Number(record?.page ?? page) || page;
  const l = Number(record?.limit ?? limit) || limit;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(l, 1)));
  return { page: p, limit: l, total, totalPages };
}

function clientPaginate<T>(
  items: T[],
  page: number,
  limit: number,
): { pageItems: T[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  return {
    pageItems: items.slice(start, start + limit),
    meta: { page: safePage, limit, total, totalPages },
  };
}

export const awbStockService = {
  async listBatches(params: AwbStockBatchListParams = {}): Promise<AwbStockBatchListResult> {
    try {
      const query: Record<string, string> = {};
      if (params.airline_id) query.airline_id = params.airline_id;
      if (params.branch_id) query.branch_id = params.branch_id;
      if (params.job_id) query.job_id = params.job_id;

      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(AWB_STOCK_API.batches, { params: query }),
      );
      const { items } = unwrapList(res.data);
      let batches = normalizeAwbStockBatches(items);

      if (params.low_stock_only) {
        batches = batches.filter((b) => b.is_low_stock);
      }
      if (params.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        batches = batches.filter((b) => {
          const hay = [
            b.prefix,
            b.airline_name,
            b.airline_code,
            b.branch_name,
            String(b.range_from),
            String(b.range_to),
            b.notes,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return hay.includes(q);
        });
      }
      if (params.order === 'asc') {
        batches = [...batches].sort((a, b) => a.range_from - b.range_from);
      } else {
        batches = [...batches].sort((a, b) => b.range_from - a.range_from);
      }

      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const { pageItems, meta } = clientPaginate(batches, page, limit);
      return { items: pageItems, meta };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getBatch(id: string): Promise<AwbStockBatch> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(AWB_STOCK_API.batch(id)),
      );
      const item = normalizeAwbStockBatch(unwrapEntity(res.data));
      if (!item) throw new Error('AWB stock batch not found.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createBatch(dto: CreateAwbStockBatchDto): Promise<AwbStockBatch> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(AWB_STOCK_API.batches, prepareCreateBatchPayload(dto)),
      );
      const item = normalizeAwbStockBatch(unwrapEntity(res.data));
      if (!item) throw new Error('Create succeeded but no batch was returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateBatch(id: string, dto: UpdateAwbStockBatchDto): Promise<AwbStockBatch> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(AWB_STOCK_API.batch(id), prepareUpdateBatchPayload(dto)),
      );
      const item = normalizeAwbStockBatch(unwrapEntity(res.data));
      if (!item) throw new Error('Update succeeded but no batch was returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deleteBatch(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(AWB_STOCK_API.batch(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async allocate(id: string, dto: AllocateAwbDto): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(AWB_STOCK_API.allocate(id), dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async transferBranch(id: string, dto: TransferAwbBatchDto): Promise<AwbStockBatch> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(AWB_STOCK_API.transferBranch(id), dto),
      );
      const item = normalizeAwbStockBatch(unwrapEntity(res.data));
      if (!item) throw new Error('Transfer succeeded but no batch was returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listAllocations(
    params: AwbAllocationListParams = {},
  ): Promise<AwbAllocationListResult> {
    try {
      const query: Record<string, string> = {};
      if (params.airline_id) query.airline_id = params.airline_id;
      if (params.branch_id) query.branch_id = params.branch_id;
      if (params.job_id) query.job_id = params.job_id;

      const res = await withGatewayRetry(() =>
        axiosInstance.get(AWB_STOCK_API.allocations, { params: query }),
      );
      const { items, meta } = unwrapList(res.data);
      let allocations = normalizeAwbAllocations(items);
      if (params.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        allocations = allocations.filter((a) =>
          [a.awb_number, a.job_number, a.status, a.prefix]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q),
        );
      }
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const { pageItems, meta: pageMeta } = clientPaginate(allocations, page, limit);
      return {
        items: pageItems,
        meta: meta
          ? normalizeMeta(meta, allocations.length, page, limit)
          : pageMeta,
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async markAllocationUsed(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(AWB_STOCK_API.markUsed(id)),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async voidAllocation(id: string, dto: VoidAwbAllocationDto): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(AWB_STOCK_API.voidAllocation(id), dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getLowStockReport(): Promise<AwbStockBatch[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(AWB_STOCK_API.lowStockReport),
      );
      const { items } = unwrapList(res.data);
      if (items.length) return normalizeAwbStockBatches(items);
      const entity = unwrapEntity(res.data);
      if (Array.isArray(entity)) return normalizeAwbStockBatches(entity);
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
