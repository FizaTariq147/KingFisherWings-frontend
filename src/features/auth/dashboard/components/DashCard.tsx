import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-[11px] text-[var(--color-neutral-500)]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function DashEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-[var(--color-neutral-50)] px-3 py-6 text-center text-sm text-[var(--color-neutral-500)]">
      {children}
    </p>
  );
}

export function DashSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-[var(--color-neutral-100)]', className)} />
  );
}
