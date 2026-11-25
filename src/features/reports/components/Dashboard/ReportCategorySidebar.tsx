import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_CATEGORIES,
  type DashboardCategoryId,
} from '../../utils/dashboardCategories';

type ReportCategorySidebarProps = {
  active: DashboardCategoryId;
  counts: Record<DashboardCategoryId, number>;
  onSelect: (id: DashboardCategoryId) => void;
};

export function ReportCategorySidebar({
  active,
  counts,
  onSelect,
}: ReportCategorySidebarProps) {
  return (
    <nav
      aria-label="Report categories"
      className="rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-sm overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
          Categories
        </h2>
      </div>
      <ul className="py-1">
        {DASHBOARD_CATEGORIES.map((cat) => {
          const selected = active === cat.id;
          const count = counts[cat.id] ?? 0;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors',
                  selected
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-800)] font-semibold border-l-2 border-[var(--color-primary-600)]'
                    : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] border-l-2 border-transparent',
                )}
              >
                <span className="min-w-0 truncate">{cat.label}</span>
                <span
                  className={cn(
                    'shrink-0 text-[11px] tabular-nums rounded-full px-2 py-0.5',
                    selected
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-800)]'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]',
                  )}
                >
                  {count}
                </span>
              </button>
              {cat.externalHref ? (
                <Link
                  to={cat.externalHref}
                  className="flex items-center gap-1.5 px-4 pb-2 pl-6 text-[11px] text-[var(--color-primary-700)] hover:underline"
                >
                  <ExternalLink className="size-3" aria-hidden />
                  {cat.externalLabel || 'Open saved reports'}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
