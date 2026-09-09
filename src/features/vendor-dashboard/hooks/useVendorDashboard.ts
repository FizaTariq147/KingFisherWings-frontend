import { useQuery } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import type { ApiPeriodQuery, UiDashboardPeriod } from '@/lib/apiPeriod';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import { vendorDashboardService } from '../services/vendorDashboard.service';

export const vendorDashboardKeys = {
  all: (scope: string) => ['vendor', scope, 'dashboard'] as const,
  widgets: (scope: string, period?: ApiPeriodQuery | null) =>
    [...vendorDashboardKeys.all(scope), 'widgets', period ?? null] as const,
  tasks: (scope: string, period?: ApiPeriodQuery | null) =>
    [...vendorDashboardKeys.all(scope), 'tasks', period ?? null] as const,
};

function resolvePeriod(period?: UiDashboardPeriod | ApiPeriodQuery): ApiPeriodQuery | undefined {
  if (!period) return undefined;
  if (typeof period === 'string') return uiPeriodToApi(period);
  return period;
}

export function useVendorDashboard(period?: UiDashboardPeriod | ApiPeriodQuery, enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  const periodQuery = resolvePeriod(period);
  return useQuery({
    queryKey: vendorDashboardKeys.widgets(scope, periodQuery),
    queryFn: () => vendorDashboardService.get(periodQuery),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function useVendorTasks(period?: UiDashboardPeriod | ApiPeriodQuery, enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  const periodQuery = resolvePeriod(period);
  return useQuery({
    queryKey: vendorDashboardKeys.tasks(scope, periodQuery),
    queryFn: () => vendorDashboardService.tasks(periodQuery),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}
