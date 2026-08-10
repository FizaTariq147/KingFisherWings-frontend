import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAppAutoAnimate } from './useAppAutoAnimate';

type AppAnimatedGridProps = {
  children: ReactNode;
  className?: string;
};

export function AppAnimatedGrid({ children, className }: AppAnimatedGridProps) {
  const [parent] = useAppAutoAnimate();

  return (
    <div ref={parent} className={cn('app-grid-stagger', className)}>
      {children}
    </div>
  );
}

type AppAnimatedGridItemProps = {
  children: ReactNode;
  className?: string;
};

export function AppAnimatedGridItem({ children, className }: AppAnimatedGridItemProps) {
  if (className) {
    return <div className={className}>{children}</div>;
  }
  return <>{children}</>;
}
