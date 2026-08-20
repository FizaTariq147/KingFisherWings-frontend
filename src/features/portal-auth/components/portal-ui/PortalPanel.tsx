import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PortalPanelProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

/** Soft surface panel used across portal list/detail pages. */
export function PortalPanel({ children, className, padded = false }: PortalPanelProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[20px] bg-white shadow-[0_10px_30px_rgba(10,41,66,0.05)]',
        padded && 'p-5 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const portalSelectClassName =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]';
