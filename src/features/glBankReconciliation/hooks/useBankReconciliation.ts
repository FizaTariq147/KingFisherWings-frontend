import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { isUuid } from '@/lib/isUuid';
import type {
  BankReconciliationListParams,
  BankTransferDto,
  CreateBankReconciliationDto,
  CreateBankReconciliationLineDto,
  UpdateBankReconciliationDto,
  UpdateBankReconciliationLineDto,
} from '../types/bankReconciliation.types';
import { bankReconciliationService } from '../services/bankReconciliation.service';

export const bankReconciliationKeys = {
  all: ['tenant', 'gl-bank-reconciliation'] as const,
  list: (params: BankReconciliationListParams) => [...bankReconciliationKeys.all, 'list', params] as const,
  detail: (id: string) => [...bankReconciliationKeys.all, 'detail', id] as const,
  unmatched: (id: string) => [...bankReconciliationKeys.all, 'unmatched', id] as const,
};

export function useBankReconciliations(params: BankReconciliationListParams = {}) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: bankReconciliationKeys.list(params),
    queryFn: () => bankReconciliationService.list(params),
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}

export function useBankReconciliation(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: bankReconciliationKeys.detail(id),
    queryFn: () => bankReconciliationService.getById(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function useBankReconciliationUnmatched(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: bankReconciliationKeys.unmatched(id),
    queryFn: () => bankReconciliationService.listUnmatched(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: bankReconciliationKeys.all });
    if (id) {
      qc.invalidateQueries({ queryKey: bankReconciliationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: bankReconciliationKeys.unmatched(id) });
    }
  };
}

export function useCreateBankTransfer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (dto: BankTransferDto) => bankReconciliationService.createTransfer(dto),
    onSuccess: () => invalidate(),
  });
}

export function useCreateBankReconciliation() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (dto: CreateBankReconciliationDto) => bankReconciliationService.create(dto),
    onSuccess: (r) => invalidate(r.id),
  });
}

export function useUpdateBankReconciliation(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (dto: UpdateBankReconciliationDto) => bankReconciliationService.update(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useCancelBankReconciliation() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => bankReconciliationService.cancel(id),
    onSuccess: () => invalidate(),
  });
}

export function useAddReconciliationLine(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (dto: CreateBankReconciliationLineDto) => bankReconciliationService.addLine(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useUpdateReconciliationLine(id: string, lineId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (dto: UpdateBankReconciliationLineDto) =>
      bankReconciliationService.updateLine(id, lineId, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useRemoveReconciliationLine(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (lineId: string) => bankReconciliationService.removeLine(id, lineId),
    onSuccess: () => invalidate(id),
  });
}

export function useCompleteBankReconciliation(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => bankReconciliationService.complete(id),
    onSuccess: () => invalidate(id),
  });
}
