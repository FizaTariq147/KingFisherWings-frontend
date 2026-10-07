import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { glPaymentKeys } from '@/features/glPayments/hooks/useGlPayments';
import type { UploadPaymentProofDto } from '@/features/payment-proofs/types/paymentProof.types';
import { purchaseInvoiceService } from '../services/purchaseInvoice.service';
import type {
  CreatePurchaseInvoiceDto,
  PurchaseInvoiceListParams,
  UpdatePurchaseInvoiceDto,
} from '../types/purchaseInvoice.types';

export const purchaseInvoiceKeys = {
  all: ['tenant', 'purchase-invoices'] as const,
  list: (params: PurchaseInvoiceListParams) =>
    [...purchaseInvoiceKeys.all, 'list', params] as const,
  detail: (id: string) => [...purchaseInvoiceKeys.all, 'detail', id] as const,
  paymentProofs: (id: string) => [...purchaseInvoiceKeys.all, 'payment-proofs', id] as const,
};

export function usePurchaseInvoices(params: PurchaseInvoiceListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: purchaseInvoiceKeys.list(params),
    queryFn: () => purchaseInvoiceService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePurchaseInvoice(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: purchaseInvoiceKeys.detail(id),
    queryFn: () => purchaseInvoiceService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useInvalidatePurchaseInvoices() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.detail(detailId) });
    }
  };
}

export function useCreatePurchaseInvoice() {
  const invalidate = useInvalidatePurchaseInvoices();
  return useMutation({
    mutationFn: (dto: CreatePurchaseInvoiceDto) => purchaseInvoiceService.create(dto),
    onSuccess: (inv) => invalidate(inv.id),
  });
}

export function useUpdatePurchaseInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePurchaseInvoiceDto) => purchaseInvoiceService.update(id, dto),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.all });
      queryClient.setQueryData(purchaseInvoiceKeys.detail(id), inv);
    },
  });
}

export function useDeletePurchaseInvoice() {
  const invalidate = useInvalidatePurchaseInvoices();
  return useMutation({
    mutationFn: (id: string) => purchaseInvoiceService.remove(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function usePostPurchaseInvoice(id: string) {
  const invalidate = useInvalidatePurchaseInvoices();
  return useMutation({
    mutationFn: () => purchaseInvoiceService.post(id),
    onSuccess: () => invalidate(id),
  });
}

/** GET /purchase-invoices/{id}/payment-proofs */
export function usePurchaseInvoicePaymentProofs(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: purchaseInvoiceKeys.paymentProofs(id),
    queryFn: () => purchaseInvoiceService.listPaymentProofs(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** POST /purchase-invoices/{id}/payment-proofs */
export function useUploadPurchaseInvoicePaymentProof(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, dto }: { file: File; dto: UploadPaymentProofDto }) =>
      purchaseInvoiceService.uploadPaymentProof(id, file, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.paymentProofs(id) });
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.all });
      void queryClient.invalidateQueries({
        queryKey: ['tenant', 'payment-proofs', 'purchase-invoice', id],
      });
      void queryClient.invalidateQueries({ queryKey: glPaymentKeys.all });
    },
  });
}
