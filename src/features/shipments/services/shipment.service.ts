import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { SHIPMENT_API } from '../api/shipment.api';
import type {
  ChangeShipmentBlStatusDto,
  ChangeShipmentDepartmentDto,
  ChangeShipmentStatusDto,
  CreateShipmentDto,
  MergeShipmentsDto,
  PaginationMeta,
  Shipment,
  ShipmentListParams,
  ShipmentListResult,
  SplitShipmentDto,
  UpdateShipmentDto,
} from '../types/shipment.types';
import {
  normalizeShipment,
  normalizeShipments,
  unwrapShipmentPayload,
} from '../utils/normalizeShipment';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: { page?: number; limit?: number },
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
      (Array.isArray(nested.shipments) && nested.shipments) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  return { items: [] };
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Request failed');
}

function assertId(id: string) {
  if (!isUuid(id)) throw new Error('Invalid shipment id.');
}

function extractJobId(raw: unknown): string | undefined {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return undefined;
  const nested = asRecord(data.job);
  for (const value of [data.job_id, data.jobId, nested?.id, root?.job_id, root?.jobId]) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  return undefined;
}

function extractShipmentId(raw: unknown): string | undefined {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return undefined;
  const nested = asRecord(data.shipment);
  for (const value of [
    data.id,
    data.shipment_id,
    data.shipmentId,
    nested?.id,
    root?.shipment_id,
  ]) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  return undefined;
}

function buildListQuery(params: ShipmentListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status) query.status = params.status;
  if (params.job_type) query.job_type = params.job_type;
  if (params.party_id && isUuid(params.party_id)) query.party_id = params.party_id;
  if (params.quotation_id && isUuid(params.quotation_id)) {
    query.quotation_id = params.quotation_id;
  }
  return query;
}

async function postAndNormalize(
  url: string,
  body?: unknown,
): Promise<Shipment> {
  const res = await withGatewayRetry(() =>
    body === undefined
      ? axiosInstance.post(url)
      : axiosInstance.post(url, body),
  );
  const item = normalizeShipment(unwrapShipmentPayload(res.data));
  if (item) return item;
  throw new Error('Unexpected response from shipment API.');
}

export const shipmentService = {
  async list(params: ShipmentListParams = {}): Promise<ShipmentListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.list, { params: buildListQuery(params) }),
      );
      const raw = unwrapList(res.data);
      const shipments = normalizeShipments(raw.items);
      return { shipments, meta: normalizeMeta(raw.meta, shipments.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.byId(id)));
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (!item) throw new Error('Shipment not found.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /shipments/:id/detail — Fresa header, tabs, actions, links. */
  async getDetail(id: string): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.detail(id)));
      const item = normalizeShipment(unwrapShipmentPayload(res.data) ?? res.data);
      if (item) return item;
      // Fallback to basic get if detail shape is unexpected.
      return this.getById(id);
    } catch (error) {
      const err = formatAxiosError(error);
      // Older tenants may only expose GET /shipments/:id
      if (/404|not found/i.test(err.message)) {
        return this.getById(id);
      }
      throw err;
    }
  },

  /** GET /shipments/:id/detail/:tab — lazy tab payload. */
  async getDetailTab(id: string, tab: string): Promise<Record<string, unknown>> {
    assertId(id);
    const key = tab.trim();
    if (!key) throw new Error('Tab key is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.detailTab(id, key)),
      );
      const payload = unwrapShipmentPayload(res.data);
      return asRecord(payload) ?? asRecord(res.data) ?? { raw: payload ?? res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateShipmentDto): Promise<Shipment> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.post(SHIPMENT_API.create, dto));
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (!item) throw new Error('Shipment was created but not returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateShipmentDto): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(SHIPMENT_API.byId(id), dto),
      );
      return normalizeShipment(unwrapShipmentPayload(res.data)) ?? this.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async changeStatus(id: string, dto: ChangeShipmentStatusDto): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.changeStatus(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async changeBlStatus(id: string, dto: ChangeShipmentBlStatusDto): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.changeBlStatus(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async changeDepartment(
    id: string,
    dto: ChangeShipmentDepartmentDto,
  ): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(SHIPMENT_API.changeDepartment(id), dto),
      );
      return (
        normalizeShipment(unwrapShipmentPayload(res.data)) ?? (await this.getDetail(id))
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateJob(id: string): Promise<Shipment & { job_id?: string }> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.generateJob(id)),
      );
      const jobId = extractJobId(res.data) ?? extractJobId(unwrapShipmentPayload(res.data));
      const shipment =
        normalizeShipment(unwrapShipmentPayload(res.data)) ?? (await this.getDetail(id));
      return { ...shipment, ...(jobId ? { job_id: jobId } : {}) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async copy(id: string): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.post(SHIPMENT_API.copy(id)));
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (!item) throw new Error('Shipment was copied but not returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async split(id: string, dto: SplitShipmentDto = {}): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.split(id), dto),
      );
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (item) return item;
      const newId = extractShipmentId(res.data);
      if (newId) return this.getDetail(newId);
      throw new Error('Split completed but new shipment was not returned.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async merge(id: string, dto: MergeShipmentsDto): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.merge(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async switchBl(id: string, body: Record<string, unknown> = {}): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.switchBl(id), body);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createSubmaster(id: string): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.createSubmaster(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async edi(id: string, action: string, body: Record<string, unknown> = {}): Promise<unknown> {
    assertId(id);
    if (!action.trim()) throw new Error('EDI action is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.edi(id, action.trim()), body),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async kpi(id: string): Promise<Record<string, unknown>> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.kpi(id)));
      return asRecord(unwrapShipmentPayload(res.data)) ?? asRecord(res.data) ?? {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async tracking(id: string): Promise<Record<string, unknown>> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.tracking(id)));
      return asRecord(unwrapShipmentPayload(res.data)) ?? asRecord(res.data) ?? {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async routingLegs(id: string): Promise<unknown[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.routingLegs(id)),
      );
      const payload = unwrapShipmentPayload(res.data);
      if (Array.isArray(payload)) return payload;
      const rec = asRecord(payload);
      if (Array.isArray(rec?.items)) return rec.items;
      if (Array.isArray(rec?.legs)) return rec.legs;
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getCharges(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.getCharges(id)),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listBillsOfLading(id: string): Promise<unknown[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.billsOfLading(id)),
      );
      const payload = unwrapShipmentPayload(res.data);
      if (Array.isArray(payload)) return payload;
      const rec = asRecord(payload);
      if (Array.isArray(rec?.items)) return rec.items;
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getAwb(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.awb(id)));
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
