import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { vendorServiceMenuService } from '../services/vendorServiceMenu.service';

export const vendorServiceMenuKeys = {
  all: ['vendor-service', 'menu-stats'] as const,
  stats: () => [...vendorServiceMenuKeys.all] as const,
};

export function useVendorServiceMenuStats() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: vendorServiceMenuKeys.stats(),
    queryFn: () => vendorServiceMenuService.loadStats(),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
