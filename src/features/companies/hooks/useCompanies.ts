import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { companyRegistryService } from '../services/companyRegistry.service';
import { companyService } from '../services/company.service';
import type { CompanyListParams } from '../types/company.types';

export const companyKeys = {
  all: ['superadmin', 'companies'] as const,
  registry: (params: CompanyListParams) => [...companyKeys.all, 'registry', params] as const,
  list: (params: CompanyListParams) => [...companyKeys.all, 'list', params] as const,
  detail: (tenantId: string, id: string) => [...companyKeys.all, 'detail', tenantId, id] as const,
};

/** All companies across tenants — safe for tenant create dropdown and registry list */
export function useCompanyRegistry(params: Omit<CompanyListParams, 'tenantId'> = {}) {
  return useQuery({
    queryKey: companyKeys.registry(params),
    queryFn: () => companyRegistryService.list(params),
    placeholderData: keepPreviousData,
    staleTime: params.status === 'deleted' ? 0 : 30_000,
  });
}

export function useCompanies(params: CompanyListParams) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companyService.list(params),
    enabled: !!params.tenantId && isUuid(params.tenantId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function isPlatformCompanyId(id: string): boolean {
  return isUuid(id) || id.startsWith('tenant-company:');
}

export function useCompany(tenantId: string, id: string) {
  return useQuery({
    queryKey: companyKeys.detail(tenantId, id),
    queryFn: () => companyService.getById(tenantId, id),
    enabled: isUuid(tenantId) && isPlatformCompanyId(id),
  });
}

export {
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useCompanyMutations,
  useSetCompanyActive,
} from './useCompanyMutations';
