import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, FileText, Receipt, Ship } from 'lucide-react';
import { compactMoney } from '../../utils/portalDashboardFormat';
import { cn } from '@/lib/utils';
import { dashType } from '@/lib/dashboardTypography';
import { DashboardKpiMiniBars } from '@/lib/DashboardKpiMiniBars';
import { DASHBOARD_KPI_THEMES } from '@/lib/dashboardKpiThemes';

const KPI_THEMES = {
  shipments: DASHBOARD_KPI_THEMES.orange,
  quotes: DASHBOARD_KPI_THEMES.gold,
  outstanding: DASHBOARD_KPI_THEMES.navy,
  onTime: DASHBOARD_KPI_THEMES.green,
} as const;

function TrendPill({
  children,
  tone,
}: {
  children: string;
  tone: 'positive' | 'warning';
}) {
  return (
    <span
      className={cn(
        dashType.kpi.badge,
        tone === 'warning' ? 'bg-[#FDECDC] text-[#E07A2F]' : 'bg-[#E7F6EC] text-[#3BA066]',
      )}
    >
      {children}
    </span>
  );
}

function KpiCard({
  to,
  label,
  value,
  unit,
  caption,
  badge,
  badgeTone = 'positive',
  bars,
  theme,
  Icon,
  loading,
}: {
  to: string;
  label: string;
  value: string | null;
  unit?: string;
  caption: string;
  badge?: string | null;
  badgeTone?: 'positive' | 'warning';
  bars: number[];
  theme: (typeof KPI_THEMES)[keyof typeof KPI_THEMES];
  Icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <Link to={to} className="block h-full min-w-0">
      <article className={cn(dashType.kpi.card, theme.card)}>
        <div className="flex items-start justify-between gap-3">
          <p className={cn(dashType.kpi.label, theme.label)}>{label}</p>
          <div className="flex shrink-0 items-center gap-2">
            {!loading && badge ? <TrendPill tone={badgeTone}>{badge}</TrendPill> : null}
            <span className={cn(dashType.kpi.iconWrap, theme.icon)}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
        {loading || value == null ? (
          <div className="mt-3 h-8 w-20 animate-pulse rounded bg-[var(--color-neutral-100)]" />
        ) : (
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className={cn(dashType.kpi.value, theme.value)}>{value}</p>
            {unit ? <p className={cn(dashType.kpi.unit, theme.unit)}>{unit}</p> : null}
          </div>
        )}
        <DashboardKpiMiniBars values={bars} palette={theme.bars} loading={loading} />
        <p className={cn(dashType.kpi.caption, theme.caption)}>
          {loading ? 'Loading…' : caption}
        </p>
      </article>
    </Link>
  );
}

export function PortalDashboardKpiRow({
  activeShipments,
  shipmentTotal,
  shipmentBars,
  recentActive,
  pendingQuotes,
  quoteBars,
  agingQuotes,
  outstanding,
  overdue,
  invoiceCount,
  invoiceBars,
  onTimePct,
  onTimeBars,
  loadingShipments,
  loadingQuotes,
  loadingInvoices,
}: {
  activeShipments: number;
  shipmentTotal: number;
  shipmentBars: number[];
  recentActive: number;
  pendingQuotes: number;
  quoteBars: number[];
  agingQuotes: number;
  outstanding: number;
  overdue: number;
  invoiceCount: number;
  invoiceBars: number[];
  onTimePct: number | null;
  onTimeBars: number[];
  loadingShipments: boolean;
  loadingQuotes: boolean;
  loadingInvoices: boolean;
}) {
  const deliveryValue = onTimePct == null ? null : String(Math.round(onTimePct));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        to="/portal/shipments"
        label="Active shipments"
        value={loadingShipments ? null : String(activeShipments)}
        unit="open"
        caption={`of ${shipmentTotal} total jobs`}
        badge={recentActive > 0 ? `+${recentActive}` : null}
        bars={shipmentBars}
        theme={KPI_THEMES.shipments}
        Icon={Ship}
        loading={loadingShipments}
      />
      <KpiCard
        to="/portal/quotes"
        label="Pending quotations"
        value={loadingQuotes ? null : String(pendingQuotes)}
        unit="awaiting"
        caption="awaiting your approval"
        badge={agingQuotes > 0 ? `${agingQuotes} aging` : null}
        badgeTone="warning"
        bars={quoteBars}
        theme={KPI_THEMES.quotes}
        Icon={FileText}
        loading={loadingQuotes}
      />
      <KpiCard
        to="/portal/invoices"
        label="Outstanding"
        value={loadingInvoices ? null : compactMoney(outstanding)}
        unit="outstanding"
        caption={
          invoiceCount > 0
            ? `across ${invoiceCount} invoice${invoiceCount === 1 ? '' : 's'} · ${overdue} overdue`
            : 'across open invoices'
        }
        badge={overdue > 0 ? `${overdue} overdue` : null}
        badgeTone={overdue > 0 ? 'warning' : 'positive'}
        bars={invoiceBars}
        theme={KPI_THEMES.outstanding}
        Icon={Receipt}
        loading={loadingInvoices}
      />
      <KpiCard
        to="/portal/shipments"
        label="On-time delivery"
        value={loadingShipments ? null : deliveryValue ?? '—'}
        unit={deliveryValue == null ? undefined : '%'}
        caption="last 90 days"
        badge={null}
        bars={onTimeBars}
        theme={KPI_THEMES.onTime}
        Icon={CheckCircle2}
        loading={loadingShipments}
      />
    </div>
  );
}
