import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { awbStockService } from '../services/awbStock.service';
import type {
  AllocateAwbDto,
  AwbAllocationListParams,
  AwbStockBatchListParams,
  CreateAwbStockBatchDto,
  TransferAwbBatchDto,
  UpdateAwbStockBatchDto,
  VoidAwbAllocationDto,
} from '../types/awbStock.types';

export const awbStockKeys = {
  all: ['tenant', 'awb-stock'] as const,
  batches: (params: AwbStockBatchListParams) =>
    [...awbStockKeys.all, 'batches', params] as const,
  batch: (id: string) => [...awbStockKeys.all, 'batch', id] as const,
  allocations: (params: AwbAllocationListParams) =>
    [...awbStockKeys.all, 'allocations', params] as const,
  lowStock: () => [...awbStockKeys.all, 'low-stock'] as const,
};

export function useInvalidateAwbStock() {
  const queryClient = useQueryClient();
  return (batchId?: string) => {
    queryClient.invalidateQueries({ queryKey: awbStockKeys.all });
    if (batchId) {
      queryClient.invalidateQueries({ queryKey: awbStockKeys.batch(batchId) });
    }
  };
}

export function useAwbStockBatches(params: AwbStockBatchListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: awbStockKeys.batches(params),
    queryFn: () => awbStockService.listBatches(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAwbStockBatch(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: awbStockKeys.batch(id),
    queryFn: () => awbStockService.getBatch(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useAwbAllocations(
  params: AwbAllocationListParams = {},
  options?: { enabled?: boolean },
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: awbStockKeys.allocations(params),
    queryFn: () => awbStockService.listAllocations(params),
    enabled: Boolean(accessToken) && options?.enabled !== false,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAwbLowStockReport(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: awbStockKeys.lowStock(),
    queryFn: () => awbStockService.getLowStockReport(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 60_000,
  });
}

export function useCreateAwbStockBatch() {
  const invalidate = useInvalidateAwbStock();
  return useMutation({
    mutationFn: (dto: CreateAwbStockBatchDto) => awbStockService.createBatch(dto),
    onSuccess: (item) => invalidate(item.id),
  });
}

export function useUpdateAwbStockBatch(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAwbStockBatchDto) => awbStockService.updateBatch(id, dto),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: awbStockKeys.all });
      queryClient.setQueryData(awbStockKeys.batch(id), item);
    },
  });
}

export function useDeleteAwbStockBatch() {
  const invalidate = useInvalidateAwbStock();
  return useMutation({
    mutationFn: (id: string) => awbStockService.deleteBatch(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useAllocateAwb(batchId: string) {
  const invalidate = useInvalidateAwbStock();
  return useMutation({
    mutationFn: (dto: AllocateAwbDto) => awbStockService.allocate(batchId, dto),
    onSuccess: () => invalidate(batchId),
  });
}

export function useTransferAwbBatch(batchId: string) {
  const invalidate = useInvalidateAwbStock();
  return useMutation({
    mutationFn: (dto: TransferAwbBatchDto) =>
      awbStockService.transferBranch(batchId, dto),
    onSuccess: () => invalidate(batchId),
  });
}

export function useMarkAwbUsed() {
  const invalidate = useInvalidateAwbStock();
  return useMutation({
    mutationFn: (id: string) => awbStockService.markAllocationUsed(id),
    onSuccess: () => invalidate(),
  });
}

export function useVoidAwbAllocation() {
  const invalidate = useInvalidateAwbStock();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: VoidAwbAllocationDto }) =>
      awbStockService.voidAllocation(id, dto),
    onSuccess: () => invalidate(),
  });
}
