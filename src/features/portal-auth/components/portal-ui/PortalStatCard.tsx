import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PortalStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: LucideIcon;
  tone?: 'default' | 'accent';
  className?: string;
};

export function PortalStatCard({
  label,
  value,
  hint,
  Icon,
  tone = 'default',
  className,
}: PortalStatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-shadow hover:shadow-sm',
        tone === 'accent'
          ? 'border-[var(--color-secondary)]/25 bg-gradient-to-br from-[var(--color-secondary-100)] to-white'
          : 'border-[var(--color-neutral-200)] bg-white',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-neutral-500)]">
            {label}
          </div>
          <div className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-neutral-900)]">
            {value}
          </div>
          {hint ? <p className="mt-1 text-xs text-[var(--color-neutral-400)]">{hint}</p> : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              tone === 'accent'
                ? 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary-700)]'
                : 'bg-[var(--color-primary-100)] text-[var(--color-primary)]',
            )}
          >
            <Icon size={18} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
