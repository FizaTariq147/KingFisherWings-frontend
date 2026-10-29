import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { ADMIN_QUOTE_REQUESTS_API } from '../api/adminQuoteRequests.api';
import type {
  ExternalQuoteRequest,
  PatchQuoteRequestStatusDto,
  QuoteRequestConnection,
  QuoteRequestHealthResult,
  QuoteRequestListParams,
  QuoteRequestListResult,
  QuoteRequestSyncResult,
  QuoteRequestSyncRunListParams,
  QuoteRequestSyncRunListResult,
  UpsertQuoteRequestConnectionDto,
} from '../types/adminQuoteRequests.types';
import {
  normalizeExternalQuoteRequest,
  normalizeQuoteRequestConnection,
  normalizeQuoteRequestHealth,
  normalizeQuoteRequestList,
  normalizeQuoteRequestSyncResult,
  normalizeQuoteRequestSyncRunList,
} from '../utils/normalizeAdminQuoteRequests';

function requireNormalized<T>(value: T | null, label: string): T {
  if (value == null) throw new Error(`${label} response was empty.`);
  return value;
}

export const adminQuoteRequestsService = {
  async list(params?: QuoteRequestListParams): Promise<QuoteRequestListResult> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.list, { params }),
    );
    return normalizeQuoteRequestList(res.data, {
      page: params?.page,
      limit: params?.limit,
    });
  },

  async getById(id: string): Promise<ExternalQuoteRequest> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.detail(id)),
    );
    return requireNormalized(
      normalizeExternalQuoteRequest(res.data),
      'Quote request',
    );
  },

  async convertToQuote(id: string): Promise<unknown> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.convertToQuote(id), {}),
    );
    return res.data;
  },

  async linkCrm(id: string): Promise<ExternalQuoteRequest> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.linkCrm(id), {}),
    );
    return (
      normalizeExternalQuoteRequest(res.data) ??
      (await adminQuoteRequestsService.getById(id))
    );
  },

  async updateStatus(
    id: string,
    body: PatchQuoteRequestStatusDto,
  ): Promise<ExternalQuoteRequest> {
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(ADMIN_QUOTE_REQUESTS_API.status(id), body),
    );
    return (
      normalizeExternalQuoteRequest(res.data) ??
      (await adminQuoteRequestsService.getById(id))
    );
  },

  async getConnection(): Promise<QuoteRequestConnection | null> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.connection),
      );
      return normalizeQuoteRequestConnection(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  async upsertConnection(
    body: UpsertQuoteRequestConnectionDto,
  ): Promise<QuoteRequestConnection> {
    const res = await withGatewayRetry(() =>
      axiosInstance.put(ADMIN_QUOTE_REQUESTS_API.connection, body),
    );
    return requireNormalized(
      normalizeQuoteRequestConnection(res.data),
      'Connection',
    );
  },

  async testConnection(): Promise<QuoteRequestHealthResult> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.connectionTest, {}),
    );
    return normalizeQuoteRequestHealth(res.data);
  },

  async sync(): Promise<QuoteRequestSyncResult> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.sync, {}),
    );
    return normalizeQuoteRequestSyncResult(res.data);
  },

  async listSyncRuns(
    params?: QuoteRequestSyncRunListParams,
  ): Promise<QuoteRequestSyncRunListResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const res = await withGatewayRetry(() =>
      axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.syncRuns, {
        params: { page: String(page), limit: String(limit) },
      }),
    );
    return normalizeQuoteRequestSyncRunList(res.data, { page, limit });
  },
};
