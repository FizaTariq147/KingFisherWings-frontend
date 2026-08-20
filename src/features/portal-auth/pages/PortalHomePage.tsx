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
import { usePortalDashboard } from '@/features/portal-dashboard/hooks/usePortalDashboard';
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
  buildPortalTasks,
  isCustomsHold,
  isDocsPending,
  type PortalDashboardPeriod,
} from '../utils/portalDashboardFormat';

function displayValue(
  primary: number | undefined,
  fallback: number | undefined,
  isLoading: boolean,
): number {
  if (primary != null) return primary;
  if (fallback != null) return fallback;
  return isLoading ? 0 : 0;
}

export default function PortalHomePage() {
  const user = usePortalAuthStore((s) => s.user);
  const setUser = usePortalAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!user);
  const [period, setPeriod] = useState<PortalDashboardPeriod>('today');

  const dashboard = usePortalDashboard();
  const shipmentSummary = usePortalShipmentSummary();
  const quoteSummary = usePortalQuotationSummary();
  const recentShipments = usePortalShipments({ page: 1, limit: 20, order: 'desc' });
  const recentQuotes = usePortalQuotations({ page: 1, limit: 10, order: 'desc' });

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

  const shipmentItems = useMemo(() => recentShipments.data?.items ?? [], [recentShipments.data?.items]);

  const quoteItems = useMemo(() => recentQuotes.data?.items ?? [], [recentQuotes.data?.items]);

  const shipmentTotal = displayValue(
    dashboard.data?.shipmentsTotal ?? shipmentSummary.data?.total,
    recentShipments.data?.meta.total,
    dashboard.isLoading || shipmentSummary.isLoading || recentShipments.isLoading,
  );
  const shipmentActive = displayValue(
    dashboard.data?.shipmentsActive ?? shipmentSummary.data?.active,
    undefined,
    dashboard.isLoading || shipmentSummary.isLoading,
  );
  const quoteOpen = displayValue(
    dashboard.data?.quotationsOpen ?? quoteSummary.data?.open,
    undefined,
    dashboard.isLoading || quoteSummary.isLoading,
  );
  const outstanding = dashboard.data?.invoicesOutstanding ?? 0;
  const overdue = dashboard.data?.invoicesOverdue ?? 0;
  const delivered = dashboard.data?.shipmentsDelivered ?? shipmentSummary.data?.delivered ?? 0;
  const onTimePct =
    shipmentTotal > 0 && delivered > 0 ? Math.min(100, Math.round((delivered / shipmentTotal) * 100)) : null;

  const customsHolds = useMemo(
    () => shipmentItems.filter((item) => isCustomsHold(item.status)).length,
    [shipmentItems],
  );
  const docsPending = useMemo(
    () => shipmentItems.filter((item) => isDocsPending(item.status)).length,
    [shipmentItems],
  );
  const tasks = useMemo(() => buildPortalTasks(shipmentItems, quoteItems), [shipmentItems, quoteItems]);

  const dataLoading =
    dashboard.isLoading ||
    shipmentSummary.isLoading ||
    quoteSummary.isLoading ||
    recentShipments.isLoading ||
    recentQuotes.isLoading;

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
        pendingQuotes={quoteOpen}
        outstanding={outstanding}
        overdue={overdue}
        onTimePct={onTimePct}
        loading={dataLoading}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
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
          <PortalTodaysTasksPanel tasks={tasks} loading={dataLoading} />
        </div>
      </div>
    </PortalAnimatedPage>
  );
}
