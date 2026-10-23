import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PAYMENT_PROOF_API } from '../api/paymentProof.api';
import type {
  ApprovePaymentProofDto,
  PaymentProof,
  ReviewPaymentProofDto,
  UploadPaymentProofDto,
} from '../types/paymentProof.types';
import { formatPaymentProofActionError } from '../utils/formatPaymentProofActionError';
import { normalizePaymentProof, normalizePaymentProofList } from '../utils/normalizePaymentProof';

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
