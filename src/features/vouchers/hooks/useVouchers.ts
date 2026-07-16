import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { voucherService } from '../services/voucher.service';
import type {
  CreateVoucherDto,
  CreateVoucherLineDto,
  UpdateVoucherDto,
  UpdateVoucherLineDto,
  VoucherListParams,
} from '../types/voucher.types';

export const voucherKeys = {
  all: ['tenant', 'gl-vouchers'] as const,
  list: (params: VoucherListParams) => [...voucherKeys.all, 'list', params] as const,
  detail: (id: string) => [...voucherKeys.all, 'detail', id] as const,
};

export function useVouchers(params: VoucherListParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: voucherKeys.list(params),
    queryFn: () => voucherService.list(params),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useVoucher(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: voucherKeys.detail(id),
    queryFn: () => voucherService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidateVouchers() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(detailId) });
    }
  };
}

export function useCreateVoucher() {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: (dto: CreateVoucherDto) => voucherService.create(dto),
    onSuccess: (v) => invalidate(v.id),
  });
}

export function useUpdateVoucher(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateVoucherDto) => voucherService.update(id, dto),
    onSuccess: (v) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
      queryClient.setQueryData(voucherKeys.detail(id), v);
    },
  });
}

export function useDeleteVoucher() {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: (id: string) => voucherService.remove(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useAddVoucherLine(id: string) {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: (dto: CreateVoucherLineDto) => voucherService.addLine(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useUpdateVoucherLine(id: string) {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: ({
      lineId,
      dto,
    }: {
      lineId: string;
      dto: UpdateVoucherLineDto;
    }) => voucherService.updateLine(id, lineId, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useRemoveVoucherLine(id: string) {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: (lineId: string) => voucherService.removeLine(id, lineId),
    onSuccess: () => invalidate(id),
  });
}

export function usePostVoucher(id: string) {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: () => voucherService.post(id),
    onSuccess: () => invalidate(id),
  });
}

export function useReverseVoucher(id: string) {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: () => voucherService.reverse(id),
    onSuccess: (v) => {
      invalidate(id);
      invalidate(v.id);
    },
  });
}
