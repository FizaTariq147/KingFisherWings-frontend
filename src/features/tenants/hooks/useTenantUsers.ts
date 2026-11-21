import { isUuid } from '@/lib/isUuid';
import { useQuery } from '@tanstack/react-query';
import { listUsersForTenant } from '../services/tenantUsers.service';
import { tenantKeys } from './useTenants';

export function useTenantUsers(tenantId: string) {
  return useQuery({
    queryKey: [...tenantKeys.detail(tenantId), 'users'] as const,
    queryFn: () => listUsersForTenant(tenantId),
    enabled: isUuid(tenantId),
    staleTime: 30_000,
  });
}
