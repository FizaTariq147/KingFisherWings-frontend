import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '@/features/jobs/services/job.service';
import type { JobStatus } from '@/features/jobs/constants/job.constants';
import { PENDING_QUOTATION_STATUSES } from '@/features/quotations/constants/quotation.constants';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { uiPeriodToApi } from '@/lib/apiPeriod';
import type { DashboardPeriod } from '../utils/dashboardFormat';

const COUNT_STATUSES: JobStatus[] = [
  'ENQUIRY',
  'QUOTATION',
  'BOOKING_CONFIRMED',
  'IN_PROGRESS',
  'DOCS_PENDING',
  'CUSTOMS_CLEARANCE',
  'DELIVERED',
  'ON_HOLD',
];

async function legacyJobCounts() {
  const pages = await Promise.all(
    COUNT_STATUSES.map((status) => jobService.list({ page: 1, limit: 1, status })),
  );
  const byStatus = Object.fromEntries(
    COUNT_STATUSES.map((status, i) => [status, pages[i]?.meta.total ?? 0]),
  ) as Record<JobStatus, number>;
  const inTransit = (byStatus.IN_PROGRESS ?? 0) + (byStatus.CUSTOMS_CLEARANCE ?? 0);
  const atOrigin =
    (byStatus.BOOKING_CONFIRMED ?? 0) +
    (byStatus.DOCS_PENDING ?? 0) +
    (byStatus.ENQUIRY ?? 0);
  const newJobs = (byStatus.ENQUIRY ?? 0) + (byStatus.QUOTATION ?? 0);
  const active =
    (byStatus.ENQUIRY ?? 0) +
    (byStatus.QUOTATION ?? 0) +
    (byStatus.BOOKING_CONFIRMED ?? 0) +
    (byStatus.IN_PROGRESS ?? 0) +
    (byStatus.DOCS_PENDING ?? 0) +
    (byStatus.CUSTOMS_CLEARANCE ?? 0) +
    (byStatus.DELIVERED ?? 0) +
    (byStatus.ON_HOLD ?? 0);
  return {
    byStatus,
    bars: COUNT_STATUSES.map((status) => byStatus[status] ?? 0),
    active,
    inTransit,
    atOrigin,
    newJobs,
    customsHold: (byStatus.CUSTOMS_CLEARANCE ?? 0) + (byStatus.ON_HOLD ?? 0),
    docsPending: byStatus.DOCS_PENDING ?? 0,
  };
}

export function useDashboardJobCounts(period: DashboardPeriod = 'month') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const apiPeriod = uiPeriodToApi(period);
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'job-counts', apiPeriod],
    queryFn: async () => {
      try {
        return await jobService.dashboardCounts(apiPeriod);
      } catch {
        return legacyJobCounts();
      }
    },
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useDashboardPendingQuoteStats(period: DashboardPeriod = 'month') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const apiPeriod = uiPeriodToApi(period);
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'pending-quote-stats', apiPeriod, PENDING_QUOTATION_STATUSES, 50],
    queryFn: async () => {
      const listPages = await Promise.all(
        PENDING_QUOTATION_STATUSES.map((status) =>
          quotationService.list({ page: 1, limit: 50, status, order: 'desc' }),
        ),
      );
      const byStatus = Object.fromEntries(
        PENDING_QUOTATION_STATUSES.map((status, i) => [status, listPages[i]?.meta.total ?? 0]),
      );
      const bars = PENDING_QUOTATION_STATUSES.map((status) => byStatus[status] ?? 0);
      const quotations = listPages
        .flatMap((page) => page.quotations)
        .sort(
          (a, b) =>
            Date.parse(b.updated_at || b.created_at || '0') -
            Date.parse(a.updated_at || a.created_at || '0'),
        );
      const totalPending = listPages.reduce((sum, page) => sum + (page.meta.total || 0), 0);
      const pipelineValue = quotations.reduce(
        (sum, q) => sum + (q.total_amount ?? q.revenue_total ?? 0),
        0,
      );
      const legacy = { totalPending, byStatus, bars, quotations, pipelineValue };

      try {
        const stats = await quotationService.dashboardStats({
          period: apiPeriod.period,
          from_date: apiPeriod.from_date,
          to_date: apiPeriod.to_date,
        });
        return {
          totalPending: stats.totalPending || legacy.totalPending,
          byStatus: Object.keys(stats.byStatus).length ? stats.byStatus : legacy.byStatus,
          bars: stats.bars.length ? stats.bars : legacy.bars,
          quotations: legacy.quotations,
          pipelineValue: stats.pipelineValue || legacy.pipelineValue,
        };
      } catch {
        return legacy;
      }
    },
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useDashboardTeamWorkload(period: DashboardPeriod = 'month') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const apiPeriod = uiPeriodToApi(period);
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'team-workload', apiPeriod],
    queryFn: () => jobService.teamWorkload(apiPeriod),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}
