import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Calendar, CreditCard, FileText, Wallet } from 'lucide-react';
import { formatVendorAmount } from '../../utils/vendorDashboardFormat';
import { cn } from '@/lib/utils';
import { dashType } from '@/lib/dashboardTypography';
import { DashboardKpiMiniBars } from '@/lib/DashboardKpiMiniBars';
import { DASHBOARD_KPI_THEMES } from '@/lib/dashboardKpiThemes';

const KPI_THEMES = {
  invoices: DASHBOARD_KPI_THEMES.orange,
  due: DASHBOARD_KPI_THEMES.navy,
  aging: DASHBOARD_KPI_THEMES.cyan,
  paid: DASHBOARD_KPI_THEMES.gold,
} as const;

function KpiCard({
  to,
  label,
  value,
  unit,
  caption,
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
          <span className={cn(dashType.kpi.iconWrap, theme.icon)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
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

export function VendorDashboardKpiRow({
  invoiceTotal,
  dueOpen,
  overdue,
  agingOutstanding,
  paid,
  invoiceBars,
  scheduleBars,
  agingBars,
  paidBars,
  loading,
}: {
  invoiceTotal: number;
  dueOpen: number;
  overdue: number;
  agingOutstanding: number;
  paid: number;
  invoiceBars: number[];
  scheduleBars: number[];
  agingBars: number[];
  paidBars: number[];
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        to="/vendor/invoices"
        label="Invoices"
        value={loading ? null : String(invoiceTotal)}
        unit="total"
        caption="All purchase invoices"
        bars={invoiceBars}
        theme={KPI_THEMES.invoices}
        Icon={FileText}
        loading={loading}
      />
      <KpiCard
        to="/vendor/schedule"
        label="Due / Open"
        value={loading ? null : String(dueOpen)}
        unit="open"
        caption={`${overdue} overdue`}
        bars={scheduleBars}
        theme={KPI_THEMES.due}
        Icon={Calendar}
        loading={loading}
      />
      <KpiCard
        to="/vendor/credit"
        label="Aging outstanding"
        value={loading ? null : formatVendorAmount(agingOutstanding)}
        unit="outstanding"
        caption="From aging / invoice summary"
        bars={agingBars}
        theme={KPI_THEMES.aging}
        Icon={Wallet}
        loading={loading}
      />
      <KpiCard
        to="/vendor/invoices"
        label="Paid"
        value={loading ? null : String(paid)}
        unit="this cycle"
        caption="Settled invoices"
        bars={paidBars}
        theme={KPI_THEMES.paid}
        Icon={CreditCard}
        loading={loading}
      />
    </div>
  );
}
