import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { chequeService } from '../services/cheque.service';
import type {
  BounceChequeDto,
  ChequeListParams,
  CreateChequeDto,
  PdcDueReportParams,
  UpdateChequeDto,
} from '../types/cheque.types';

export const chequeKeys = {
  all: ['tenant', 'gl-cheques'] as const,
  list: (params: ChequeListParams) => [...chequeKeys.all, 'list', params] as const,
  pdcDue: (params: PdcDueReportParams) => [...chequeKeys.all, 'pdc-due', params] as const,
  detail: (id: string) => [...chequeKeys.all, 'detail', id] as const,
};

export function useCheques(params: ChequeListParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chequeKeys.list(params),
    queryFn: () => chequeService.list(params),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function usePdcDueReport(params: PdcDueReportParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chequeKeys.pdcDue(params),
    queryFn: () => chequeService.getPdcDue(params),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useCheque(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chequeKeys.detail(id),
    queryFn: () => chequeService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidateCheques() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: chequeKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: chequeKeys.detail(detailId) });
    }
  };
}

export function useCreateCheque() {
  const invalidate = useInvalidateCheques();
  return useMutation({
    mutationFn: (dto: CreateChequeDto) => chequeService.create(dto),
    onSuccess: (c) => invalidate(c.id),
  });
}

export function useUpdateCheque(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateChequeDto) => chequeService.update(id, dto),
    onSuccess: (c) => {
      queryClient.invalidateQueries({ queryKey: chequeKeys.all });
      queryClient.setQueryData(chequeKeys.detail(id), c);
    },
  });
}

export function useDepositCheque(id: string) {
  const invalidate = useInvalidateCheques();
  return useMutation({
    mutationFn: () => chequeService.deposit(id),
    onSuccess: () => invalidate(id),
  });
}

export function useClearCheque(id: string) {
  const invalidate = useInvalidateCheques();
  return useMutation({
    mutationFn: () => chequeService.clear(id),
    onSuccess: () => invalidate(id),
  });
}

export function useBounceCheque(id: string) {
  const invalidate = useInvalidateCheques();
  return useMutation({
    mutationFn: (dto: BounceChequeDto) => chequeService.bounce(id, dto),
    onSuccess: () => invalidate(id),
  });
}

export function useCancelCheque(id: string) {
  const invalidate = useInvalidateCheques();
  return useMutation({
    mutationFn: () => chequeService.cancel(id),
    onSuccess: () => invalidate(id),
  });
}
