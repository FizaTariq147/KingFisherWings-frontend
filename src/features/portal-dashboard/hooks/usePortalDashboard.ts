import { useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import type { ApiPeriodQuery, UiDashboardPeriod } from '@/lib/apiPeriod';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import { portalDashboardService } from '../services/portalDashboard.service';

export const portalDashboardKeys = {
  all: (scope: string) => ['portal', scope, 'dashboard'] as const,
  widgets: (scope: string, period?: ApiPeriodQuery | null) =>
    [...portalDashboardKeys.all(scope), 'widgets', period ?? null] as const,
  tasks: (scope: string, period?: ApiPeriodQuery | null) =>
    [...portalDashboardKeys.all(scope), 'tasks', period ?? null] as const,
};

function resolvePeriod(
  period?: UiDashboardPeriod | ApiPeriodQuery,
): ApiPeriodQuery | undefined {
  if (!period) return undefined;
  if (typeof period === 'string') return uiPeriodToApi(period);
  return period;
}

export function usePortalDashboard(period?: UiDashboardPeriod | ApiPeriodQuery, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  const periodQuery = resolvePeriod(period);
  return useQuery({
    queryKey: portalDashboardKeys.widgets(scope, periodQuery),
    queryFn: () => portalDashboardService.get(periodQuery),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalTasks(period?: UiDashboardPeriod | ApiPeriodQuery, enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  const periodQuery = resolvePeriod(period);
  return useQuery({
    queryKey: portalDashboardKeys.tasks(scope, periodQuery),
    queryFn: () => portalDashboardService.tasks(periodQuery),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}
