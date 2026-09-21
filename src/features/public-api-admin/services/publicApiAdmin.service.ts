import { axiosInstance } from '@/lib/axios';
import { PUBLIC_API_ADMIN } from '../api/publicApiAdmin.api';

function unwrap(data: unknown): unknown {
  if (data && typeof data === 'object' && 'data' in (data as object)) {
    return (data as { data: unknown }).data;
  }
  return data;
}

function asList(data: unknown): Record<string, unknown>[] {
  const value = unwrap(data);
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['items', 'keys', 'webhooks', 'results']) {
      if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
    }
  }
  return [];
}

export const publicApiAdminService = {
  async listKeys() {
    const res = await axiosInstance.get(PUBLIC_API_ADMIN.keys);
    return asList(res.data);
  },
  async createKey(name: string) {
    const res = await axiosInstance.post(PUBLIC_API_ADMIN.keys, { name });
    return unwrap(res.data);
  },
  async revokeKey(id: string) {
    const res = await axiosInstance.patch(PUBLIC_API_ADMIN.revokeKey(id), {});
    return unwrap(res.data);
  },
  async listWebhooks() {
    const res = await axiosInstance.get(PUBLIC_API_ADMIN.webhooks);
    return asList(res.data);
  },
  async createWebhook(url: string) {
    const res = await axiosInstance.post(PUBLIC_API_ADMIN.webhooks, {
      url,
      events: ['job.updated'],
    });
    return unwrap(res.data);
  },
  async testDispatch() {
    const res = await axiosInstance.post(PUBLIC_API_ADMIN.testDispatch, {});
    return unwrap(res.data);
  },
  async billingStatus() {
    const res = await axiosInstance.get(PUBLIC_API_ADMIN.billingStatus);
    return unwrap(res.data);
  },
  async checkout() {
    const res = await axiosInstance.post(PUBLIC_API_ADMIN.checkout, {});
    return unwrap(res.data);
  },
};
