import { useQuery } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorScheduleService } from '../services/vendorSchedule.service';

export function useVendorSchedule() {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: ['vendor', scope, 'schedule'] as const,
    queryFn: () => vendorScheduleService.get(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}
