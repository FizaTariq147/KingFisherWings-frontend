import { useEffect, useMemo, useState } from 'react';
import { usePortalAuthStore } from '../store/portalAuthStore';
import { portalAuthService } from '../services/portalAuth.service';
import {
  usePortalShipmentSummary,
  usePortalShipments,
} from '@/features/portal-shipments/hooks/usePortalShipments';
import {
  usePortalQuotationSummary,
  usePortalQuotations,
} from '@/features/portal-quotations/hooks/usePortalQuotations';
import { usePortalDashboard, usePortalTasks } from '@/features/portal-dashboard/hooks/usePortalDashboard';
import { PortalAnimatedPage, PortalLoadingState } from '../components/portal-ui';
import {
  PortalDashboardAlertPills,
  PortalDashboardHeader,
} from '../components/portal-dashboard/PortalDashboardHeader';
import { PortalDashboardKpiRow } from '../components/portal-dashboard/PortalDashboardKpiRow';
import { PortalActiveShipmentsPanel } from '../components/portal-dashboard/PortalActiveShipmentsPanel';
import { PortalPendingQuotesPanel } from '../components/portal-dashboard/PortalPendingQuotesPanel';
import { PortalTodaysTasksPanel } from '../components/portal-dashboard/PortalTodaysTasksPanel';
import {
  alertCountFromDashboard,
  inPeriod,
  isActiveShipment,
  isCustomsHold,
  isDocsPending,
  isOpenQuote,
  type PortalDashboardPeriod,
  type PortalTaskItem,
} from '../utils/portalDashboardFormat';
import { dashboardBarsFromStatusMap } from '@/lib/dashboardKpiBars';
import { usePortalInvoiceSummary } from '@/features/portal-invoices/hooks/usePortalInvoices';
import { getServerErrorMessage } from '@/lib/validation';

/** Prefer the first positive KPI; otherwise the first defined value (including 0). */
function coalesceCount(...candidates: Array<number | undefined>): number {
  for (const value of candidates) {
    if (value != null && value > 0) return value;
  }
  for (const value of candidates) {
    if (value != null) return value;
  }
  return 0;
}

const PERIOD_CAPTION: Record<PortalDashboardPeriod, string> = {
  today: 'today',
  week: 'last 7 days',
  month: 'month to date',
};

