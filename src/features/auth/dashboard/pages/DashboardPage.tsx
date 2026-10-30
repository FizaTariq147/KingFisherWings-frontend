import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useInvoices, useOverdueInvoices } from '@/features/invoices/hooks/useInvoices';
import { useArAging } from '@/features/arApAging/hooks/useArApAging';
import { useCrmFollowUps, usePatchCrmFollowUp } from '@/features/crm/hooks/useCrmFollowUps';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { computeAgingTotals, resolveAgingBucketValues } from '@/features/arApAging/utils/normalizeArApAging';
import { DashboardHeader, DashboardAlertPills } from '../components/DashboardHeader';
import { DashboardKpiRow } from '../components/DashboardKpiRow';
import { ActiveShipmentsPanel } from '../components/ActiveShipmentsPanel';
import { PendingQuotationsPanel, TodaysTasksPanel } from '../components/PendingQuotationsPanel';
import { RecentInvoicesPanel, ReceivablesAgingPanel } from '../components/RecentInvoicesPanel';
import { RevenueVsTargetPanel, TradeLanePanel } from '../components/RevenuePanels';
import { FavouritesPanel } from '../components/FavouritesPanel';
import { LiveActivityPanel, ReportsHubPanel, TeamWorkloadPanel } from '../components/LowerPanels';
import { useDashboardPeriod } from '../hooks/useDashboardPeriod';
import { useCrmReportQuery } from '../hooks/useCrmReportQuery';
import {
  useDashboardJobCounts,
  useDashboardPendingQuoteStats,
} from '../hooks/useDashboardJobCounts';
import { isoDate } from '../utils/dashboardFormat';

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
  const jobCounts = useDashboardJobCounts(period);
  const quoteStats = useDashboardPendingQuoteStats(period);
  const invoicesQuery = useInvoices({ page: 1, limit: 8 });
  const overdueQuery = useOverdueInvoices();
  const agingQuery = useArAging({ as_of: range.to });
  const monthlySales = useCrmReportQuery('monthly_sales', revenueRange);
  const topCustomers = useCrmReportQuery('top_customers', revenueRange);
  const customerRevenue = useCrmReportQuery('customer_revenue', revenueRange);
  const tradeLane = useCrmReportQuery('trade_lane', tradeLaneRange);

  const topCustomerRows = useMemo(() => {
    const primary = topCustomers.data?.rows ?? [];
    const secondary = customerRevenue.data?.rows ?? [];
    if (primary.length) return primary;
    if (secondary.length) return secondary;

    // Live fallback: roll up recent invoices by party (avoids hardcoded Customer 1/2/3).
    const invoices = invoicesQuery.data?.invoices ?? [];
    const byParty = new Map<
      string,
      { customer_name: string; party_id: string; revenue: number; jobs: number }
    >();
    for (const inv of invoices) {
      const partyId = String(inv.party_id || '').trim();
      const name = String(inv.party_name || '').trim();
      if (!partyId && !name) continue;
      const key = partyId || name;
      const prev = byParty.get(key);
      const amount = Number(inv.total_amount ?? 0) || 0;
      if (prev) {
        prev.revenue += amount;
        prev.jobs += 1;
        if (!prev.customer_name && name) prev.customer_name = name;
      } else {
        byParty.set(key, {
          party_id: partyId,
          customer_name: name || partyId,
          revenue: amount,
          jobs: 1,
        });
      }
    }
    return [...byParty.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((row) => ({
        customer_name: row.customer_name,
        party_id: row.party_id,
        customer_id: row.party_id,
        revenue: row.revenue,
        amount: row.revenue,
        jobs: row.jobs,
      }));
  }, [
    topCustomers.data?.rows,
    customerRevenue.data?.rows,
    invoicesQuery.data?.invoices,
  ]);
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

  const deliveredJobs = jobCounts.data?.delivered ?? 0;
  const completedJobs = jobCounts.data?.completed ?? 0;
  const deliveredBars = useMemo(() => {
    const delivered = deliveredJobs;
    const completed = completedJobs;
    const inProgress = jobCounts.data?.inProgress ?? 0;
    return [delivered, completed, inProgress].filter((v) => v > 0);
  }, [deliveredJobs, completedJobs, jobCounts.data?.inProgress]);

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
          counts={jobCounts.data}
          invoicesOverdue={overdueQuery.data?.length ?? 0}
          loading={jobCounts.isLoading}
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
          deliveredJobs={deliveredJobs}
          completedJobs={completedJobs}
          deliveredBars={deliveredBars}
          loadingJobs={jobCounts.isLoading}
          loadingQuotes={quoteStats.isLoading}
          loadingReceivables={agingQuery.isLoading}
          loadingDelivered={jobCounts.isLoading}
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
            customerRows={topCustomerRows}
            isLoading={
              monthlySales.isLoading ||
              (topCustomers.isLoading && customerRevenue.isLoading)
            }
            isError={
              monthlySales.isError && topCustomers.isError && customerRevenue.isError
            }
          />
          <TradeLanePanel
            rows={tradeLane.data?.rows ?? []}
            isLoading={tradeLane.isLoading}
            isError={tradeLane.isError}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TeamWorkloadPanel period={period} />
          <LiveActivityPanel
            items={notifications.data?.items ?? []}
            isLoading={notifications.isLoading}
            isError={notifications.isError}
          />
        </div>

        <FavouritesPanel />
        <ReportsHubPanel />
      </div>
    </div>
  );
}
