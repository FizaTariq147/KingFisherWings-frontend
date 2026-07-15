import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { PAYMENT_REQUEST_API } from '../api/paymentRequest.api';
import {
  normalizePaymentRequest,
  normalizePaymentRequests,
} from '../utils/normalizePaymentRequest';
import {
  preparePaymentRequestPayload,
  prepareRejectPayload,
} from '../utils/preparePaymentRequestPayload';
import type {
  CreatePaymentRequestDto,
  PaginationMeta,
  PaymentRequest,
  PaymentRequestListParams,
  PaymentRequestListResult,
  RejectPaymentRequestDto,
  UpdatePaymentRequestDto,
} from '../types/paymentRequest.types';

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
      (Array.isArray(nested.payment_requests) && nested.payment_requests) ||
      (Array.isArray(nested.paymentRequests) && nested.paymentRequests) ||
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
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
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
  if (!id || !isUuid(id)) throw new Error('Invalid payment request id.');
}

function buildListQuery(params: PaymentRequestListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.status?.trim()) query.status = params.status.trim();
  for (const key of ['party_id', 'job_id'] as const) {
    const val = params[key];
    if (typeof val === 'string' && isUuid(val)) query[key] = val;
  }
  return query;
}

async function postAction(url: string, body?: unknown): Promise<PaymentRequest> {
  const res = await withGatewayRetry(() =>
    axiosInstance.post<unknown>(url, body ?? undefined),
  );
  const pr = normalizePaymentRequest(unwrapEntity(res.data));
  if (!pr) throw new Error('Action succeeded but no payment request was returned.');
  return pr;
}

export const paymentRequestService = {
  async list(params: PaymentRequestListParams = {}): Promise<PaymentRequestListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(PAYMENT_REQUEST_API.list, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const paymentRequests = normalizePaymentRequests(items);
      return {
        paymentRequests,
        meta: normalizeMeta(meta, paymentRequests.length, params),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<PaymentRequest> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<PaymentRequest> | PaymentRequest>(
          PAYMENT_REQUEST_API.byId(id),
        ),
      );
      const pr = normalizePaymentRequest(unwrapEntity(res.data));
      if (!pr) throw new Error('Payment request not found.');
      return pr;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreatePaymentRequestDto): Promise<PaymentRequest> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          PAYMENT_REQUEST_API.create,
          preparePaymentRequestPayload(dto as Record<string, unknown>),
        ),
      );
      const pr = normalizePaymentRequest(unwrapEntity(res.data));
      if (!pr) throw new Error('Create succeeded but no payment request was returned.');
      return pr;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdatePaymentRequestDto): Promise<PaymentRequest> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          PAYMENT_REQUEST_API.byId(id),
          preparePaymentRequestPayload(dto as Record<string, unknown>),
        ),
      );
      const pr = normalizePaymentRequest(unwrapEntity(res.data));
      if (!pr) throw new Error('Update succeeded but no payment request was returned.');
      return pr;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async remove(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(PAYMENT_REQUEST_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async approve(id: string): Promise<PaymentRequest> {
    assertId(id);
    try {
      return await postAction(PAYMENT_REQUEST_API.approve(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reject(id: string, dto: RejectPaymentRequestDto): Promise<PaymentRequest> {
    assertId(id);
    try {
      return await postAction(
        PAYMENT_REQUEST_API.reject(id),
        prepareRejectPayload(dto as Record<string, unknown>),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async markPaid(id: string): Promise<PaymentRequest> {
    assertId(id);
    try {
      return await postAction(PAYMENT_REQUEST_API.markPaid(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
