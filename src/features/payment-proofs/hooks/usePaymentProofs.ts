import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { invoiceKeys } from '@/features/invoices/hooks/useInvoices';
import { paymentProofService } from '../services/paymentProof.service';
import type { ReviewPaymentProofDto } from '../types/paymentProof.types';

export const paymentProofKeys = {
  all: ['tenant', 'payment-proofs'] as const,
  invoice: (invoiceId: string) => [...paymentProofKeys.all, 'invoice', invoiceId] as const,
};

export function useInvoicePaymentProofs(invoiceId: string, enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: paymentProofKeys.invoice(invoiceId),
    queryFn: () => paymentProofService.listForInvoice(invoiceId),
    enabled: Boolean(token) && isUuid(invoiceId) && enabled,
  });
}

export function useReviewPaymentProof(invoiceId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: paymentProofKeys.invoice(invoiceId) });
    void qc.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
  };
  return {
    acknowledge: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto?: ReviewPaymentProofDto }) =>
        paymentProofService.acknowledge(id, dto),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto?: ReviewPaymentProofDto }) =>
        paymentProofService.reject(id, dto),
      onSuccess: invalidate,
    }),
  };
}
