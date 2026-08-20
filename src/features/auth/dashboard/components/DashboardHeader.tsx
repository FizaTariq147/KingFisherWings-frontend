import { Link } from 'react-router-dom';
import type { DashboardPeriod } from '../utils/dashboardFormat';
import { formatDashboardDate, greetingForHour, firstName } from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';

const PERIODS: { id: DashboardPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

export function DashboardHeader({
  userName,
  pendingQuotes,
  customsHolds,
  period,
  onPeriodChange,
}: {
  userName?: string;
  pendingQuotes: number;
  customsHolds: number;
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
}) {
  const hour = new Date().getHours();
  const quoteBit =
    pendingQuotes > 0
      ? `${pendingQuotes} quotation${pendingQuotes === 1 ? '' : 's'} ${pendingQuotes === 1 ? 'is' : 'are'} waiting on your approval`
      : 'No quotations waiting on approval';
  const customsBit =
    customsHolds > 0
      ? `${customsHolds} shipment${customsHolds === 1 ? '' : 's'} ${customsHolds === 1 ? 'is' : 'are'} held at customs`
      : 'no shipments held at customs';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--color-neutral-400)]">
          {formatDashboardDate()}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)] sm:text-[28px]">
          {greetingForHour(hour)}, {firstName(userName)}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          {quoteBit} and {customsBit}.
        </p>
      </div>
      <div className="inline-flex shrink-0 rounded-full border border-[var(--color-neutral-200)] bg-white p-1 shadow-sm">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPeriodChange(item.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              period === item.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DashboardAlertPills({
  customsHold,
  docsPending,
  invoicesOverdue,
}: {
  customsHold: number;
  docsPending: number;
  invoicesOverdue: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <AlertPill
        to="/jobs/sea-import"
        label="Held at customs"
        count={customsHold}
        tone="orange"
      />
      <AlertPill
        to="/jobs/air-export"
        label="Docs pending"
        count={docsPending}
        tone="rose"
      />
      <AlertPill
        to="/invoices/overdue"
        label="Invoices overdue"
        count={invoicesOverdue}
        tone="peach"
      />
    </div>
  );
}

function AlertPill({
  to,
  label,
  count,
  tone,
}: {
  to: string;
  label: string;
  count: number;
  tone: 'orange' | 'rose' | 'peach';
}) {
  const tones = {
    orange: 'bg-[#FFF1E6] text-[#C7590F]',
    rose: 'bg-[#FCEBEC] text-[#C6303E]',
    peach: 'bg-[#FFF6ED] text-[#B7791F]',
  };
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
        tones[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
      <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold">{count}</span>
    </Link>
  );
}
