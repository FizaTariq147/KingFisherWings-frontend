import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PAYMENT_PROOF_API } from '../api/paymentProof.api';
import type {
  ApprovePaymentProofDto,
  MarkInvoicePaidDto,
  MarkPaidNeedsInvoiceError,
  PaymentProof,
  ReviewPaymentProofDto,
  UploadPaymentProofDto,
} from '../types/paymentProof.types';
import { formatPaymentProofActionError } from '../utils/formatPaymentProofActionError';
import { normalizePaymentProof, normalizePaymentProofList } from '../utils/normalizePaymentProof';
import {
  assertPaymentProofUploadFields,
  buildPaymentProofUploadFields,
  formatAmountClaimed,
  postPaymentProofMultipart,
} from '../utils/uploadPaymentProofMultipart';

function rethrowProofError(error: unknown, fallback: string): never {
  throw new Error(formatPaymentProofActionError(error, fallback));
}

function unwrapEntity(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: unknown }).data;
  }
  return raw;
}

export const paymentProofService = {
  async listForInvoice(invoiceId: string): Promise<PaymentProof[]> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(PAYMENT_PROOF_API.staffInvoiceProofs(invoiceId)),
    );
    return normalizePaymentProofList(res.data);
  },

  /**
   * POST /invoices/:id/mark-paid — proof file required.
   * Creates PaymentProof and posts RECEIPT. Without file the invoice stays unpaid.
   * Pending costing with no invoice may return `needs_invoice`.
   */
  async markPaid(
    invoiceId: string,
    file: File,
    dto: MarkInvoicePaidDto = {},
  ): Promise<PaymentProof> {
    if (!invoiceId?.trim()) throw new Error('Invoice id is required.');
    if (!(file instanceof File) || file.size <= 0) {
      throw new Error('A payment proof file is required to mark paid.');
    }
    const fields: Record<string, string | undefined> = {
      ...buildPaymentProofUploadFields(
        {
          amount: dto.amount,
          payment_date: dto.payment_date,
          reference: dto.reference,
          notes: dto.notes,
        },
        'extended',
      ),
    };
    if (dto.amount != null && Number.isFinite(dto.amount) && !fields.amount_claimed) {
      fields.amount_claimed = formatAmountClaimed(dto.amount);
    }
    if (dto.payment_method?.trim()) fields.payment_method = dto.payment_method.trim();
    if (dto.bank_account_id?.trim()) fields.bank_account_id = dto.bank_account_id.trim();
    // amount_claimed + payment_date recommended but OpenAPI only requires file
    if (fields.amount_claimed && fields.payment_date) {
      assertPaymentProofUploadFields(fields);
    }
    try {
      const data = await withGatewayRetry(() =>
        postPaymentProofMultipart(
          axiosInstance,
          PAYMENT_PROOF_API.markPaid(invoiceId),
          file,
          fields,
        ),
      );
      const root =
        data && typeof data === 'object' && 'data' in (data as object)
          ? (data as { data: unknown }).data
          : data;
      const rec = root && typeof root === 'object' ? (root as Record<string, unknown>) : null;
      const code = String(rec?.code ?? rec?.error_code ?? '').toLowerCase();
      if (code === 'needs_invoice' || rec?.needs_invoice === true) {
        const err: MarkPaidNeedsInvoiceError & Error = Object.assign(
          new Error(
            String(rec?.message ?? 'Generate a sale invoice from costing before marking paid.'),
          ),
          {
            code: 'needs_invoice' as const,
            message: String(
              rec?.message ?? 'Generate a sale invoice from costing before marking paid.',
            ),
            job_id: typeof rec?.job_id === 'string' ? rec.job_id : undefined,
          },
        );
        throw err;
      }
      const proof = normalizePaymentProof(root) ?? normalizePaymentProof(rec?.proof ?? rec?.payment_proof);
      if (!proof && rec) {
        // Success may return receipt / payment envelope without a nested proof shape.
        return {
          id: String(rec.id ?? rec.proof_id ?? invoiceId),
          invoiceId,
          status: 'APPROVED',
          amount: dto.amount,
          paymentDate: dto.payment_date,
          raw: rec,
        };
      }
      if (!proof) throw new Error('Mark paid succeeded but response was unexpected.');
      return proof;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'needs_invoice'
      ) {
        throw error;
      }
      rethrowProofError(error, 'Could not mark invoice paid.');
    }
  },

  async listForPurchaseInvoice(invoiceId: string): Promise<PaymentProof[]> {
    const { purchaseInvoiceService } = await import(
      '@/features/purchaseInvoices/services/purchaseInvoice.service'
    );
    return purchaseInvoiceService.listPaymentProofs(invoiceId);
  },

  async uploadForPurchaseInvoice(
    invoiceId: string,
    file: File,
    dto: UploadPaymentProofDto,
  ): Promise<PaymentProof> {
    const { purchaseInvoiceService } = await import(
      '@/features/purchaseInvoices/services/purchaseInvoice.service'
    );
    return purchaseInvoiceService.uploadPaymentProof(invoiceId, file, dto);
  },

  async acknowledge(id: string, dto: ReviewPaymentProofDto = {}): Promise<PaymentProof> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(PAYMENT_PROOF_API.acknowledge(id), dto),
      );
      const proof = normalizePaymentProof(unwrapEntity(res.data));
      if (!proof) throw new Error('Payment proof not found.');
      return proof;
    } catch (error) {
      rethrowProofError(error, 'Could not acknowledge payment proof.');
    }
  },

  /**
   * Approve proof and post a GL receipt/payment allocated to the invoice
   * (updates invoice paid_amount / outstanding_balance).
   */
  async approve(id: string, dto: ApprovePaymentProofDto = {}): Promise<PaymentProof> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(PAYMENT_PROOF_API.approve(id), {
          payment_method: dto.payment_method ?? 'BANK_TRANSFER',
          ...(dto.review_notes?.trim() ? { review_notes: dto.review_notes.trim() } : {}),
          ...(dto.bank_account_id?.trim() ? { bank_account_id: dto.bank_account_id.trim() } : {}),
        }),
      );
      const proof = normalizePaymentProof(unwrapEntity(res.data));
      if (!proof) throw new Error('Payment proof not found.');
      return proof;
    } catch (error) {
      rethrowProofError(
        error,
        'Could not approve payment proof (GL payment posting may have failed).',
      );
    }
  },

  async reject(id: string, dto: ReviewPaymentProofDto = {}): Promise<PaymentProof> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(PAYMENT_PROOF_API.reject(id), dto),
      );
      const proof = normalizePaymentProof(unwrapEntity(res.data));
      if (!proof) throw new Error('Payment proof not found.');
      return proof;
    } catch (error) {
      rethrowProofError(error, 'Could not reject payment proof.');
    }
  },

  async withdraw(id: string): Promise<void> {
    try {
      await withGatewayRetry(() => axiosInstance.delete(PAYMENT_PROOF_API.byId(id)));
    } catch (error) {
      rethrowProofError(error, 'Could not withdraw payment proof.');
    }
  },

  async downloadFile(id: string, fallbackName = 'payment-proof'): Promise<void> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(PAYMENT_PROOF_API.file(id), { responseType: 'blob' }),
      );
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const cd = res.headers['content-disposition'];
      let fileName = fallbackName;
      if (typeof cd === 'string') {
        const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(cd);
        if (match?.[1]) fileName = decodeURIComponent(match[1].replace(/"/g, ''));
      }
      triggerBlobDownload(blob, fileName);
    } catch (error) {
      rethrowProofError(error, 'Could not download payment proof file.');
    }
  },
};
