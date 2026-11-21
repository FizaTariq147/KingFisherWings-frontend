import { useQuery } from '@tanstack/react-query';
import { listUsersForTenantDetailed } from '../services/tenantUsers.service';

export function useTenantUsers(tenantId: string) {
  return useQuery({
    queryKey: ['superadmin', 'tenants', tenantId, 'users'],
    queryFn: () => listUsersForTenantDetailed(tenantId),
    enabled: Boolean(tenantId),
  });
}
