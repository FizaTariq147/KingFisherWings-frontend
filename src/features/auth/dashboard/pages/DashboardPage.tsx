import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useInvoices, useOverdueInvoices } from '@/features/invoices/hooks/useInvoices';
import { useArAging } from '@/features/arApAging/hooks/useArApAging';
import { useMisOperational } from '@/features/glMisDashboard/hooks/useGlMis';
import { useCrmFollowUps, usePatchCrmFollowUp } from '@/features/crm/hooks/useCrmFollowUps';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useSavedReports } from '@/features/glSavedReports/hooks/useSavedReports';
import { SAVED_REPORT_TYPE_LABELS } from '@/features/glSavedReports/constants/savedReport.constants';
import type { AgingLine } from '@/features/arApAging/types/arApAging.types';
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

function sumAging(lines: AgingLine[]): AgingLine {
  return lines.reduce(
    (acc, line) => ({
      current: acc.current + (line.current || 0),
      days_1_30: acc.days_1_30 + (line.days_1_30 || 0),
      days_31_60: acc.days_31_60 + (line.days_31_60 || 0),
      days_61_90: acc.days_61_90 + (line.days_61_90 || 0),
      days_over_90: acc.days_over_90 + (line.days_over_90 || 0),
      total: acc.total + (line.total || 0),
    }),
    {
      current: 0,
      days_1_30: 0,
      days_31_60: 0,
      days_61_90: 0,
      days_over_90: 0,
      total: 0,
    },
  );
}

const PERIOD_LABEL: Record<string, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
};

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { period, setPeriod, range } = useDashboardPeriod();
  const today = isoDate(new Date());

  const jobsQuery = useJobs({ page: 1, limit: 50, order: 'desc' });
  const jobCounts = useDashboardJobCounts();
  const quoteStats = useDashboardPendingQuoteStats();
  const invoicesQuery = useInvoices({ page: 1, limit: 8 });
  const overdueQuery = useOverdueInvoices();
  const agingQuery = useArAging({});
  const operational = useMisOperational({ from_date: range.from, to_date: range.to });
  const monthlySales = useCrmReportQuery('monthly_sales', range);
  const topCustomers = useCrmReportQuery('top_customers', range);
  const tradeLane = useCrmReportQuery('trade_lane', range);
  const followUps = useCrmFollowUps({ page: 1, limit: 10, from: today, to: today });
  const patchFollowUp = usePatchCrmFollowUp();
  const notifications = useNotifications({ page: 1, limit: 8 });
  const savedReports = useSavedReports();

  const agingTotals = useMemo(() => {
    if (agingQuery.data?.totals) return agingQuery.data.totals;
    return sumAging(agingQuery.data?.lines ?? []);
  }, [agingQuery.data]);

  const receivables = agingTotals.total || 0;
  const agingBars = [
    agingTotals.current,
    agingTotals.days_1_30,
    agingTotals.days_31_60,
    agingTotals.days_61_90,
    agingTotals.days_over_90,
  ];

  const jobBars = jobCounts.data
    ? [
        jobCounts.data.byStatus.IN_PROGRESS ?? 0,
        jobCounts.data.byStatus.CUSTOMS_CLEARANCE ?? 0,
        jobCounts.data.byStatus.DOCS_PENDING ?? 0,
        jobCounts.data.byStatus.BOOKING_CONFIRMED ?? 0,
      ]
    : [];

  const quoteBars = quoteStats.data
    ? Object.values(quoteStats.data.byStatus)
    : [];

  const onTimePct = useMemo(() => {
    const rows = operational.data?.rows ?? [];
    for (const row of rows) {
      const n = pickNumber(row, [
        'on_time',
        'ontime',
        'on_time_pct',
        'on_time_percent',
        'otp',
        'delivery_otp',
      ]);
      if (n == null) continue;
      return n <= 1 ? n * 100 : n;
    }
    return null;
  }, [operational.data]);

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
          jobBars={jobBars}
          pendingQuotes={quoteStats.data?.totalPending ?? 0}
          quoteBars={quoteBars}
          receivables={receivables}
          agingBars={agingBars}
          onTimePct={onTimePct}
          loading={jobCounts.isLoading || quoteStats.isLoading || agingQuery.isLoading}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
          <ActiveShipmentsPanel
            jobs={jobsQuery.data?.jobs ?? []}
            isLoading={jobsQuery.isLoading}
            isError={jobsQuery.isError}
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

        <ReportsHubPanel
          scheduled={(savedReports.data ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            type: SAVED_REPORT_TYPE_LABELS[r.report_type] ?? r.report_type,
          }))}
          isLoading={savedReports.isLoading}
          isError={savedReports.isError}
          periodLabel={PERIOD_LABEL[period] ?? 'This month'}
          onGenerate={() => navigate('/gl/reports')}
        />
      </div>
    </div>
  );
}
