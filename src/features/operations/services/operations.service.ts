import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { OPERATIONS_API } from '../api/operations.api';
import type {
  OperationsDashboardQueryDto,
  OperationsListParams,
  OperationsListResult,
  PatchImportCargoDeliveryDto,
} from '../types/operations.types';

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

function unwrapList(raw: unknown): { items: Record<string, unknown>[]; meta?: unknown } {
  if (Array.isArray(raw)) {
    return {
      items: raw.filter((x): x is Record<string, unknown> => Boolean(asRecord(x))),
    };
  }
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) {
    return {
      items: data.filter((x): x is Record<string, unknown> => Boolean(asRecord(x))),
      meta: envelope.meta,
    };
  }
  const nested = asRecord(data);
  const list =
    (nested && Array.isArray(nested.items) && nested.items) ||
    (nested && Array.isArray(nested.results) && nested.results) ||
    (nested && Array.isArray(nested.jobs) && nested.jobs) ||
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.jobs) && envelope.jobs) ||
    [];
  return {
    items: list.filter((x): x is Record<string, unknown> => Boolean(asRecord(x))),
    meta: nested?.meta ?? envelope.meta,
  };
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: OperationsListParams,
): OperationsListResult['meta'] {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

function queryParams(params: OperationsListParams): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (params.page != null) q.page = params.page;
  if (params.limit != null) q.limit = params.limit;
  if (params.order) q.order = params.order;
  if (params.from_date) q.from_date = params.from_date;
  if (params.to_date) q.to_date = params.to_date;
  if (params.branch_id) q.branch_id = params.branch_id;
  if (params.status) q.status = params.status;
  return q;
}

export const operationsService = {
  async listImportCargoDelivery(
    params: OperationsListParams = {},
  ): Promise<OperationsListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.importCargoDelivery, {
          params: queryParams(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async patchImportCargoDelivery(
    jobId: string,
    dto: PatchImportCargoDeliveryDto,
  ): Promise<Record<string, unknown>> {
    if (!isUuid(jobId)) throw new Error('Invalid job id.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(OPERATIONS_API.importCargoDeliveryByJob(jobId), dto),
      );
      return asRecord(res.data) ?? asRecord((res.data as { data?: unknown })?.data) ?? {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getDashboard(params: OperationsListParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.dashboard, { params: queryParams(params) }),
      );
      return res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getClosedJobReport(params: OperationsListParams = {}): Promise<OperationsListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.closedJobReport, {
          params: queryParams(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadClosedJobReport(dto: OperationsDashboardQueryDto): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(OPERATIONS_API.closedJobReportDownload, dto, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listJobNotInvoicedDo(
    params: OperationsListParams = {},
  ): Promise<OperationsListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.jobNotInvoicedDo, {
          params: queryParams(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadJobNotInvoicedDo(dto: OperationsDashboardQueryDto = {}): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(OPERATIONS_API.jobNotInvoicedDoDownload, dto, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listJobFinanceReport(
    params: OperationsListParams = {},
  ): Promise<OperationsListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.jobFinanceReport, {
          params: queryParams(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadJobFinanceReport(dto: OperationsDashboardQueryDto = {}): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(OPERATIONS_API.jobFinanceReportDownload, dto, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listExceptions(
    params: OperationsListParams = {},
  ): Promise<OperationsListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.exceptions, {
          params: queryParams(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadExceptions(dto: OperationsDashboardQueryDto = {}): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(OPERATIONS_API.exceptionsDownload, dto, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listKpiStatus(
    params: OperationsListParams = {},
  ): Promise<OperationsListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.kpiStatus, {
          params: queryParams(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadKpiStatus(dto: OperationsDashboardQueryDto = {}): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(OPERATIONS_API.kpiStatusDownload, dto, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listJobListSummary(
    params: OperationsListParams = {},
  ): Promise<OperationsListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.jobListSummary, {
          params: queryParams(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadJobListSummary(dto: OperationsDashboardQueryDto = {}): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(OPERATIONS_API.jobListSummaryDownload, dto, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /operations/voyage-jobs-shipments */
  async listVoyageJobsShipments(
    params: OperationsListParams & {
      voyage_number?: string;
      vessel_name?: string;
    } = {},
  ): Promise<OperationsListResult> {
    try {
      const q = queryParams(params);
      if (params.voyage_number?.trim()) q.voyage_number = params.voyage_number.trim();
      if (params.vessel_name?.trim()) q.vessel_name = params.vessel_name.trim();
      const res = await withGatewayRetry(() =>
        axiosInstance.get(OPERATIONS_API.voyageJobsShipments, { params: q }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params), raw: res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
