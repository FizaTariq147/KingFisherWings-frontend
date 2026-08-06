import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PortalEmptyStateProps = {
  title: string;
  description?: string;
  Icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function PortalEmptyState({
  title,
  description,
  Icon = Inbox,
  action,
  className,
}: PortalEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary)]">
        <Icon size={22} aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-neutral-800)]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-[var(--color-neutral-500)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
