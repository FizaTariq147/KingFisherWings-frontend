import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Ban,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileClock,
  PauseCircle,
  PlayCircle,
  Receipt,
} from 'lucide-react';
import type { JobDashboardCounts } from '@/features/jobs/types/jobDashboard.types';
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

type StatusPill = {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  tone: string;
  count: number | string;
};

export function DashboardAlertPills({
  counts,
  invoicesOverdue,
  loading,
}: {
  counts?: JobDashboardCounts | null;
  invoicesOverdue: number;
  loading?: boolean;
}) {
  const n = (key: keyof JobDashboardCounts) =>
    loading ? '…' : (counts?.[key] ?? 0);
  const onHoldCount = loading
    ? '…'
    : (counts?.onHold ?? counts?.customsHold ?? 0);

  const pills: StatusPill[] = [
    {
      key: 'onHold',
      label: 'On hold',
      to: '/jobs/on-hold',
      icon: PauseCircle,
      tone: 'bg-[#FFF1E6] text-[#C7590F]',
      count: onHoldCount,
    },
    {
      key: 'delayed',
      label: 'Delayed',
      to: '/management/all-jobs-mis?category=delayed',
      icon: Clock3,
      tone: 'bg-[#FCEBEC] text-[#C6303E]',
      count: n('delayed'),
    },
    {
      key: 'inProgress',
      label: 'In progress',
      to: '/management/all-jobs-mis?category=in_progress',
      icon: PlayCircle,
      tone: 'bg-[#FFF4ED] text-[#FF751F]',
      count: n('inProgress'),
    },
    {
      key: 'open',
      label: 'Open',
      to: '/management/all-jobs-mis?category=open',
      icon: CircleDot,
      tone: 'bg-[#E8EEF4] text-[#2C557A]',
      count: n('open'),
    },
    {
      key: 'completed',
      label: 'Completed',
      to: '/management/all-jobs-mis?category=completed,closed',
      icon: CheckCircle2,
      tone: 'bg-[#E7F6EC] text-[#1B8A4A]',
      count: n('completed'),
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      to: '/management/all-jobs-mis?category=cancelled',
      icon: Ban,
      tone: 'bg-[#F1F5F9] text-[#475569]',
      count: n('cancelled'),
    },
    {
      key: 'docsPending',
      label: 'Docs pending',
      to: '/jobs/air-export',
      icon: FileClock,
      tone: 'bg-[#FDF2F8] text-[#9D174D]',
      count: n('docsPending'),
    },
    {
      key: 'invoicesOverdue',
      label: 'Invoices overdue',
      to: '/invoices/overdue',
      icon: Receipt,
      tone: 'bg-[#FFF6ED] text-[#B7791F]',
      count: loading ? '…' : invoicesOverdue,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <AlertPill
          key={pill.key}
          to={pill.to}
          label={pill.label}
          count={pill.count}
          tone={pill.tone}
          icon={pill.icon}
        />
      ))}
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
  count: number | string;
  tone: string;
  icon: LucideIcon;
}) {
  return (
    <Link to={to} className={cn(dashType.alertPill.base, tone)}>
      <Icon size={14} strokeWidth={2.25} className="shrink-0 opacity-90" aria-hidden />
      {label}
      <span className={dashType.alertPill.count}>{count}</span>
    </Link>
  );
}
