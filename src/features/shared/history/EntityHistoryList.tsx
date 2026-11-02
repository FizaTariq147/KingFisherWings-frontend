import type { ReactNode } from 'react';
import { erpForm } from '@/lib/erpForm';
import { cn } from '@/lib/utils';

export type EntityHistoryItem = {
  id: string;
  title: string;
  subtitle?: string;
  when?: string;
  actor?: string;
};

/**
 * Shared History tab chrome — event / date / actor in a clean 3-column layout.
 * Presentation only; callers supply already-normalized rows.
 */
export function EntityHistoryList({
  items,
  empty = 'No history yet.',
  loading = false,
  toolbar,
  className,
}: {
  items: EntityHistoryItem[];
  empty?: string;
  loading?: boolean;
  toolbar?: ReactNode;
  className?: string;
}) {
  if (loading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading history…</p>;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {toolbar ? <div className="flex justify-end">{toolbar}</div> : null}

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-400)]">{empty}</p>
      ) : (
        <div className={erpForm.section}>
          <div
            className={cn(
              'hidden border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-header-bg,#E9EEF2)] px-3 py-2 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4',
            )}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fresa-header-text,#0A2942)]">
              Event
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fresa-header-text,#0A2942)]">
              Date
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fresa-header-text,#0A2942)]">
              By
            </span>
          </div>
          <ul className="divide-y divide-[var(--fresa-border,#C9D3DF)]">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-1 gap-1.5 px-3 py-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-start sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#0f172a]">{item.title}</p>
                  {item.subtitle ? (
                    <p className="mt-0.5 text-[12px] text-[#64748b]">{item.subtitle}</p>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8] sm:hidden">
                    Date
                  </p>
                  <p className="text-[13px] text-[#334155]">{item.when?.trim() || '—'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8] sm:hidden">
                    By
                  </p>
                  <p className="text-[13px] text-[#334155]">{item.actor?.trim() || '—'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