export default function PortalHomePage() {
  const user = usePortalAuthStore((s) => s.user);
  const setUser = usePortalAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!user);
  const [period, setPeriod] = useState<PortalDashboardPeriod>('month');

  const dashboard = usePortalDashboard(period);
  const portalTasks = usePortalTasks(period);
  const shipmentSummary = usePortalShipmentSummary(period);
  const quoteSummary = usePortalQuotationSummary(period);
  const recentShipments = usePortalShipments({ page: 1, limit: 20, order: 'desc' });
  const recentQuotes = usePortalQuotations({ page: 1, limit: 50, order: 'desc' });
  const invoiceSummary = usePortalInvoiceSummary(period);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await portalAuthService.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load profile.');
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
    void portalTasks.refetch();
    void shipmentSummary.refetch();
    void quoteSummary.refetch();
    void invoiceSummary.refetch();
    void recentShipments.refetch();
    void recentQuotes.refetch();
  };

  const shipmentItems = useMemo(() => recentShipments.data?.items ?? [], [recentShipments.data?.items]);
  const quoteItems = useMemo(() => recentQuotes.data?.items ?? [], [recentQuotes.data?.items]);

  const listActiveShipments = useMemo(
    () => shipmentItems.filter((item) => isActiveShipment(item.status)).length,
    [shipmentItems],
  );
  const listOpenQuotes = useMemo(
    () => quoteItems.filter((item) => isOpenQuote(item.status)).length,
    [quoteItems],
  );

  // Prefer dedicated summary endpoints; dashboard aggregate is fallback; list counts last.
  // coalesceCount avoids a mapped `0` from one source blocking a real value from another.
  const shipmentTotal = coalesceCount(
    shipmentSummary.data?.total,
    dashboard.data?.shipmentsTotal,
    recentShipments.data?.meta.total,
  );
  const shipmentActive = coalesceCount(
    shipmentSummary.data?.active,
    dashboard.data?.shipmentsActive,
    listActiveShipments,
  );
  const quoteOpen = coalesceCount(
    quoteSummary.data?.open,
    dashboard.data?.quotationsOpen,
    listOpenQuotes,
  );
  const outstanding = coalesceCount(
    invoiceSummary.data?.outstanding,
    dashboard.data?.invoicesOutstanding,
  );
  const overdue = coalesceCount(
    invoiceSummary.data?.overdue,
    dashboard.data?.invoicesOverdue,
  );
  const invoiceCount = coalesceCount(
    invoiceSummary.data?.total,
    dashboard.data?.invoicesTotal,
  );

  const shipmentsKpiLoading =
    shipmentSummary.isLoading &&
    dashboard.isLoading &&
    shipmentSummary.data == null &&
    dashboard.data == null;
  const quotesKpiLoading =
    quoteSummary.isLoading &&
    dashboard.isLoading &&
    quoteSummary.data == null &&
    dashboard.data == null;
  const invoicesKpiLoading =
    invoiceSummary.isLoading &&
    dashboard.isLoading &&
    invoiceSummary.data == null &&
    dashboard.data == null;

  const onTimePct = useMemo(() => {
    const pct = dashboard.data?.onTime?.pct;
    if (pct == null || !Number.isFinite(pct)) return null;
    return pct <= 1 && pct >= 0 ? Math.round(pct * 100) : Math.round(pct);
  }, [dashboard.data?.onTime?.pct]);

  const shipmentBars = useMemo(
    () => dashboardBarsFromStatusMap(shipmentSummary.data?.byStatus),
    [shipmentSummary.data?.byStatus],
  );
  const quoteBars = useMemo(
    () => dashboardBarsFromStatusMap(quoteSummary.data?.byStatus),
    [quoteSummary.data?.byStatus],
  );
  const invoiceBars = useMemo(
    () => dashboardBarsFromStatusMap(invoiceSummary.data?.byStatus),
    [invoiceSummary.data?.byStatus],
  );
  const onTimeBars = useMemo(() => {
    const ot = dashboard.data?.onTime;
    if (ot?.delivered != null || ot?.total != null) {
      const delivered = ot.delivered ?? 0;
      const late = Math.max(0, (ot.total ?? delivered) - delivered);
      return [delivered, late].filter((v) => v > 0);
    }
    const byStatus = shipmentSummary.data?.byStatus;
    const statusBars = dashboardBarsFromStatusMap(byStatus);
    if (statusBars.length >= 2) return statusBars;
    return [
      shipmentSummary.data?.delivered ?? 0,
      shipmentSummary.data?.active ?? 0,
      shipmentSummary.data?.onHold ?? 0,
    ].filter((value) => value > 0);
  }, [dashboard.data?.onTime, shipmentSummary.data]);

  const recentActive = useMemo(
    () =>
      shipmentItems.filter(
        (item) => isActiveShipment(item.status) && inPeriod(item.updatedAt, period),
      ).length,
    [shipmentItems, period],
  );
  const agingQuotes = useMemo(
    () =>
      quoteItems.filter((item) => {
        if (!isOpenQuote(item.status)) return false;
        const ts = Date.parse(item.createdAt || item.validUntil || '');
        if (Number.isNaN(ts)) return false;
        return (Date.now() - ts) / 86_400_000 >= 5;
      }).length,
    [quoteItems],
  );

  const listCustomsHolds = useMemo(
    () => shipmentItems.filter((item) => isCustomsHold(item.status)).length,
    [shipmentItems],
  );
  const listDocsPending = useMemo(
    () => shipmentItems.filter((item) => isDocsPending(item.status)).length,
    [shipmentItems],
  );

  const customsHolds =
    alertCountFromDashboard(dashboard.data?.alerts, ['customs', 'hold']) ?? listCustomsHolds;
  const docsPending =
    alertCountFromDashboard(dashboard.data?.alerts, ['doc', 'document']) ?? listDocsPending;

  const tasks = useMemo((): PortalTaskItem[] => {
    const fromApi = portalTasks.data?.length
      ? portalTasks.data
      : dashboard.data?.tasksPreview;
    if (!fromApi?.length) return [];
    return fromApi.map((t) => ({
      id: t.id,
      label: t.label,
      done: t.done,
      href: t.href,
    }));
  }, [portalTasks.data, dashboard.data?.tasksPreview]);

  const dataLoading =
    dashboard.isLoading ||
    portalTasks.isLoading ||
    shipmentSummary.isLoading ||
    quoteSummary.isLoading ||
    invoiceSummary.isLoading ||
    recentShipments.isLoading ||
    recentQuotes.isLoading;

  const widgetError =
    dashboard.isError ||
    portalTasks.isError ||
    shipmentSummary.isError ||
    quoteSummary.isError ||
    invoiceSummary.isError
      ? getServerErrorMessage(
          dashboard.error ||
            portalTasks.error ||
            shipmentSummary.error ||
            quoteSummary.error ||
            invoiceSummary.error,
        ) || 'Could not load dashboard widgets.'
      : null;

  if (loading && !user) {
    return <PortalLoadingState label="Loading profile…" />;
  }

  return (
    <PortalAnimatedPage className="space-y-4">
      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {widgetError ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {widgetError}
          <button type="button" className="ml-3 text-xs font-semibold underline" onClick={refresh}>
            Retry
          </button>
        </div>
      ) : null}

      <PortalDashboardHeader
        userName={user?.fullName}
        email={user?.email}
        pendingQuotes={quoteOpen}
        customsHolds={customsHolds}
        period={period}
        onPeriodChange={setPeriod}
      />

      <PortalDashboardAlertPills
        customsHold={customsHolds}
        docsPending={docsPending}
        invoicesOverdue={overdue}
      />

      <PortalDashboardKpiRow
        activeShipments={shipmentActive}
        shipmentTotal={shipmentTotal}
        shipmentBars={shipmentBars}
        recentActive={recentActive}
        pendingQuotes={quoteOpen}
        quoteBars={quoteBars}
        agingQuotes={agingQuotes}
        outstanding={outstanding}
        overdue={overdue}
        invoiceCount={invoiceCount}
        invoiceBars={invoiceBars}
        onTimePct={onTimePct}
        onTimeBars={onTimeBars}
        onTimeCaption={PERIOD_CAPTION[period]}
        loadingShipments={shipmentsKpiLoading}
        loadingQuotes={quotesKpiLoading}
        loadingInvoices={invoicesKpiLoading}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
        <PortalActiveShipmentsPanel
          items={shipmentItems}
          loading={recentShipments.isLoading}
          error={recentShipments.isError}
        />
        <div className="flex flex-col gap-4">
          <PortalPendingQuotesPanel
            items={quoteItems}
            openCount={quoteOpen}
            loading={recentQuotes.isLoading}
            error={recentQuotes.isError}
          />
          <PortalTodaysTasksPanel
            tasks={tasks}
            loading={portalTasks.isLoading || (dashboard.isLoading && !portalTasks.data)}
            error={portalTasks.isError && !dashboard.data?.tasksPreview}
          />
        </div>
      </div>
    </PortalAnimatedPage>
  );
}
