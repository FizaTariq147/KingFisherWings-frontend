import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { listShell } from '@/lib/erpTypography';

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(listShell.toolbar, 'border-t-0 sm:flex-nowrap', className)}>
      {children}
    </div>
  );
}
