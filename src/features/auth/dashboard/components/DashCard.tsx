import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { dashType } from '@/lib/dashboardTypography';

export function DashCard({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--color-neutral-200)] bg-white shadow-[0_10px_30px_rgba(10,41,66,0.05)]',
        padding && 'p-5',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DashCardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className={dashType.panel.title}>{title}</h3>
        {subtitle ? <p className={dashType.panel.subtitle}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DashEmpty({ children }: { children: ReactNode }) {
  return (
    <p className={dashType.panel.empty}>
      {children}
    </p>
  );
}

export function DashSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-[var(--color-neutral-100)]', className)} />
  );
}
