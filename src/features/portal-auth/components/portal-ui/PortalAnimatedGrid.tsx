import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePortalAutoAnimate } from './usePortalAutoAnimate';

type PortalAnimatedGridProps = {
  children: ReactNode;
  className?: string;
};

/** Grid container — pop-in stagger + AutoAnimate on child changes. */
export function PortalAnimatedGrid({ children, className }: PortalAnimatedGridProps) {
  const [parent] = usePortalAutoAnimate();

  return (
    <div ref={parent} className={cn('portal-grid-stagger', className)}>
      {children}
    </div>
  );
}

type PortalAnimatedGridItemProps = {
  children: ReactNode;
  className?: string;
};

export function PortalAnimatedGridItem({ children, className }: PortalAnimatedGridItemProps) {
  if (className) {
    return <div className={className}>{children}</div>;
  }
  return <>{children}</>;
}
