import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { partyVendorKeys } from '@/features/parties/hooks/usePartyVendor';
import { vendorUsersAdminService } from '../services/vendorUsersAdmin.service';

export function useTenantVendorUsers(partyId?: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyVendorKeys.tenantUsers(partyId),
    queryFn: () => vendorUsersAdminService.list(partyId),
    enabled: Boolean(accessToken),
  });
}
