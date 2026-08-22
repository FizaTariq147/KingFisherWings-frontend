import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useInvoices, useOverdueInvoices } from '@/features/invoices/hooks/useInvoices';
import { useArAging } from '@/features/arApAging/hooks/useArApAging';
import { useMisOperational } from '@/features/glMisDashboard/hooks/useGlMis';
import { useCrmFollowUps, usePatchCrmFollowUp } from '@/features/crm/hooks/useCrmFollowUps';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { computeAgingTotals, resolveAgingBucketValues } from '@/features/arApAging/utils/normalizeArApAging';
import { DashboardHeader, DashboardAlertPills } from '../components/DashboardHeader';
import { DashboardKpiRow } from '../components/DashboardKpiRow';
import { ActiveShipmentsPanel } from '../components/ActiveShipmentsPanel';
import { PendingQuotationsPanel, TodaysTasksPanel } from '../components/PendingQuotationsPanel';
import { RecentInvoicesPanel, ReceivablesAgingPanel } from '../components/RecentInvoicesPanel';
import { RevenueVsTargetPanel, TradeLanePanel } from '../components/RevenuePanels';
import { LiveActivityPanel, ReportsHubPanel, TeamWorkloadPanel } from '../components/LowerPanels';
import { useDashboardPeriod } from '../hooks/useDashboardPeriod';
import { useCrmReportQuery } from '../hooks/useCrmReportQuery';
import { useDashboardJobCounts, useDashboardPendingQuoteStats } from '../hooks/useDashboardJobCounts';
import { isoDate, pickNumber } from '../utils/dashboardFormat';

function extractOnTime(rows: Record<string, unknown>[]) {
  const percents: number[] = [];
  const volumes: number[] = [];
  let target: number | null = null;
  for (const row of rows) {
    const otp = pickNumber(row, [
      'on_time',
      'ontime',
      'on_time_pct',
      'on_time_percent',
      'otp',
      'delivery_otp',
      'ontime_pct',
      'on_time_rate',
    ]);
    if (otp != null) percents.push(otp <= 1 && otp >= 0 ? otp * 100 : otp);
    const volume = pickNumber(row, [
      'jobs',
      'job_count',
      'shipments',
      'delivered',
      'delivered_count',
      'volume',
      'count',
    ]);
    if (volume != null) volumes.push(volume);
    const rowTarget = pickNumber(row, [
      'target',
      'otp_target',
      'on_time_target',
      'target_pct',
      'target_percent',
    ]);
    if (rowTarget != null && target == null) {
      target = rowTarget <= 1 && rowTarget > 0 ? rowTarget * 100 : rowTarget;
    }
  }
  const pct =
    percents.length === 0
      ? null
      : percents.reduce((sum, n) => sum + n, 0) / percents.length;
  return {
    pct,
    target,
    bars: percents.length >= 2 ? percents : volumes.length ? volumes : percents,
  };
}

