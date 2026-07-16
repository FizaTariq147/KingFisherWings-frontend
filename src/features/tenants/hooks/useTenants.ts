import { isUuid } from '@/lib/isUuid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { tenantService } from '../services/tenant.service';
import type { TenantListParams } from '../types/tenant.types';

export const tenantKeys = {
  all: ['superadmin', 'tenants'] as const,
  list: (params: TenantListParams) => [...tenantKeys.all, 'list', params] as const,
  detail: (id: string) => [...tenantKeys.all, 'detail', id] as const,
  statistics: () => [...tenantKeys.all, 'statistics'] as const,
};

export function useTenants(params: TenantListParams) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantService.list(params),
    placeholderData: keepPreviousData,
    // Deleted list is local-registry backed — always refetch after delete/restore.
    staleTime: params.status === 'deleted' ? 0 : 30_000,
  });
}

/** @alias useTenants */
export const useTenantsList = useTenants;

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantService.getById(id),
    enabled: isUuid(id),
  });
}

export function useTenantStatistics() {
  return useQuery({
    queryKey: tenantKeys.statistics(),
    queryFn: () => tenantService.getStatistics(),
    staleTime: 5 * 60_000,
  });
}

export {
  useCreateTenant,
  useUpdateTenant,
  useActivateTenant,
  useDeactivateTenant,
  useDeleteTenant,
  useRestoreTenant,
  useSyncTenantPermissions,
  useTenantMutations,
} from './useTenantMutations';
