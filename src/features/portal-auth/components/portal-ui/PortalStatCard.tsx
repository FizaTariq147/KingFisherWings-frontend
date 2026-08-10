import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalGsapCountUp } from './PortalGsapCountUp';

type PortalStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: LucideIcon;
  tone?: 'default' | 'accent';
  className?: string;
  /** Animate numeric values with GSAP count-up (default true). */
  animateValue?: boolean;
};

export function PortalStatCard({
  label,
  value,
  hint,
  Icon,
  tone = 'default',
  className,
  animateValue = true,
}: PortalStatCardProps) {
  return (
    <div
      className={cn(
        'portal-motion-surface portal-stat-card relative overflow-hidden rounded-xl border p-5 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_18px_44px_rgba(10,41,66,0.14)]',
        tone === 'accent'
          ? 'border-[var(--color-secondary)]/25 bg-gradient-to-br from-[var(--color-secondary-100)] to-white'
          : 'border-[var(--color-neutral-200)] bg-white',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--color-secondary)]/10 blur-2xl portal-stat-glow"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-neutral-500)]">
            {label}
          </div>
          <div className="mt-2 text-xl font-semibold tabular-nums text-[var(--color-neutral-900)]">
            {animateValue ? <PortalGsapCountUp value={value} /> : value}
          </div>
          {hint ? <p className="mt-1 text-xs text-[var(--color-neutral-400)]">{hint}</p> : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110',
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
