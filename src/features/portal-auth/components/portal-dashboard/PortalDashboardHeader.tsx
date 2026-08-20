import { Link } from 'react-router-dom';
import type { PortalDashboardPeriod } from '../../utils/portalDashboardFormat';
import {
  formatPortalDate,
  greetingForHour,
  firstName,
} from '../../utils/portalDashboardFormat';
import { cn } from '@/lib/utils';

const PERIODS: { id: PortalDashboardPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

export function PortalDashboardHeader({
  userName,
  email,
  pendingQuotes,
  customsHolds,
  period,
  onPeriodChange,
}: {
  userName?: string;
  email?: string;
  pendingQuotes: number;
  customsHolds: number;
  period: PortalDashboardPeriod;
  onPeriodChange: (period: PortalDashboardPeriod) => void;
}) {
  const hour = new Date().getHours();
  const quoteBit =
    pendingQuotes > 0
      ? `${pendingQuotes} quotation${pendingQuotes === 1 ? '' : 's'} awaiting your approval`
      : 'No quotations awaiting approval';
  const customsBit =
    customsHolds > 0
      ? `${customsHolds} shipment${customsHolds === 1 ? '' : 's'} held at customs`
      : 'no shipments held at customs';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9AA8B5]">
          {formatPortalDate()}
        </p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-[#0A2942]">
          {greetingForHour(hour)}, {firstName(userName, email)}
        </h1>
        <p className="mt-1.5 text-sm text-[#7A8A98]">
          {quoteBit} and {customsBit}.
        </p>
      </div>
      <div className="inline-flex shrink-0 self-start rounded-full bg-white p-1 shadow-[0_8px_24px_rgba(10,41,66,0.06)]">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPeriodChange(item.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              period === item.id
                ? 'bg-[#0A2942] text-white'
                : 'text-[#5B6B7A] hover:bg-[#F4F7F9]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PortalDashboardAlertPills({
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
        count={customsHold}
        label="held at customs"
        tone="orange"
        to="/portal/shipments"
      />
      <AlertPill
        count={docsPending}
        label={docsPending === 1 ? 'document missing' : 'documents missing'}
        tone="rose"
        to="/portal/documents"
      />
      <AlertPill
        count={invoicesOverdue}
        label={invoicesOverdue === 1 ? 'invoice overdue' : 'invoices overdue'}
        tone="cyan"
        to="/portal/invoices"
      />
    </div>
  );
}

function AlertPill({
  count,
  label,
  tone,
  to,
}: {
  count: number;
  label: string;
  tone: 'orange' | 'rose' | 'cyan';
  to: string;
}) {
  const styles = {
    orange: { wrap: 'bg-[#FFF1E6] text-[#C7590F]', dot: 'bg-[#FF751F]' },
    rose: { wrap: 'bg-[#FCEBEC] text-[#C6303E]', dot: 'bg-[#E85D6C]' },
    cyan: { wrap: 'bg-[#E8F7F8] text-[#1A7A86]', dot: 'bg-[#2BB3C0]' },
  }[tone];

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
        styles.wrap,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {count} {label}
    </Link>
  );
}
