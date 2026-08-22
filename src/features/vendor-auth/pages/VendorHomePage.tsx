import { useEffect, useMemo, useState } from 'react';
import { PortalAnimatedPage, PortalLoadingState } from '@/features/portal-auth/components/portal-ui';
import { useVendorCreditAging } from '@/features/vendor-credit/hooks/useVendorCredit';
import { useVendorDisputes } from '@/features/vendor-disputes/hooks/useVendorDisputes';
import { useVendorInvoiceSummary } from '@/features/vendor-invoices/hooks/useVendorInvoices';
import { useVendorSchedule } from '@/features/vendor-schedule/hooks/useVendorSchedule';
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

  const summary = useVendorInvoiceSummary();
  const schedule = useVendorSchedule();
  const aging = useVendorCreditAging();
  const disputes = useVendorDisputes({ page: 1, limit: 5 });

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
    void summary.refetch();
    void schedule.refetch();
    void aging.refetch();
    void disputes.refetch();
  };

  const upcoming = schedule.data?.items ?? [];
  const openInvoice = upcoming.find((item) => item.overdue) ?? upcoming[0];

  const tasks = useMemo((): VendorTaskItem[] => {
    const list: VendorTaskItem[] = [];
    const packing = upcoming.find((item) => item.overdue) ?? upcoming[0];
    if (packing) {
      list.push({
        id: `pack-${packing.id}`,
        label: `Upload missing packing list for ${packing.number}`,
        done: false,
        href: `/vendor/invoices/${packing.id}`,
      });
    }
    list.push({
      id: 'bank-details',
      label: 'Confirm bank details for upcoming payment',
      done: true,
      href: '/vendor/account',
    });
    const dispute = disputes.data?.items?.[0];
    if (dispute) {
      list.push({
        id: `dispute-${dispute.id}`,
        label: `Respond to dispute ${dispute.invoiceNumber || `DSP-${dispute.id.slice(0, 8)}`}`,
        done: false,
        href: '/vendor/disputes',
      });
    }
    return list.slice(0, 5);
  }, [upcoming, disputes.data?.items]);

  if (loading && !user) {
    return <PortalLoadingState label="Loading profile…" />;
  }

  const isRefreshing = summary.isFetching || schedule.isFetching || aging.isFetching;
  const dataLoading = summary.isLoading || schedule.isLoading || aging.isLoading;
  const partyName = user?.party?.name?.trim();

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

      {(summary.isError || schedule.isError || aging.isError) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {vendorErrorMessage(summary.error || schedule.error || aging.error)}
          <button type="button" className="ml-3 text-xs font-semibold underline" onClick={refresh}>
            Retry
          </button>
        </div>
      ) : null}

      <VendorDashboardKpiRow
        invoiceTotal={summary.data?.total ?? 0}
        dueOpen={schedule.data?.dueCount ?? 0}
        overdue={schedule.data?.overdueCount ?? 0}
        agingOutstanding={aging.data?.total ?? summary.data?.outstanding ?? 0}
        paid={summary.data?.paid ?? 0}
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
            overdueCount={schedule.data?.overdueCount ?? 0}
            loading={schedule.isLoading}
          />
          <VendorTodoPanel tasks={tasks} loading={dataLoading} />
        </div>
      </div>
    </PortalAnimatedPage>
  );
}
