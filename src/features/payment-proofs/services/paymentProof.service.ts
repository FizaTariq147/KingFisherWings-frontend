import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { PAYMENT_PROOF_API } from '../api/paymentProof.api';
import type {
  ApprovePaymentProofDto,
  PaymentProof,
  ReviewPaymentProofDto,
  UploadPaymentProofDto,
} from '../types/paymentProof.types';
import { normalizePaymentProof, normalizePaymentProofList } from '../utils/normalizePaymentProof';

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
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(PAYMENT_PROOF_API.acknowledge(id), dto),
    );
    const proof = normalizePaymentProof(unwrapEntity(res.data));
    if (!proof) throw new Error('Payment proof not found.');
    return proof;
  },

  /**
   * Approve proof and post a GL receipt/payment allocated to the invoice
   * (updates invoice paid_amount / outstanding_balance).
   */
  async approve(id: string, dto: ApprovePaymentProofDto = {}): Promise<PaymentProof> {
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
  },

  async reject(id: string, dto: ReviewPaymentProofDto = {}): Promise<PaymentProof> {
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(PAYMENT_PROOF_API.reject(id), dto),
    );
    const proof = normalizePaymentProof(unwrapEntity(res.data));
    if (!proof) throw new Error('Payment proof not found.');
    return proof;
  },
};
