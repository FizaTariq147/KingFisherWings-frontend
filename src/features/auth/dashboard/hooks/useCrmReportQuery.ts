import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { crmDashboardService } from '@/features/crm/services/crmDashboard.service';
import type { CrmReportType } from '@/features/crm/constants/crm.constants';
import { normalizeCrmReportRows } from '@/features/crm/utils/normalizeCrmReport';
import { unwrapReportRows } from '../utils/dashboardFormat';

export function useCrmReportQuery(
  type: CrmReportType,
  params: { from?: string; to?: string; period?: '7d' | '30d' | 'mtd' | 'custom' },
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
        period: params.period,
      });
      // Prefer CRM normalizer (by_month / by_customer maps); fall back to dashboard unwrap.
      const normalized = normalizeCrmReportRows(raw);
      const rows = normalized.length ? normalized : unwrapReportRows(raw);
      return { rows, raw };
    },
    enabled: Boolean(accessToken) && enabled,
    staleTime: 60_000,
    retry: false,
  });
}
