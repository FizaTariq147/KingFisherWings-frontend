import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { asList, unwrap } from '@/features/online-payments/utils/billingApiHelpers';
import { ADMIN_QUOTE_REQUESTS_API } from '../api/adminQuoteRequests.api';

export const adminQuoteRequestsService = {
  async list(params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.list, { params }),
    );
    return asList(res.data);
  },

  async getById(id: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.detail(id), { params }),
    );
    return unwrap(res.data);
  },

  async convertToQuote(id: string, body: Record<string, unknown> = {}) {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.convertToQuote(id), body),
    );
    return unwrap(res.data);
  },

  async linkCrm(id: string, body: Record<string, unknown> = {}) {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.linkCrm(id), body),
    );
    return unwrap(res.data);
  },

  async updateStatus(id: string, body: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(ADMIN_QUOTE_REQUESTS_API.status(id), body),
    );
    return unwrap(res.data);
  },

  async getConnection(params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.connection, { params }),
    );
    return unwrap(res.data);
  },

  async upsertConnection(body: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.put(ADMIN_QUOTE_REQUESTS_API.connection, body),
    );
    return unwrap(res.data);
  },

  async testConnection(body: Record<string, unknown> = {}) {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.connectionTest, body),
    );
    return unwrap(res.data);
  },

  async sync(body: Record<string, unknown> = {}) {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(ADMIN_QUOTE_REQUESTS_API.sync, body),
    );
    return unwrap(res.data);
  },

  async listSyncRuns(params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(ADMIN_QUOTE_REQUESTS_API.syncRuns, { params }),
    );
    return asList(res.data);
  },
};
