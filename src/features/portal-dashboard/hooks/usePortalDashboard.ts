import { useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalDashboardService } from '../services/portalDashboard.service';

export const portalDashboardKeys = {
  all: (scope: string) => ['portal', scope, 'dashboard'] as const,
};

export function usePortalDashboard(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalDashboardKeys.all(scope),
    queryFn: () => portalDashboardService.get(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}
