import { axiosInstance } from '@/lib/axios';
import {
  TRANSPORT_API,
  type TransportRequestListParams,
} from '../api/transport.api';

export type TransportRequestRow = Record<string, unknown> & {
  id: string;
  job_id?: string;
  job_number?: string;
  status?: string;
  request_type?: string;
  reference?: string;
  request_number?: string;
  trucker_id?: string;
  trucker_name?: string;
};

function pickStr(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value == null) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return undefined;
}

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
      : value &&
          typeof value === 'object' &&
          Array.isArray((value as { rows?: unknown }).rows)
        ? (value as { rows: unknown[] }).rows
        : [];
  return list
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    .map((row) => {
      const job =
        row.job && typeof row.job === 'object' && !Array.isArray(row.job)
          ? (row.job as Record<string, unknown>)
          : null;
      const trucker =
        row.trucker && typeof row.trucker === 'object' && !Array.isArray(row.trucker)
          ? (row.trucker as Record<string, unknown>)
          : null;
      const requestNumber = pickStr(
        row.request_number,
        row.requestNumber,
        row.number,
        row.reference,
        row.reference_number,
        row.referenceNumber,
      );
      return {
        ...row,
        id: String(row.id ?? ''),
        job_id: pickStr(row.job_id, row.jobId, job?.id),
        job_number: pickStr(
          row.job_number,
          row.jobNumber,
          job?.job_number,
          job?.jobNumber,
          job?.number,
        ),
        status: pickStr(row.status),
        request_type: pickStr(row.request_type, row.requestType, row.type),
        reference: pickStr(row.reference, requestNumber),
        request_number: requestNumber,
        trucker_id: pickStr(row.trucker_id, row.truckerId, trucker?.id),
        trucker_name: pickStr(
          row.trucker_name,
          row.truckerName,
          trucker?.name,
          trucker?.display_name,
          trucker?.displayName,
        ),
      };
    })
    .filter((row) => row.id);
}

export const transportService = {
  async list(params: TransportRequestListParams = {}): Promise<TransportRequestRow[]> {
    const query: Record<string, string | number> = {};
    if (params.page != null) query.page = params.page;
    if (params.limit != null) query.limit = params.limit;
    if (params.status?.trim()) query.status = params.status.trim();
    if (params.trucker_id?.trim()) query.trucker_id = params.trucker_id.trim();
    if (params.job_id?.trim()) query.job_id = params.job_id.trim();
    if (params.from_date?.trim()) query.from_date = params.from_date.trim();
    if (params.to_date?.trim()) query.to_date = params.to_date.trim();
    const res = await axiosInstance.get(TRANSPORT_API.list, { params: query });
    return asRows(res.data);
  },

  async get(id: string): Promise<TransportRequestRow> {
    const res = await axiosInstance.get(TRANSPORT_API.byId(id));
    const value = unwrap(res.data);
    const row = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
    const rows = asRows([row]);
    return rows[0] ?? { ...row, id: String(row.id ?? id) };
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
