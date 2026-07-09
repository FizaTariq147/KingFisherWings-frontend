import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '../../types/tenant.types';

interface TenantListPaginationProps {
  meta: PaginationMeta;
  onPage: (page: number) => void;
}

export function TenantListPagination({ meta, onPage }: TenantListPaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  if (totalPages <= 1 && total <= limit) return null;

  const pages = buildPageWindow(page, totalPages);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-[var(--color-neutral-200)]">
      <span className="text-xs text-[var(--color-neutral-400)]">
        Showing {from}–{to} of {total} tenants
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${
              p === page
                ? 'text-white'
                : 'text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)]'
            }`}
            style={p === page ? { background: 'var(--color-primary-600)' } : undefined}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function buildPageWindow(current: number, totalPages: number): number[] {
  const max = Math.min(totalPages, 7);
  if (totalPages <= 7) return Array.from({ length: max }, (_, i) => i + 1);
  if (current <= 4) return Array.from({ length: 7 }, (_, i) => i + 1);
  if (current >= totalPages - 3) return Array.from({ length: 7 }, (_, i) => totalPages - 6 + i);
  return Array.from({ length: 7 }, (_, i) => current - 3 + i);
}
