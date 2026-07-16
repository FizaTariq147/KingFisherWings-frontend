import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { GL_PAYMENT_API } from '../api/glPayment.api';
import {
  normalizeGlPayment,
  normalizeGlPayments,
  normalizePaymentAllocation,
} from '../utils/normalizeGlPayment';
import {
  prepareGlPaymentPayload,
  prepareGlPaymentUpdatePayload,
  preparePaymentAllocationPayload,
} from '../utils/prepareGlPaymentPayload';
import type {
  CreateGlPaymentDto,
  GlPayment,
  GlPaymentListParams,
  GlPaymentListResult,
  PaymentAllocation,
  PaymentAllocationInputDto,
  UpdateGlPaymentDto,
} from '../types/glPayment.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickArray(...candidates: unknown[]): unknown[] | null {
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return null;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const named = pickArray(
    envelope.items,
    envelope.results,
    envelope.payments,
    envelope.data,
    envelope.rows,
  );
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      pickArray(
        nested.items,
        nested.results,
        nested.payments,
        nested.rows,
        nested.data,
      ) ?? []
    );
  }
  return [];
}

function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope) return raw;
  if ('data' in envelope) {
    const data = envelope.data;
    const nested = asRecord(data);
    if (nested && (nested.id || nested.payment_id)) return data;
    if (nested?.payment) return nested.payment;
    return data;
  }
  if (envelope.payment) return envelope.payment;
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
    for (const key of ['id', 'payment_id', 'gl_payment_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.payment, rec.result]) {
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
  const raw =
    (Array.isArray(message) ? message.map(String).join('; ') : undefined) ||
    (typeof message === 'string' ? message : undefined) ||
    (typeof data?.error === 'string' ? data.error : undefined) ||
    axiosErr.message ||
    'Request failed';

  if (/no active number format/i.test(raw)) {
    return new Error(
      `${raw} Configure an active number format for payments/vouchers in Organization → Number Formats.`,
    );
  }
  if (/gl\.manage_payments/i.test(raw)) {
    return new Error(
      'Missing required permission: gl.manage_payments. Your login role cannot create or change GL payments. Ask a Tenant Admin to grant “Manage Payments” (gl.manage_payments) on your role, then sign out and sign back in.',
    );
  }
  if (/missing required permission/i.test(raw)) {
    return new Error(
      `${raw} Ask a Tenant Admin to update your role permissions, then sign out and sign back in.`,
    );
  }
  if (/only draft|must be draft/i.test(raw)) {
    return new Error(`${raw} Only draft payments can be edited or deleted.`);
  }
  if (/allocation|exceed|over-allocat/i.test(raw)) {
    return new Error(raw);
  }
  if (axiosErr.response?.status === 403) {
    return new Error(
      raw ||
        'Forbidden. Your role is missing a required GL permission (for example gl.manage_payments).',
    );
  }
  return new Error(raw);
}

function assertId(id: string, label = 'payment'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(params: GlPaymentListParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.direction) query.direction = params.direction;
  if (params.status) query.status = params.status;
  if (params.party_id && isUuid(params.party_id)) query.party_id = params.party_id;
  if (params.from_date?.trim()) query.from_date = params.from_date.trim();
  if (params.to_date?.trim()) query.to_date = params.to_date.trim();
  if (params.search?.trim()) query.search = params.search.trim();
  return query;
}

export const glPaymentService = {
  async list(params: GlPaymentListParams = {}): Promise<GlPaymentListResult> {
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(GL_PAYMENT_API.list, {
          params: buildListQuery(params),
        }),
      );
      return { payments: normalizeGlPayments(unwrapList(data)) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<GlPayment> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<unknown> | unknown>(GL_PAYMENT_API.byId(id)),
      );
      const payment = normalizeGlPayment(unwrapEntity(data));
      if (!payment) throw new Error('Payment not found.');
      return payment;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateGlPaymentDto): Promise<GlPayment> {
    const payload = prepareGlPaymentPayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(GL_PAYMENT_API.create, payload),
      );
      const created = normalizeGlPayment(unwrapEntity(data));
      if (created) return created;
      const id = extractId(data);
      if (id) return glPaymentService.getById(id);
      throw new Error('Create succeeded but payment could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateGlPaymentDto): Promise<GlPayment> {
    assertId(id);
    const payload = prepareGlPaymentUpdatePayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.patch<ApiEnvelope<unknown> | unknown>(GL_PAYMENT_API.byId(id), payload),
      );
      const updated = normalizeGlPayment(unwrapEntity(data));
      if (updated) return updated;
      return glPaymentService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async remove(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(GL_PAYMENT_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addAllocation(id: string, dto: PaymentAllocationInputDto): Promise<PaymentAllocation> {
    assertId(id);
    const payload = preparePaymentAllocationPayload({ ...dto } as Record<string, unknown>);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(
          GL_PAYMENT_API.allocations(id),
          payload,
        ),
      );
      const allocation = normalizePaymentAllocation(unwrapEntity(data));
      if (allocation) return allocation;
      throw new Error('Allocation created but could not be read.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async removeAllocation(id: string, allocationId: string): Promise<void> {
    assertId(id);
    assertId(allocationId, 'allocation');
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(GL_PAYMENT_API.allocationById(id, allocationId)),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async post(id: string): Promise<GlPayment> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(GL_PAYMENT_API.post(id)),
      );
      const posted = normalizeGlPayment(unwrapEntity(data));
      if (posted) return posted;
      return glPaymentService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async cancel(id: string): Promise<GlPayment> {
    assertId(id);
    try {
      const { data } = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<unknown> | unknown>(GL_PAYMENT_API.cancel(id)),
      );
      const cancelled = normalizeGlPayment(unwrapEntity(data));
      if (cancelled) return cancelled;
      return glPaymentService.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
