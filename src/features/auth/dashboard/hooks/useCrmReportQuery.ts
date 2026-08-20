import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { crmDashboardService } from '@/features/crm/services/crmDashboard.service';
import type { CrmReportType } from '@/features/crm/constants/crm.constants';
import { unwrapReportRows } from '../utils/dashboardFormat';

export function useCrmReportQuery(
  type: CrmReportType,
  params: { from?: string; to?: string },
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['tenant', 'crm', 'dashboard-report', type, params],
    queryFn: async () => {
      const raw = await crmDashboardService.report({
        type,
        from: params.from,
        to: params.to,
      });
      return { rows: unwrapReportRows(raw), raw };
    },
    enabled: Boolean(accessToken) && enabled,
    staleTime: 60_000,
    retry: false,
  });
}
