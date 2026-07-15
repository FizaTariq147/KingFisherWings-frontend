import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { paymentRequestService } from '../services/paymentRequest.service';
import type {
  CreatePaymentRequestDto,
  PaymentRequestListParams,
  RejectPaymentRequestDto,
  UpdatePaymentRequestDto,
} from '../types/paymentRequest.types';

export const paymentRequestKeys = {
  all: ['tenant', 'payment-requests'] as const,
  list: (params: PaymentRequestListParams) =>
    [...paymentRequestKeys.all, 'list', params] as const,
  detail: (id: string) => [...paymentRequestKeys.all, 'detail', id] as const,
};

export function usePaymentRequests(params: PaymentRequestListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: paymentRequestKeys.list(params),
    queryFn: () => paymentRequestService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePaymentRequest(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: paymentRequestKeys.detail(id),
    queryFn: () => paymentRequestService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidatePaymentRequests() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: paymentRequestKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: paymentRequestKeys.detail(detailId) });
    }
  };
}

export function useCreatePaymentRequest() {
  const invalidate = useInvalidatePaymentRequests();
  return useMutation({
    mutationFn: (dto: CreatePaymentRequestDto) => paymentRequestService.create(dto),
    onSuccess: (pr) => invalidate(pr.id),
  });
}

export function useUpdatePaymentRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePaymentRequestDto) => paymentRequestService.update(id, dto),
    onSuccess: (pr) => {
      queryClient.invalidateQueries({ queryKey: paymentRequestKeys.all });
      queryClient.setQueryData(paymentRequestKeys.detail(id), pr);
    },
  });
}

export function useDeletePaymentRequest() {
  const invalidate = useInvalidatePaymentRequests();
  return useMutation({
    mutationFn: (id: string) => paymentRequestService.remove(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useApprovePaymentRequest(id: string) {
  const invalidate = useInvalidatePaymentRequests();
  return useMutation({
    mutationFn: () => paymentRequestService.approve(id),
    onSuccess: () => invalidate(id),
  });
}

export function useRejectPaymentRequest(id: string) {
  const invalidate = useInvalidatePaymentRequests();
  return useMutation({
    mutationFn: (dto: RejectPaymentRequestDto) => paymentRequestService.reject(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useMarkPaidPaymentRequest(id: string) {
  const invalidate = useInvalidatePaymentRequests();
  return useMutation({
    mutationFn: () => paymentRequestService.markPaid(id),
    onSuccess: () => invalidate(id),
  });
}
