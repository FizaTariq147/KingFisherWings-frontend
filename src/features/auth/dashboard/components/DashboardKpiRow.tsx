import { Link } from 'react-router-dom';
import { DashSkeleton } from './DashCard';
import { compactMoney } from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';
import { dashType } from '@/lib/dashboardTypography';
import { DashboardKpiMiniBars } from '@/lib/DashboardKpiMiniBars';
import { DASHBOARD_KPI_THEMES } from '@/lib/dashboardKpiThemes';

const KPI_THEMES = {
  jobs: DASHBOARD_KPI_THEMES.orange,
  quotes: DASHBOARD_KPI_THEMES.gold,
  receivables: DASHBOARD_KPI_THEMES.navy,
  delivered: DASHBOARD_KPI_THEMES.green,
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

export function DashboardKpiRow({
  activeJobs,
  inTransit,
  atOrigin,
  newJobs,
  jobBars,
  pendingQuotes,
  agingQuotes,
  oldestQuoteDays,
  quoteBars,
  receivables,
  overdue30,
  agingBars,
  deliveredJobs,
  completedJobs,
  deliveredBars,
  loadingJobs,
  loadingQuotes,
  loadingReceivables,
  loadingDelivered,
}: {
  activeJobs: number;
  inTransit: number;
  atOrigin: number;
  newJobs: number;
  jobBars: number[];
  pendingQuotes: number;
  agingQuotes: number;
  oldestQuoteDays: number;
  quoteBars: number[];
  receivables: number;
  overdue30: number;
  agingBars: number[];
  deliveredJobs: number;
  completedJobs: number;
  deliveredBars: number[];
  loadingJobs: boolean;
  loadingQuotes: boolean;
  loadingReceivables: boolean;
  loadingDelivered: boolean;
}) {
  const overdueShare =
    receivables > 0 ? Math.round((overdue30 / receivables) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        to="/management/all-jobs-mis"
        label="Active jobs"
        value={loadingJobs ? null : String(activeJobs)}
        unit="open"
        caption={`${inTransit} in transit, ${atOrigin} at origin`}
        badge={newJobs > 0 ? `+${newJobs}` : null}
        bars={jobBars}
        theme={KPI_THEMES.jobs}
        loading={loadingJobs}
      />
      <KpiCard
        to="/quotations/all?status=DRAFT"
        label="Pending quotations"
        value={loadingQuotes ? null : String(pendingQuotes)}
        unit="awaiting"
        caption={
          oldestQuoteDays > 0
            ? `Oldest open ${oldestQuoteDays} day${oldestQuoteDays === 1 ? '' : 's'}`
            : 'No aging quotations'
        }
        badge={agingQuotes > 0 ? `${agingQuotes} aging` : null}
        badgeTone="warning"
        bars={quoteBars}
        theme={KPI_THEMES.quotes}
        loading={loadingQuotes}
      />
      <KpiCard
        to="/gl/ar/aging"
        label="Receivables"
        value={loadingReceivables ? null : compactMoney(receivables)}
        unit="outstanding"
        caption={`${compactMoney(overdue30)} overdue past 30 days`}
        badge={overdueShare > 0 ? `-${overdueShare}%` : null}
        bars={agingBars}
        theme={KPI_THEMES.receivables}
        loading={loadingReceivables}
      />
      <KpiCard
        to="/management/all-jobs-mis?category=delivered"
        label="Delivered jobs"
        value={loadingDelivered ? null : String(deliveredJobs)}
        unit="delivered"
        caption={
          completedJobs > 0
            ? `${completedJobs} completed alongside delivered`
            : 'Jobs marked delivered'
        }
        badge={deliveredJobs > 0 ? `${deliveredJobs}` : null}
        bars={deliveredBars}
        theme={KPI_THEMES.delivered}
        loading={loadingDelivered}
      />
    </div>
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
  muted,
  loading,
}: {
  to: string;
  label: string;
  value: string | null;
  unit: string;
  caption: string;
  badge?: string | null;
  badgeTone?: 'positive' | 'warning';
  bars: number[];
  theme: (typeof KPI_THEMES)[keyof typeof KPI_THEMES];
  muted?: boolean;
  loading?: boolean;
}) {
  return (
    <Link to={to} className="block min-w-0">
      <article className={cn(dashType.kpi.card, theme.card)}>
        <div className="flex items-start justify-between gap-3">
          <p className={cn(dashType.kpi.label, theme.label)}>{label}</p>
          {!loading && badge ? <TrendPill tone={badgeTone}>{badge}</TrendPill> : null}
        </div>
        {value == null ? (
          <DashSkeleton className="mt-3 h-8 w-20" />
        ) : (
          <div className="mt-2 flex items-baseline gap-1.5">
            <p
              className={cn(
                dashType.kpi.value,
                muted ? 'text-[#9AA8B5]' : theme.value,
              )}
            >
              {value}
            </p>
            <p className={cn(dashType.kpi.unit, theme.unit)}>{unit}</p>
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
