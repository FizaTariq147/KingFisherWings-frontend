import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { FileClock, Receipt, ShieldAlert } from 'lucide-react';
import type { DashboardPeriod } from '../utils/dashboardFormat';
import { formatDashboardDate, greetingForHour, firstName } from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';
import { dashType } from '@/lib/dashboardTypography';

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
        <p className={dashType.header.date}>{formatDashboardDate()}</p>
        <h1 className={dashType.header.title}>
          {greetingForHour(hour)}, {firstName(userName)}
        </h1>
        <p className={dashType.header.subtitle}>
          {quoteBit} and {customsBit}.
        </p>
      </div>
      <div className={dashType.header.periodWrap}>
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPeriodChange(item.id)}
            className={cn(
              dashType.header.periodBtn,
              period === item.id ? dashType.header.periodBtnActive : dashType.header.periodBtnIdle,
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
        icon={ShieldAlert}
      />
      <AlertPill
        to="/jobs/air-export"
        label="Docs pending"
        count={docsPending}
        tone="rose"
        icon={FileClock}
      />
      <AlertPill
        to="/invoices/overdue"
        label="Invoices overdue"
        count={invoicesOverdue}
        tone="peach"
        icon={Receipt}
      />
    </div>
  );
}

function AlertPill({
  to,
  label,
  count,
  tone,
  icon: Icon,
}: {
  to: string;
  label: string;
  count: number;
  tone: 'orange' | 'rose' | 'peach';
  icon: LucideIcon;
}) {
  const tones = {
    orange: 'bg-[#FFF1E6] text-[#C7590F]',
    rose: 'bg-[#FCEBEC] text-[#C6303E]',
    peach: 'bg-[#FFF6ED] text-[#B7791F]',
  };
  return (
    <Link
      to={to}
      className={cn(dashType.alertPill.base, tones[tone])}
    >
      <Icon size={14} strokeWidth={2.25} className="shrink-0 opacity-90" aria-hidden />
      {label}
      <span className={dashType.alertPill.count}>{count}</span>
    </Link>
  );
}
