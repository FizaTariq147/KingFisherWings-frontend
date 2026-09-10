import { useEffect, useMemo, useState } from 'react';
import { PortalAnimatedPage, PortalLoadingState } from '@/features/portal-auth/components/portal-ui';
import { useVendorCreditAging } from '@/features/vendor-credit/hooks/useVendorCredit';
import { useVendorInvoiceSummary } from '@/features/vendor-invoices/hooks/useVendorInvoices';
import { useVendorSchedule } from '@/features/vendor-schedule/hooks/useVendorSchedule';
import {
  useVendorDashboard,
  useVendorTasks,
} from '@/features/vendor-dashboard/hooks/useVendorDashboard';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { VendorDashboardHeader } from '../components/vendor-dashboard/VendorDashboardHeader';
import { VendorDashboardKpiRow } from '../components/vendor-dashboard/VendorDashboardKpiRow';
import { VendorTodoPanel } from '../components/vendor-dashboard/VendorTodoPanel';
import {
  VendorOpenInvoicePanel,
  VendorUpcomingDuePanel,
} from '../components/vendor-dashboard/VendorUpcomingDuePanel';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import type { VendorDashboardPeriod, VendorTaskItem } from '../utils/vendorDashboardFormat';
import {
  dashboardBarsFromBuckets,
  dashboardBarsFromScheduleItems,
  dashboardBarsFromStatusMap,
} from '@/lib/dashboardKpiBars';

export default function VendorHomePage() {
  const user = useVendorAuthStore((s) => s.user);
  const setUser = useVendorAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!user);
  const [period, setPeriod] = useState<VendorDashboardPeriod>('today');

  const dashboard = useVendorDashboard(period);
  const vendorTasks = useVendorTasks(period);
  const summary = useVendorInvoiceSummary(period);
  const schedule = useVendorSchedule();
  const aging = useVendorCreditAging();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await vendorAuthService.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!cancelled && !useVendorAuthStore.getState().user) {
          setError(vendorErrorMessage(err, 'Could not load profile.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const refresh = () => {
    void dashboard.refetch();
    void vendorTasks.refetch();
    void summary.refetch();
    void schedule.refetch();
    void aging.refetch();
  };

  const upcoming = schedule.data?.items ?? [];
  const openInvoice = upcoming.find((item) => item.overdue) ?? upcoming[0];

  const tasks = useMemo((): VendorTaskItem[] => {
    const fromApi = vendorTasks.data?.length
      ? vendorTasks.data
      : dashboard.data?.tasksPreview;
    if (!fromApi?.length) return [];
    return fromApi.map((t) => ({
      id: t.id,
      label: t.label,
      done: t.done,
      href: t.href,
    }));
  }, [vendorTasks.data, dashboard.data?.tasksPreview]);

  if (loading && !user) {
    return <PortalLoadingState label="Loading profile…" />;
  }

  const isRefreshing =
    dashboard.isFetching ||
    vendorTasks.isFetching ||
    summary.isFetching ||
    schedule.isFetching ||
    aging.isFetching;
  const dataLoading =
    dashboard.isLoading ||
    vendorTasks.isLoading ||
    summary.isLoading ||
    schedule.isLoading ||
    aging.isLoading;
  const partyName = user?.party?.name?.trim();

  const kpis = dashboard.data?.kpis;
  const invoiceTotal = kpis?.invoiceTotal ?? summary.data?.total ?? 0;
  const dueOpen = kpis?.dueOpen ?? schedule.data?.dueCount ?? 0;
  const overdue = kpis?.overdue ?? schedule.data?.overdueCount ?? 0;
  const agingOutstanding =
    kpis?.agingOutstanding ?? kpis?.outstanding ?? aging.data?.total ?? summary.data?.outstanding ?? 0;
  const paid = kpis?.paid ?? summary.data?.paid ?? 0;

  const invoiceBars = useMemo(
    () => dashboardBarsFromStatusMap(summary.data?.byStatus),
    [summary.data?.byStatus],
  );
  const scheduleBars = useMemo(
    () =>
      dashboardBarsFromScheduleItems(upcoming, [
        schedule.data?.dueCount ?? 0,
        schedule.data?.overdueCount ?? 0,
      ]),
    [upcoming, schedule.data?.dueCount, schedule.data?.overdueCount],
  );
  const agingBars = useMemo(
    () => dashboardBarsFromBuckets(aging.data?.buckets),
    [aging.data?.buckets],
  );
  const paidBars = useMemo(() => {
    const byStatus = summary.data?.byStatus ?? {};
    const paidStatuses = Object.entries(byStatus)
      .filter(([key]) => /paid|settled|closed|complete/i.test(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, count]) => count);
    if (paidStatuses.length) return paidStatuses;
    return [summary.data?.paid ?? 0, summary.data?.outstanding ?? 0, summary.data?.overdue ?? 0].filter(
      (value) => value > 0,
    );
  }, [summary.data]);

  const widgetError =
    dashboard.isError || vendorTasks.isError || summary.isError || schedule.isError || aging.isError
      ? vendorErrorMessage(
          dashboard.error || vendorTasks.error || summary.error || schedule.error || aging.error,
        )
      : null;

  return (
    <PortalAnimatedPage className="space-y-4">
      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <VendorDashboardHeader
        userName={user?.fullName}
        email={user?.email}
        partyName={partyName}
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={refresh}
        refreshing={isRefreshing}
      />

      {widgetError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {widgetError}
          <button type="button" className="ml-3 text-xs font-semibold underline" onClick={refresh}>
            Retry
          </button>
        </div>
      ) : null}

      <VendorDashboardKpiRow
        invoiceTotal={invoiceTotal}
        dueOpen={dueOpen}
        overdue={overdue}
        agingOutstanding={agingOutstanding}
        paid={paid}
        invoiceBars={invoiceBars}
        scheduleBars={scheduleBars}
        agingBars={agingBars}
        paidBars={paidBars}
        loading={dataLoading}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
        <VendorUpcomingDuePanel
          items={upcoming}
          loading={schedule.isLoading}
          error={schedule.isError}
        />
        <div className="flex flex-col gap-4">
          <VendorOpenInvoicePanel
            item={openInvoice}
            overdueCount={overdue}
            loading={schedule.isLoading}
          />
          <VendorTodoPanel
            tasks={tasks}
            loading={vendorTasks.isLoading || (dashboard.isLoading && !vendorTasks.data)}
            error={vendorTasks.isError && !dashboard.data?.tasksPreview}
          />
        </div>
      </div>
    </PortalAnimatedPage>
  );
}
