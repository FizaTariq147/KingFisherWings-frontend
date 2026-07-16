import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { glPaymentService } from '../services/glPayment.service';
import type {
  CreateGlPaymentDto,
  GlPaymentListParams,
  PaymentAllocationInputDto,
  UpdateGlPaymentDto,
} from '../types/glPayment.types';

export const glPaymentKeys = {
  all: ['tenant', 'gl-payments'] as const,
  list: (params: GlPaymentListParams) => [...glPaymentKeys.all, 'list', params] as const,
  detail: (id: string) => [...glPaymentKeys.all, 'detail', id] as const,
};

export function useGlPayments(params: GlPaymentListParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: glPaymentKeys.list(params),
    queryFn: () => glPaymentService.list(params),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useGlPayment(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: glPaymentKeys.detail(id),
    queryFn: () => glPaymentService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidateGlPayments() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: glPaymentKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: glPaymentKeys.detail(detailId) });
    }
  };
}

export function useCreateGlPayment() {
  const invalidate = useInvalidateGlPayments();
  return useMutation({
    mutationFn: (dto: CreateGlPaymentDto) => glPaymentService.create(dto),
    onSuccess: (p) => invalidate(p.id),
  });
}

export function useUpdateGlPayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateGlPaymentDto) => glPaymentService.update(id, dto),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: glPaymentKeys.all });
      queryClient.setQueryData(glPaymentKeys.detail(id), p);
    },
  });
}

export function useDeleteGlPayment() {
  const invalidate = useInvalidateGlPayments();
  return useMutation({
    mutationFn: (id: string) => glPaymentService.remove(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useAddPaymentAllocation(id: string) {
  const invalidate = useInvalidateGlPayments();
  return useMutation({
    mutationFn: (dto: PaymentAllocationInputDto) => glPaymentService.addAllocation(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useRemovePaymentAllocation(id: string) {
  const invalidate = useInvalidateGlPayments();
  return useMutation({
    mutationFn: (allocationId: string) =>
      glPaymentService.removeAllocation(id, allocationId),
    onSuccess: () => invalidate(id),
  });
}

export function usePostGlPayment(id: string) {
  const invalidate = useInvalidateGlPayments();
  return useMutation({
    mutationFn: () => glPaymentService.post(id),
    onSuccess: () => invalidate(id),
  });
}

export function useCancelGlPayment(id: string) {
  const invalidate = useInvalidateGlPayments();
  return useMutation({
    mutationFn: () => glPaymentService.cancel(id),
    onSuccess: () => invalidate(id),
  });
}
