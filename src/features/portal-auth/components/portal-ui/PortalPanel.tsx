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
        'portal-motion-surface overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-[0_1px_2px_rgba(10,41,66,0.04)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(10,41,66,0.12)]',
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
