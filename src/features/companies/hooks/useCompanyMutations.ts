import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantKeys } from '@/features/tenants/hooks/useTenants';
import { companyService, type CompanyDeleteSnapshot } from '../services/company.service';
import type { CreateCompanyDto, UpdateCompanyDto } from '../types/company.types';
import { companyKeys } from './useCompanies';

function useInvalidateCompanies() {
  const queryClient = useQueryClient();

  return (tenantId?: string, detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: companyKeys.all });
    queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    if (tenantId && detailId) {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(tenantId, detailId) });
    }
  };
}

export function useCompanyMutations(tenantId: string) {
  const invalidate = useInvalidateCompanies();

  const createCompany = useMutation({
    mutationFn: (dto: CreateCompanyDto) => companyService.create(tenantId, dto),
    onSuccess: () => invalidate(tenantId),
  });

  const updateCompany = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCompanyDto }) =>
      companyService.update(tenantId, id, dto),
    onSuccess: (_, { id }) => invalidate(tenantId, id),
  });

  const deleteCompany = useMutation({
    mutationFn: ({ id, company }: { id: string; company?: CompanyDeleteSnapshot }) =>
      companyService.softDelete(tenantId, id, company),
    onSuccess: (_, { id }) => invalidate(tenantId, id),
  });

  const restoreCompany = useMutation({
    mutationFn: () => companyService.restore(tenantId),
    onSuccess: () => invalidate(tenantId),
  });

  const permanentDeleteCompany = useMutation({
    mutationFn: () => companyService.permanentDelete(tenantId),
    onSuccess: () => invalidate(tenantId),
  });

  return {
    createCompany,
    updateCompany,
    deleteCompany,
    restoreCompany,
    permanentDeleteCompany,
  };
}

export function useCreateCompany(tenantId: string) {
  return useCompanyMutations(tenantId).createCompany;
}

export function useUpdateCompany(tenantId: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCompanyDto) => companyService.update(tenantId, id, dto),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.setQueryData(companyKeys.detail(tenantId, id), company);
    },
  });
}

export function useDeleteCompany(tenantId: string) {
  return useCompanyMutations(tenantId).deleteCompany;
}

export function useRestoreCompany(tenantId: string) {
  return useCompanyMutations(tenantId).restoreCompany;
}

export function usePermanentDeleteCompany(tenantId: string) {
  return useCompanyMutations(tenantId).permanentDeleteCompany;
}

export function useSetCompanyActive(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      companyService.update(tenantId, id, { is_active }),
    onSuccess: (company, { id }) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.setQueryData(companyKeys.detail(tenantId, id), company);
    },
  });
}
