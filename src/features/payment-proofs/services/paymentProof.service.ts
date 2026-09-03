import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { PAYMENT_PROOF_API } from '../api/paymentProof.api';
import type { PaymentProof, ReviewPaymentProofDto } from '../types/paymentProof.types';
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

  async acknowledge(id: string, dto: ReviewPaymentProofDto = {}): Promise<PaymentProof> {
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(PAYMENT_PROOF_API.acknowledge(id), dto),
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