export function DashboardPage() {
  const { user } = useAuth();
  const { period, setPeriod, range } = useDashboardPeriod();
  const today = isoDate(new Date());

  const revenueRange = useMemo(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
    return { from: isoDate(start), to: isoDate(end) };
  }, []);

  const tradeLaneRange = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 89);
    return { from: isoDate(start), to: isoDate(end) };
  }, []);

  const jobsQuery = useJobs({ page: 1, limit: 50, order: 'desc' });
  const jobCounts = useDashboardJobCounts();
  const quoteStats = useDashboardPendingQuoteStats();
  const invoicesQuery = useInvoices({ page: 1, limit: 8 });
  const overdueQuery = useOverdueInvoices();
  const agingQuery = useArAging({ as_of: range.to });
  const operational = useMisOperational({ from_date: range.from, to_date: range.to });
  const monthlySales = useCrmReportQuery('monthly_sales', revenueRange);
  const topCustomers = useCrmReportQuery('top_customers', revenueRange);
  const tradeLane = useCrmReportQuery('trade_lane', tradeLaneRange);
  const followUps = useCrmFollowUps({ page: 1, limit: 10, from: today, to: today });
  const patchFollowUp = usePatchCrmFollowUp();
  const notifications = useNotifications({ page: 1, limit: 8 });

  const agingTotals = useMemo(
    () => computeAgingTotals(agingQuery.data),
    [agingQuery.data],
  );

  const receivables = agingTotals.total || 0;
  const agingBars = resolveAgingBucketValues(agingTotals);

  const jobBars = jobCounts.data?.bars ?? [];
  const quoteBars = quoteStats.data?.bars ?? [];

  const agingQuoteStats = useMemo(() => {
    const quotations = quoteStats.data?.quotations ?? [];
    const ages = quotations.map((item) => {
      const ts = Date.parse(item.created_at || item.quotation_date || '');
      if (Number.isNaN(ts)) return 0;
      return Math.max(0, Math.round((Date.now() - ts) / 86_400_000));
    });
    return {
      count: ages.filter((days) => days >= 5).length,
      oldestDays: ages.length ? Math.max(...ages) : 0,
    };
  }, [quoteStats.data]);

  const onTime = useMemo(
    () => extractOnTime(operational.data?.rows ?? []),
    [operational.data],
  );

  const agingReport = agingQuery.data
    ? { ...agingQuery.data, totals: agingTotals }
    : undefined;

  const tasks = (followUps.data?.items ?? []).map((item) => ({
    id: item.id,
    subject: item.subject,
    due_date: item.due_date,
    notes: item.notes,
    done: item.status === 'COMPLETED',
  }));

  return (
    <div className="pb-10">
      <div className="space-y-5">
        <DashboardHeader
          userName={user?.name}
          pendingQuotes={quoteStats.data?.totalPending ?? 0}
          customsHolds={jobCounts.data?.customsHold ?? 0}
          period={period}
          onPeriodChange={setPeriod}
        />

        <DashboardAlertPills
          customsHold={jobCounts.data?.customsHold ?? 0}
          docsPending={jobCounts.data?.docsPending ?? 0}
          invoicesOverdue={overdueQuery.data?.length ?? 0}
        />

        <DashboardKpiRow
          activeJobs={jobCounts.data?.active ?? 0}
          inTransit={jobCounts.data?.inTransit ?? 0}
          atOrigin={jobCounts.data?.atOrigin ?? 0}
          newJobs={jobCounts.data?.newJobs ?? 0}
          jobBars={jobBars}
          pendingQuotes={quoteStats.data?.totalPending ?? 0}
          agingQuotes={agingQuoteStats.count}
          oldestQuoteDays={agingQuoteStats.oldestDays}
          quoteBars={quoteBars}
          receivables={receivables}
          overdue30={
            (agingTotals.days_31_60 || 0) +
            (agingTotals.days_61_90 || 0) +
            (agingTotals.days_over_90 || 0)
          }
          agingBars={agingBars}
          onTimePct={onTime.pct}
          onTimeTarget={onTime.target}
          onTimeBars={onTime.bars}
          loadingJobs={jobCounts.isLoading}
          loadingQuotes={quoteStats.isLoading}
          loadingReceivables={agingQuery.isLoading}
          loadingOnTime={operational.isLoading}
        />

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
          <ActiveShipmentsPanel
            jobs={jobsQuery.data?.jobs ?? []}
            isLoading={jobsQuery.isLoading}
            isError={jobsQuery.isError}
            isFetching={jobsQuery.isFetching}
            lastUpdated={jobsQuery.dataUpdatedAt}
            onRefresh={() => void jobsQuery.refetch()}
            userId={user?.id}
          />
          <div className="space-y-4">
            <PendingQuotationsPanel
              quotations={quoteStats.data?.quotations ?? []}
              pipelineValue={quoteStats.data?.pipelineValue ?? 0}
              isLoading={quoteStats.isLoading}
              isError={quoteStats.isError}
            />
            <TodaysTasksPanel
              items={tasks}
              isLoading={followUps.isLoading}
              isError={followUps.isError}
              pendingToggleId={patchFollowUp.isPending ? patchFollowUp.variables?.id : undefined}
              onToggle={(id: string, done: boolean) => {
                void patchFollowUp.mutateAsync({
                  id,
                  dto: { status: done ? 'COMPLETED' : 'PENDING' },
                });
              }}
            />
            <RecentInvoicesPanel
              invoices={invoicesQuery.data?.invoices ?? []}
              isLoading={invoicesQuery.isLoading}
              isError={invoicesQuery.isError}
            />
            <ReceivablesAgingPanel
              report={agingReport}
              isLoading={agingQuery.isLoading}
              isError={agingQuery.isError}
              isFetching={agingQuery.isFetching}
              onRefresh={() => void agingQuery.refetch()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RevenueVsTargetPanel
            monthlyRows={monthlySales.data?.rows ?? []}
            customerRows={topCustomers.data?.rows ?? []}
            isLoading={monthlySales.isLoading || topCustomers.isLoading}
            isError={monthlySales.isError && topCustomers.isError}
          />
          <TradeLanePanel
            rows={tradeLane.data?.rows ?? []}
            isLoading={tradeLane.isLoading}
            isError={tradeLane.isError}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TeamWorkloadPanel />
          <LiveActivityPanel
            items={notifications.data?.items ?? []}
            isLoading={notifications.isLoading}
            isError={notifications.isError}
          />
        </div>

        <ReportsHubPanel />
      </div>
    </div>
  );
}
