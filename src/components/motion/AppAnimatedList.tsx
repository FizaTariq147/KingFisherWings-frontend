import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAppAutoAnimate } from './useAppAutoAnimate';

type AppAnimatedListProps = {
  children: ReactNode;
  className?: string;
};

export function AppAnimatedList({ children, className }: AppAnimatedListProps) {
  const [parent] = useAppAutoAnimate();

  return (
    <div ref={parent} className={cn('app-list-stagger', className)}>
      {children}
    </div>
  );
}
