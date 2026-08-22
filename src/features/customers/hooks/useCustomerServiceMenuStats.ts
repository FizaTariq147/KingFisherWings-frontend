import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { customerServiceMenuService } from '../services/customerServiceMenu.service';

export const customerServiceMenuKeys = {
  all: ['customer-service', 'menu-stats'] as const,
  stats: () => [...customerServiceMenuKeys.all] as const,
};

export function useCustomerServiceMenuStats() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: customerServiceMenuKeys.stats(),
    queryFn: () => customerServiceMenuService.loadStats(),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
