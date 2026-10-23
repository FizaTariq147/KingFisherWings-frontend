import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import type {
  PaymentProof,
  UploadPaymentProofDto,
} from '@/features/payment-proofs/types/paymentProof.types';
import {
  normalizePaymentProof,
  normalizePaymentProofList,
} from '@/features/payment-proofs/utils/normalizePaymentProof';
import {
  assertPaymentProofUploadFields,
  buildPaymentProofUploadFields,
  formatPaymentProofUploadError,
  postPaymentProofMultipart,
  postPaymentProofMultipartFetch,
} from '@/features/payment-proofs/utils/uploadPaymentProofMultipart';
import { ensureErpAccessToken } from '@/lib/ensureErpAccessToken';
import { useAuthStore } from '@/store/authStore';
import { PURCHASE_INVOICE_API } from '../api/purchaseInvoice.api';
import {
  normalizePurchaseInvoice,
  normalizePurchaseInvoices,
} from '../utils/normalizePurchaseInvoice';
import { preparePurchaseInvoicePayload } from '../utils/preparePurchaseInvoicePayload';
import type {
  CreatePurchaseInvoiceDto,
  PaginationMeta,
  PurchaseInvoice,
  PurchaseInvoiceListParams,
  PurchaseInvoiceListResult,
  UpdatePurchaseInvoiceDto,
} from '../types/purchaseInvoice.types';

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
      (Array.isArray(nested.purchase_invoices) && nested.purchase_invoices) ||
      (Array.isArray(nested.purchaseInvoices) && nested.purchaseInvoices) ||
      (Array.isArray(nested.invoices) && nested.invoices) ||
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

function assertId(id: string, label = 'purchase invoice'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function buildListQuery(params: PurchaseInvoiceListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  for (const key of ['search', 'status', 'invoice_type', 'from_date', 'to_date'] as const) {
    const val = params[key];
    if (typeof val === 'string' && val.trim()) query[key] = val.trim();
  }
  for (const key of ['party_id', 'job_id'] as const) {
    const val = params[key];
    if (typeof val === 'string' && isUuid(val)) query[key] = val;
  }
  return query;
}

export const purchaseInvoiceService = {
  async list(params: PurchaseInvoiceListParams = {}): Promise<PurchaseInvoiceListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(PURCHASE_INVOICE_API.list, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const purchaseInvoices = normalizePurchaseInvoices(items);
      return {
        purchaseInvoices,
        meta: normalizeMeta(meta, purchaseInvoices.length, params),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<PurchaseInvoice> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<PurchaseInvoice> | PurchaseInvoice>(
          PURCHASE_INVOICE_API.byId(id),
        ),
      );
      const invoice = normalizePurchaseInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('Purchase invoice not found.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          PURCHASE_INVOICE_API.create,
          preparePurchaseInvoicePayload(dto as Record<string, unknown>),
        ),
      );
      const invoice = normalizePurchaseInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('Create succeeded but no purchase invoice was returned.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /purchase-invoices/from-job/:jobId */
  async createFromJob(jobId: string): Promise<PurchaseInvoice> {
    assertId(jobId);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(PURCHASE_INVOICE_API.fromJob(jobId)),
      );
      const invoice = normalizePurchaseInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('from-job succeeded but no purchase invoice was returned.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          PURCHASE_INVOICE_API.byId(id),
          preparePurchaseInvoicePayload(dto as Record<string, unknown>),
        ),
      );
      const invoice = normalizePurchaseInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('Update succeeded but no purchase invoice was returned.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async remove(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(PURCHASE_INVOICE_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async post(id: string): Promise<PurchaseInvoice> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(PURCHASE_INVOICE_API.post(id)),
      );
      const invoice = normalizePurchaseInvoice(unwrapEntity(res.data));
      if (!invoice) throw new Error('Post succeeded but no purchase invoice was returned.');
      return invoice;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /purchase-invoices/{id}/payment-proofs */
  async listPaymentProofs(id: string): Promise<PaymentProof[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(PURCHASE_INVOICE_API.paymentProofs(id)),
      );
      return normalizePaymentProofList(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * POST /purchase-invoices/{id}/payment-proofs
   * Multipart: file + amount_claimed + payment_date (+ optional reference_number, notes).
   * OpenAPI required[] — amount_claimed string "100.00", payment_date YYYY-MM-DD.
   * Prefer browser fetch (reliable multipart boundary), then axios fallback.
   */
  async uploadPaymentProof(
    id: string,
    file: File,
    dto: UploadPaymentProofDto,
  ): Promise<PaymentProof> {
    assertId(id);
    if (!(file instanceof File) || file.size <= 0) {
      throw new Error('Choose a payment proof file (PDF/JPEG/PNG/WebP).');
    }
    if (dto.amount == null || !Number.isFinite(dto.amount) || dto.amount <= 0) {
      throw new Error('Enter the paid amount for this proof.');
    }
    const paymentDate = (dto.payment_date?.trim() || '').slice(0, 10);
    if (!paymentDate || !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      throw new Error('Payment date is required (YYYY-MM-DD).');
    }

    // Required fields only first — optional reference/notes can trip older DTOs.
    const coreFields = buildPaymentProofUploadFields(
      { amount: dto.amount, payment_date: paymentDate },
      'portal',
    );
    assertPaymentProofUploadFields(coreFields);
    const extendedFields = buildPaymentProofUploadFields(
      {
        amount: dto.amount,
        payment_date: paymentDate,
        ...(dto.reference?.trim() ? { reference: dto.reference.trim() } : {}),
        ...(dto.notes?.trim() ? { notes: dto.notes.trim() } : {}),
      },
      'extended',
    );

    const path = PURCHASE_INVOICE_API.paymentProofs(id);
    const normalizeUploaded = (data: unknown): PaymentProof => {
      const proof = normalizePaymentProof(unwrapEntity(data));
      if (!proof) throw new Error('Upload succeeded but no payment proof was returned.');
      return proof;
    };

    const fieldAttempts: Array<Record<string, string | undefined>> = [
      coreFields,
      ...(dto.reference?.trim() || dto.notes?.trim() ? [extendedFields] : []),
      {
        amount_claimed: String(Math.round(dto.amount * 100) / 100),
        payment_date: paymentDate,
      },
    ];

    const token =
      (await ensureErpAccessToken()) ?? useAuthStore.getState().accessToken;
    if (!token) {
      throw new Error(
        'Your session expired. Sign in again, then retry the payment proof upload.',
      );
    }

    let lastError: unknown;
    for (const fields of fieldAttempts) {
      try {
        const data = await postPaymentProofMultipartFetch({
          path,
          file,
          fields,
          accessToken: token,
          credentials: 'include',
          failureFallback:
            'Could not save payment proof. Verify amount_claimed and payment_date.',
        });
        return normalizeUploaded(data);
      } catch (fetchError) {
        lastError = fetchError;
        const msg =
          fetchError instanceof Error ? fetchError.message : String(fetchError);
        if (/unexpected field|401|403|session expired/i.test(msg)) {
          throw formatPaymentProofUploadError(fetchError);
        }
      }

      try {
        const data = await withGatewayRetry(() =>
          postPaymentProofMultipart(axiosInstance, path, file, fields),
        );
        return normalizeUploaded(data);
      } catch (axiosError) {
        lastError = axiosError;
        const msg =
          axiosError instanceof Error ? axiosError.message : String(axiosError);
        if (/unexpected field|401|403/i.test(msg)) {
          throw formatPaymentProofUploadError(axiosError);
        }
      }
    }

    throw formatPaymentProofUploadError(lastError);
  },
};
