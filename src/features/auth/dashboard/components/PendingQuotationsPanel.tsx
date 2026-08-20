import { Link } from 'react-router-dom';
import type { Quotation } from '@/features/quotations/types/quotation.types';
import { quotationDisplayNumber } from '@/features/quotations/utils/normalizeQuotation';
import { DashEmpty, DashSkeleton } from './DashCard';
import { formatMoney, formatShortDate } from '../utils/dashboardFormat';

export function PendingQuotationsPanel({
  quotations,
  pipelineValue,
  isLoading,
  isError,
}: {
  quotations: Quotation[];
  pipelineValue: number;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-[var(--color-primary)] p-5 text-white shadow-[0_10px_30px_rgba(10,41,66,0.18)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Pending quotations</h3>
          <p className="mt-0.5 text-[11px] text-white/60">Waiting on review</p>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
          Open
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <DashSkeleton className="h-14 bg-white/10" />
          <DashSkeleton className="h-14 bg-white/10" />
        </div>
      ) : isError ? (
        <p className="text-sm text-white/70">Unable to load quotations.</p>
      ) : quotations.length === 0 ? (
        <p className="rounded-xl bg-white/5 px-3 py-6 text-center text-sm text-white/70">
          No pending quotations.
        </p>
      ) : (
        <ul className="space-y-3">
          {quotations.slice(0, 3).map((q) => (
            <li key={q.id}>
              <Link to={`/quotations/${q.id}`} className="block rounded-xl hover:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{q.customer_name || '—'}</p>
                    <p className="mt-0.5 text-[11px] text-white/55">
                      {quotationDisplayNumber(q)}
                      {q.valid_until ? ` · Valid ${formatShortDate(q.valid_until)}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatMoney(q.total_amount ?? q.revenue_total, q.currency_code)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center justify-between text-[11px] text-white/60">
          <span>Pipeline value</span>
          <span className="text-sm font-semibold text-white">{formatMoney(pipelineValue)}</span>
        </div>
        <Link
          to="/quotations/all"
          className="flex h-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm font-semibold text-white hover:bg-[var(--color-secondary-600)]"
        >
          Review queue
        </Link>
      </div>
    </section>
  );
}

export function TodaysTasksPanel({
  items,
  isLoading,
  isError,
  onToggle,
  pendingToggleId,
}: {
  items: Array<{ id: string; subject: string; due_date?: string; notes?: string; done: boolean }>;
  isLoading: boolean;
  isError: boolean;
  onToggle: (id: string, done: boolean) => void;
  pendingToggleId?: string;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-[0_10px_30px_rgba(10,41,66,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">Today&apos;s tasks</h3>
          <p className="text-[11px] text-[var(--color-neutral-500)]">CRM follow-ups due today</p>
        </div>
        <Link to="/sales/follow-ups" className="text-[11px] font-semibold text-[var(--color-primary-600)] hover:underline">
          Open
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <DashSkeleton className="h-8" />
          <DashSkeleton className="h-8" />
        </div>
      ) : isError ? (
        <DashEmpty>Unable to load follow-ups.</DashEmpty>
      ) : items.length === 0 ? (
        <DashEmpty>No follow-ups due today.</DashEmpty>
      ) : (
        <ul className="space-y-2.5">
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 accent-[var(--color-secondary)]"
                checked={item.done}
                disabled={pendingToggleId === item.id}
                onChange={() => onToggle(item.id, !item.done)}
                aria-label={`Mark "${item.subject}" complete`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm ${item.done ? 'text-[var(--color-neutral-400)] line-through' : 'text-[var(--color-neutral-800)]'}`}
                >
                  {item.subject}
                </p>
                {item.notes ? (
                  <p className="truncate text-[11px] text-[var(--color-neutral-400)]">{item.notes}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
