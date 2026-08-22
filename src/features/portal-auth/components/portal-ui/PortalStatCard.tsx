import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalGsapCountUp } from './PortalGsapCountUp';
import { PORTAL_STAT_THEMES, type PortalStatTheme } from './portalStatThemes';

type PortalStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: LucideIcon;
  /** @deprecated Prefer `theme` for colorful cards */
  tone?: 'default' | 'accent';
  theme?: PortalStatTheme;
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
  theme,
  className,
  animateValue = true,
}: PortalStatCardProps) {
  const palette = theme ? PORTAL_STAT_THEMES[theme] : null;

  return (
    <div
      className={cn(
        'portal-motion-surface portal-stat-card group relative overflow-hidden rounded-xl border p-5 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(10,41,66,0.12)]',
        palette
          ? palette.card
          : tone === 'accent'
            ? 'border-[var(--color-secondary)]/25 bg-gradient-to-br from-[var(--color-secondary-100)] to-white'
            : 'border-[var(--color-neutral-200)] bg-white',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl portal-stat-glow',
          palette ? palette.glow : 'bg-[var(--color-secondary)]/10',
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              'text-xs font-medium uppercase tracking-wide',
              palette ? palette.label : 'text-[var(--color-neutral-500)]',
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              'mt-2 text-xl font-semibold tabular-nums',
              palette ? palette.value : 'text-[var(--color-neutral-900)]',
            )}
          >
            {animateValue ? <PortalGsapCountUp value={value} /> : value}
          </div>
          {hint ? (
            <p className={cn('mt-1 text-xs', palette ? palette.hint : 'text-[var(--color-neutral-400)]')}>
              {hint}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
              palette
                ? palette.icon
                : tone === 'accent'
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

export type { PortalStatTheme };
