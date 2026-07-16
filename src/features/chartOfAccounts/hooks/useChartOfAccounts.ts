import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { chartOfAccountService } from '../services/chartOfAccount.service';
import type {
  AccountLedgerParams,
  ChartOfAccountListParams,
  CreateChartOfAccountDto,
  TrialBalanceParams,
  UpdateChartOfAccountDto,
} from '../types/chartOfAccount.types';

export const chartOfAccountKeys = {
  all: ['tenant', 'gl-accounts'] as const,
  list: (params: ChartOfAccountListParams) =>
    [...chartOfAccountKeys.all, 'list', params] as const,
  detail: (id: string) => [...chartOfAccountKeys.all, 'detail', id] as const,
  tree: () => [...chartOfAccountKeys.all, 'tree'] as const,
  trialBalance: (params: TrialBalanceParams) =>
    [...chartOfAccountKeys.all, 'trial-balance', params] as const,
  ledger: (id: string, params: AccountLedgerParams) =>
    [...chartOfAccountKeys.all, 'ledger', id, params] as const,
};

export function useChartOfAccounts(params: ChartOfAccountListParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chartOfAccountKeys.list(params),
    queryFn: () => chartOfAccountService.list(params),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useChartOfAccount(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chartOfAccountKeys.detail(id),
    queryFn: () => chartOfAccountService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useChartOfAccountTree(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chartOfAccountKeys.tree(),
    queryFn: () => chartOfAccountService.getTree(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
  });
}

export function useTrialBalance(params: TrialBalanceParams, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chartOfAccountKeys.trialBalance(params),
    queryFn: () => chartOfAccountService.getTrialBalance(params),
    enabled: Boolean(accessToken) && enabled,
  });
}

export function useAccountLedger(id: string, params: AccountLedgerParams = {}, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: chartOfAccountKeys.ledger(id, params),
    queryFn: () => chartOfAccountService.getLedger(id, params),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

function useInvalidateChartOfAccounts() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: chartOfAccountKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: chartOfAccountKeys.detail(detailId) });
    }
  };
}

export function useCreateChartOfAccount() {
  const invalidate = useInvalidateChartOfAccounts();
  return useMutation({
    mutationFn: (dto: CreateChartOfAccountDto) => chartOfAccountService.create(dto),
    onSuccess: (account) => invalidate(account.id),
  });
}

export function useUpdateChartOfAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateChartOfAccountDto) => chartOfAccountService.update(id, dto),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: chartOfAccountKeys.all });
      queryClient.setQueryData(chartOfAccountKeys.detail(id), account);
    },
  });
}

export function useDeleteChartOfAccount() {
  const invalidate = useInvalidateChartOfAccounts();
  return useMutation({
    mutationFn: (id: string) => chartOfAccountService.remove(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useSeedChartOfAccounts() {
  const invalidate = useInvalidateChartOfAccounts();
  return useMutation({
    mutationFn: () => chartOfAccountService.seedDefaults(),
    onSuccess: () => invalidate(),
  });
}
