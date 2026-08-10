import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAppAutoAnimate } from './useAppAutoAnimate';

type AppAnimatedTableBodyProps = {
  children: ReactNode;
  className?: string;
};

/** tbody with AutoAnimate for master list row add/remove/reorder. */
export function AppAnimatedTableBody({ children, className }: AppAnimatedTableBodyProps) {
  const [parent] = useAppAutoAnimate();

  return (
    <tbody
      ref={parent}
      className={cn('divide-y divide-[var(--color-neutral-100)] app-list-stagger', className)}
    >
      {children}
    </tbody>
  );
}
