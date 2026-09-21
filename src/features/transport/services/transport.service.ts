import { axiosInstance } from '@/lib/axios';
import { TRANSPORT_API } from '../api/transport.api';

export type TransportRequestRow = Record<string, unknown> & { id: string };

function unwrap(data: unknown): unknown {
  if (data && typeof data === 'object' && 'data' in (data as object)) {
    return (data as { data: unknown }).data;
  }
  return data;
}

function asRows(data: unknown): TransportRequestRow[] {
  const value = unwrap(data);
  const list = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)
      ? (value as { items: unknown[] }).items
      : [];
  return list
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    .map((row) => ({ ...row, id: String(row.id ?? '') }))
    .filter((row) => row.id);
}

export const transportService = {
  async list(): Promise<TransportRequestRow[]> {
    const res = await axiosInstance.get(TRANSPORT_API.list);
    return asRows(res.data);
  },

  async get(id: string): Promise<TransportRequestRow> {
    const res = await axiosInstance.get(TRANSPORT_API.byId(id));
    const value = unwrap(res.data);
    const row = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
    return { ...row, id: String(row.id ?? id) };
  },

  async assign(
    id: string,
    body: {
      trucker_id: string;
      vehicle_type?: string;
      vehicle_number?: string;
      driver_name?: string;
      driver_license?: string;
    },
  ) {
    const res = await axiosInstance.post(TRANSPORT_API.assign(id), body);
    return unwrap(res.data);
  },

  async stamp(id: string, action: 'pickup' | 'transit' | 'delivered', at?: string) {
    const path =
      action === 'pickup'
        ? TRANSPORT_API.confirmPickup(id)
        : action === 'transit'
          ? TRANSPORT_API.inTransit(id)
          : TRANSPORT_API.delivered(id);
    const res = await axiosInstance.post(path, at ? { at } : {});
    return unwrap(res.data);
  },

  async cancel(id: string) {
    const res = await axiosInstance.post(TRANSPORT_API.cancel(id), {});
    return unwrap(res.data);
  },

  async recordCost(
    id: string,
    body: { amount: number; charge_code_id?: string; currency_code?: string; description?: string },
  ) {
    const res = await axiosInstance.post(TRANSPORT_API.recordCost(id), body);
    return unwrap(res.data);
  },

  async queuePdf(id: string) {
    const res = await axiosInstance.post(TRANSPORT_API.pdf(id), {});
    return unwrap(res.data);
  },
};
