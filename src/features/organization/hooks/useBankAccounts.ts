import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { organizationService } from '../services/organization.service';
import type {
  BankAccountFormValues,
  BankAccountListParams,
} from '../types/organization.types';
import { organizationKeys } from './useOrganizationProfile';

export const bankAccountKeys = {
  all: (tenantId?: string | null) =>
    [...organizationKeys.all(tenantId), 'bank-accounts'] as const,
  list: (tenantId: string | null | undefined, params: BankAccountListParams) =>
    [...bankAccountKeys.all(tenantId), 'list', params] as const,
  detail: (tenantId: string | null | undefined, id: string) =>
    [...bankAccountKeys.all(tenantId), 'detail', id] as const,
};

export function useBankAccounts(params: BankAccountListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: bankAccountKeys.list(tenantId, params),
    queryFn: () => organizationService.listBankAccounts(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useBankAccount(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: bankAccountKeys.detail(tenantId, id),
    queryFn: () => organizationService.getBankAccount(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidateBankAccounts() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: bankAccountKeys.all(tenantId) });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.detail(tenantId, detailId) });
    }
  };
}

export function useCreateBankAccount() {
  const invalidate = useInvalidateBankAccounts();
  return useMutation({
    mutationFn: (values: BankAccountFormValues) => organizationService.createBankAccount(values),
    onSuccess: (account) => invalidate(account.id),
  });
}

export function useUpdateBankAccount(id: string) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useMutation({
    mutationFn: (values: Partial<BankAccountFormValues>) =>
      organizationService.updateBankAccount(id, values),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all(tenantId) });
      queryClient.setQueryData(bankAccountKeys.detail(tenantId, id), account);
    },
  });
}

export function useDeleteBankAccount() {
  const invalidate = useInvalidateBankAccounts();
  return useMutation({
    mutationFn: (id: string) => organizationService.deleteBankAccount(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useSetBankAccountActive() {
  const invalidate = useInvalidateBankAccounts();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      organizationService.setBankAccountActive(id, is_active),
    onSuccess: (_data, { id }) => invalidate(id),
  });
}
