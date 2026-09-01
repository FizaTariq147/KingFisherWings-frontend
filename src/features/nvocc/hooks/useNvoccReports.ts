import { useQuery } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { nvoccEnquiryService, nvoccReportService, nvoccVoyageService } from '../services/nvocc.service';
import type { NvoccTradeLaneReportParams, NvoccUtilizationReportParams } from '../types/nvocc.types';
import { nvoccKeys } from './useNvocc';

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useNvoccEnquiryAnalytics(
  params: Record<string, string | undefined> = {},
  enabled = true,
) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.enquiries.analytics(params),
    queryFn: () => nvoccEnquiryService.analytics(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useNvoccTradeLaneReport(params: NvoccTradeLaneReportParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ['tenant', 'nvocc', 'reports', 'trade-lane', params] as const,
    queryFn: () => nvoccReportService.tradeLaneProfitability(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useNvoccUtilizationReport(params: NvoccUtilizationReportParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ['tenant', 'nvocc', 'reports', 'utilization', params] as const,
    queryFn: () => nvoccReportService.utilization(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useNvoccVoyagePnl(voyageId: string, options?: { enabled?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: [...nvoccKeys.voyages.detail(voyageId), 'pnl'] as const,
    queryFn: () => nvoccVoyageService.pnl(voyageId),
    enabled: Boolean(token) && isUuid(voyageId) && options?.enabled !== false,
  });
}
