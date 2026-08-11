import { useQuery } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorTdsService } from '../services/vendorTds.service';

export function useVendorTds() {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: ['vendor', scope, 'tds'] as const,
    queryFn: () => vendorTdsService.get(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}
