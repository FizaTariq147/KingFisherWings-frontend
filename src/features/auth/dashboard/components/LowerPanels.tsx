import { Link } from 'react-router-dom';
import { DashCard, DashCardHeader, DashEmpty, DashSkeleton } from './DashCard';
import { relativeTime } from '../utils/dashboardFormat';
import type { AppNotification } from '@/features/notifications/types/notifications.types';

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

const REPORT_CARDS = [
  {
    title: 'Receivables ageing',
    description: 'Outstanding balances bucketed 1–30–60–90 with customer context.',
    href: '/gl/ar/aging',
    tags: ['Accounts', 'Receivables'],
  },
  {
    title: 'Lane profitability',
    description: 'Revenue, cost and gross margin by trade lane and mode.',
    href: '/gl/mis/dashboard',
    tags: 'Sales · Finance'.split(' · '),
  },
  {
    title: 'Operator productivity',
    description: 'Jobs handled and operational KPIs from MIS operational metrics.',
    href: '/gl/mis/dashboard',
    tags: ['Operations'],
    note: 'Per-user SLA is not available yet.',
  },
  {
    title: 'Customs & delay analysis',
    description: 'Filter jobs on customs hold and docs pending from Active shipments.',
    href: '/jobs/sea-import',
    tags: 'Jobs · Customs'.split(' · '),
  },
  {
    title: 'Monthly volume statement',
    description: 'Shipment counts by period from jobs and MIS operational data.',
    href: '/gl/mis/dashboard',
    tags: ['Management'],
  },
];

export function ReportsHubPanel({
  scheduled,
  isLoading,
  isError,
  periodLabel,
  onGenerate,
}: {
  scheduled: Array<{ id: string; name: string; type: string }>;
  isLoading: boolean;
  isError: boolean;
  periodLabel: string;
  onGenerate: () => void;
}) {
  return (
    <DashCard>
      <DashCardHeader
        title="Reports"
        subtitle="Generate on demand · schedule delivery to mailboxes"
        action={
          <Link
            to="/gl/saved-reports"
            className="rounded-full border border-[var(--color-neutral-200)] px-3 py-1 text-[11px] font-semibold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
          >
            Report builder
          </Link>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.href}
              className="rounded-xl border border-[var(--color-neutral-200)] p-4 hover:border-[var(--color-primary-200)] hover:bg-[var(--color-neutral-50)]"
            >
              <p className="text-sm font-semibold text-[var(--color-neutral-900)]">{card.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-neutral-500)]">
                {card.description}
              </p>
              {card.note ? (
                <p className="mt-2 text-[10px] text-[var(--color-warning-500)]">{card.note}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-neutral-50)] px-2 py-0.5 text-[10px] text-[var(--color-neutral-500)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--color-neutral-200)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
            Period
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-neutral-800)]">{periodLabel}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
            Format
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-neutral-500)]">
            Export from each report page (PDF / XLSX / CSV where the API supports it).
          </p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-white hover:bg-[var(--color-primary-600)]"
          >
            Open reports
          </button>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
            Scheduled
          </p>
          {isLoading ? (
            <DashSkeleton className="mt-2 h-16" />
          ) : isError ? (
            <p className="mt-2 text-xs text-[var(--color-danger-500)]">Unable to load saved reports.</p>
          ) : scheduled.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--color-neutral-500)]">No saved reports yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {scheduled.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/gl/saved-reports/${item.id}`}
                    className="block rounded-lg bg-[var(--color-neutral-50)] px-3 py-2 hover:bg-[var(--color-neutral-100)]"
                  >
                    <p className="text-xs font-semibold text-[var(--color-neutral-800)]">{item.name}</p>
                    <p className="text-[10px] text-[var(--color-neutral-400)]">{item.type}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashCard>
  );
}
