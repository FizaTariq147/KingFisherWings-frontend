import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePortalAutoAnimate } from './usePortalAutoAnimate';

type PortalAnimatedTimelineProps = {
  children: ReactNode;
  className?: string;
};

/** Vertical timeline — staggered entrance + AutoAnimate on milestone changes. */
export function PortalAnimatedTimeline({ children, className }: PortalAnimatedTimelineProps) {
  const [parent] = usePortalAutoAnimate();

  return (
    <ol ref={parent} className={cn('space-y-4 portal-list-stagger', className)}>
      {children}
    </ol>
  );
}

type PortalAnimatedTimelineItemProps = {
  children: ReactNode;
  className?: string;
};

export function PortalAnimatedTimelineItem({
  children,
  className,
}: PortalAnimatedTimelineItemProps) {
  return (
    <li
      className={cn(
        'relative border-l-2 border-[var(--color-secondary)] pl-4 portal-list-row',
        className,
      )}
    >
      <div
        className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[var(--color-secondary)]"
        aria-hidden="true"
      />
      {children}
    </li>
  );
}
