import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Map,
  Play,
  Receipt,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { DashCard, DashCardHeader, DashEmpty, DashSkeleton } from './DashCard';
import { useReportsHubData } from '../hooks/useReportsHubData';
import {
  buildReportGeneratePath,
  type ReportFormat,
  type ReportHubId,
  type ReportPeriod,
} from '../utils/reportsHubPaths';
import type { AppNotification } from '@/features/notifications/types/notifications.types';
import { relativeTime } from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';
import { DASHBOARD_KPI_THEMES } from '@/lib/dashboardKpiThemes';
import { dashType } from '@/lib/dashboardTypography';
export function TeamWorkloadPanel() {
  return (
    <DashCard>
      <DashCardHeader
        title="Team workload & SLA"
        subtitle="Per-user capacity and SLA are not in the current API"
        action={
          <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-neutral-500)]">
            Unavailable
          </span>
        }
      />
      <DashEmpty>
        Team assignment counts, capacity, and SLA hit rate are not exposed by the backend yet.
        Existing jobs still list on Active shipments.
      </DashEmpty>
    </DashCard>
  );
}

export function LiveActivityPanel({
  items,
  isLoading,
  isError,
}: {
  items: AppNotification[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <DashCard>
      <DashCardHeader
        title="Live activity"
        subtitle="Staff notifications"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-success-500)]">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Notifications
          </span>
        }
      />
      {isLoading ? (
        <div className="space-y-2">
          <DashSkeleton className="h-10" />
          <DashSkeleton className="h-10" />
        </div>
      ) : isError ? (
        <DashEmpty>Unable to load notifications.</DashEmpty>
      ) : items.length === 0 ? (
        <DashEmpty>No recent notifications.</DashEmpty>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 6).map((n) => (
            <li key={n.id} className="flex items-start gap-2">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-[var(--color-neutral-300)]' : 'bg-[var(--color-secondary)]'}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--color-neutral-800)]">{n.title}</p>
                {n.body ? (
                  <p className="truncate text-[11px] text-[var(--color-neutral-400)]">{n.body}</p>
                ) : null}
              </div>
              <span className="shrink-0 text-[10px] text-[var(--color-neutral-400)]">
                {relativeTime(n.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}

type ReportCardTheme = (typeof DASHBOARD_KPI_THEMES)[keyof typeof DASHBOARD_KPI_THEMES];

type ReportCardDef = {
  id: ReportHubId;
  title: string;
  description: string;
  footer: string;
  Icon: LucideIcon;
  theme: ReportCardTheme;
  activeRing: string;
};

const REPORT_CARD_THEMES: Record<ReportHubId, { theme: ReportCardTheme; activeRing: string }> = {
  'receivables-aging': { theme: DASHBOARD_KPI_THEMES.navy, activeRing: 'ring-[#2C557A]' },
  'lane-profitability': { theme: DASHBOARD_KPI_THEMES.orange, activeRing: 'ring-[#FF751F]' },
  'operator-productivity': { theme: DASHBOARD_KPI_THEMES.green, activeRing: 'ring-[#22A35A]' },
  'customs-delay': { theme: DASHBOARD_KPI_THEMES.rose, activeRing: 'ring-[#C6303E]' },
  'monthly-volume': { theme: DASHBOARD_KPI_THEMES.purple, activeRing: 'ring-[#5B3E8C]' },
};

const REPORT_PERIOD_OPTIONS: { id: ReportPeriod; label: string }[] = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'quarter', label: 'This quarter' },
  { id: 'custom', label: 'Custom' },
];

const REPORT_FORMAT_OPTIONS: ReportFormat[] = ['PDF', 'XLSX', 'CSV'];

function periodLabel(period: ReportPeriod): string {
  return REPORT_PERIOD_OPTIONS.find((option) => option.id === period)?.label ?? 'This month';
}

function buildReportCards(stats: ReturnType<typeof useReportsHubData>['stats'], loading: boolean): ReportCardDef[] {
  const receivablesCount = stats.receivablesCount ?? 0;
  const laneCount = stats.laneCount ?? 0;
  const jobCount = stats.jobCount ?? 0;
  const customsHolds = stats.customsHolds ?? 0;
  const operatorCount = stats.operatorCount ?? 0;
  const loadingLabel = loading ? 'Loading…' : undefined;

  return [
    {
      id: 'receivables-aging',
      title: 'Receivables ageing',
      description: 'Outstanding balances bucketed 1–30–60–90 with customer context.',
      footer: loadingLabel ?? `${receivablesCount} accounts · Accounts`,
      Icon: Receipt,
      ...REPORT_CARD_THEMES['receivables-aging'],
    },
    {
      id: 'lane-profitability',
      title: 'Lane profitability',
      description: 'Revenue, cost and gross margin per trade lane and mode.',
      footer: loadingLabel ?? `${laneCount} lanes · Finance`,
      Icon: Map,
      ...REPORT_CARD_THEMES['lane-profitability'],
    },
    {
      id: 'operator-productivity',
      title: 'Operator productivity',
      description: 'Jobs handled, SLA hit rate and average clearance time per operator.',
      footer: loadingLabel ?? `${operatorCount} operators · Operations`,
      Icon: Users,
      ...REPORT_CARD_THEMES['operator-productivity'],
    },
    {
      id: 'customs-delay',
      title: 'Customs & delay analysis',
      description: 'Hold reasons, dwell time and cost impact by port and carrier.',
      footer: loadingLabel ?? `${customsHolds} holds · Documentation`,
      Icon: ShieldAlert,
      ...REPORT_CARD_THEMES['customs-delay'],
    },
    {
      id: 'monthly-volume',
      title: 'Monthly volume statement',
      description: 'TEU, tonnage and shipment counts split by customer and mode.',
      footer: loadingLabel ?? `${jobCount} jobs · Management`,
      Icon: BarChart3,
      ...REPORT_CARD_THEMES['monthly-volume'],
    },
  ];
}

function ReportTypePills<T extends string>({
  label,
  options,
  value,
  onChange,
  selectedClassName,
}: {
  label: string;
  options: readonly T[] | Array<{ id: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
  selectedClassName: string;
}) {
  const normalized = options.map((option) =>
    typeof option === 'string' ? { id: option, label: option } : option,
  );

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {normalized.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
              value === option.id
                ? selectedClassName
                : 'border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-600)] hover:border-[var(--color-neutral-300)]',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReportsHubPanel() {
  const navigate = useNavigate();
  const {
    stats,
    scheduled,
    isLoading: statsLoading,
    isScheduledLoading,
    isScheduledError,
  } = useReportsHubData();
  const reportCards = useMemo(() => buildReportCards(stats, statsLoading), [stats, statsLoading]);
  const [selectedId, setSelectedId] = useState<ReportHubId>('receivables-aging');
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [format, setFormat] = useState<ReportFormat>('PDF');

  const selected = reportCards.find((card) => card.id === selectedId) ?? reportCards[0];
  const summary = selected ? `${selected.title} · ${periodLabel(period)} · ${format}` : '';

  const handleGenerate = () => {
    if (!selected) return;
    navigate(buildReportGeneratePath(selected.id, period, format));
  };

  return (
    <DashCard>
      <DashCardHeader
        title="Reports"
        subtitle="Generate on demand or schedule delivery to a mailbox"
        action={
          <Link
            to="/gl/saved-reports"
            className="rounded-lg bg-[#FFF4ED] px-3 py-1.5 text-[11px] font-semibold text-[#FF751F] hover:bg-[#FFEBDD]"
          >
            Report builder
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {reportCards.map((card, index) => {
            const active = card.id === selectedId;
            const { theme } = card;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedId(card.id)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all lg:col-span-2',
                  index >= 3 && 'lg:col-span-3',
                  theme.card,
                  active
                    ? cn('ring-2 ring-offset-2 shadow-[0_12px_28px_rgba(10,41,66,0.14)]', card.activeRing)
                    : 'hover:shadow-[0_8px_20px_rgba(10,41,66,0.08)]',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                    theme.icon,
                  )}
                >
                  <card.Icon className="h-4 w-4" />
                </span>
                <p className={cn('mt-3', dashType.panel.title, theme.label)}>{card.title}</p>
                <p className={cn('mt-1 text-[11px] leading-relaxed', theme.caption)}>
                  {card.description}
                </p>
                <p className={cn('mt-3 text-[10px] font-medium', theme.caption)}>{card.footer}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-[var(--color-neutral-50)] p-4">
            <ReportTypePills
              label="Period"
              options={REPORT_PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
              selectedClassName="border-[#2C557A] bg-white text-[#2C557A]"
            />

            <div className="mt-4">
              <ReportTypePills
                label="Format"
                options={REPORT_FORMAT_OPTIONS}
                value={format}
                onChange={setFormat}
                selectedClassName="border-[#FF751F] bg-white text-[#FF751F]"
              />
            </div>

            {summary ? (
              <p className="mt-4 text-[11px] text-[var(--color-neutral-500)]">{summary}</p>
            ) : null}

            <button
              type="button"
              onClick={handleGenerate}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FF751F] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,117,31,0.28)] hover:bg-[#E36A12]"
            >
              <Play className="h-4 w-4 fill-current" />
              Generate report
            </button>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
              Scheduled
            </p>
            {isScheduledLoading ? (
              <DashSkeleton className="mt-2 h-24" />
            ) : isScheduledError ? (
              <p className="mt-2 text-xs text-[var(--color-danger-500)]">Unable to load saved reports.</p>
            ) : scheduled.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--color-neutral-500)]">No scheduled reports yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {scheduled.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/gl/saved-reports/${item.id}`}
                      className="flex items-start gap-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 hover:bg-[var(--color-neutral-50)]"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-50)] text-[var(--color-neutral-500)]">
                        {item.format === 'XLSX' ? (
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[var(--color-neutral-900)]">{item.name}</p>
                        <p className="text-[10px] leading-relaxed text-[var(--color-neutral-400)]">
                          {item.subtitle ?? item.type}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-600)]">
                        {item.format ?? 'PDF'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashCard>
  );
}
