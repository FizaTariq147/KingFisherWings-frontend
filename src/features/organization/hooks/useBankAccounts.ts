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
  all: [...organizationKeys.all, 'bank-accounts'] as const,
  list: (params: BankAccountListParams) => [...bankAccountKeys.all, 'list', params] as const,
  detail: (id: string) => [...bankAccountKeys.all, 'detail', id] as const,
};

export function useBankAccounts(params: BankAccountListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: bankAccountKeys.list(params),
    queryFn: () => organizationService.listBankAccounts(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useBankAccount(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: bankAccountKeys.detail(id),
    queryFn: () => organizationService.getBankAccount(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidateBankAccounts() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.detail(detailId) });
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
  return useMutation({
    mutationFn: (values: Partial<BankAccountFormValues>) =>
      organizationService.updateBankAccount(id, values),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
      queryClient.setQueryData(bankAccountKeys.detail(id), account);
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
