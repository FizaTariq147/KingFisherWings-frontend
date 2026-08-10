import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePortalAutoAnimate } from './usePortalAutoAnimate';

type PortalAnimatedListProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/** List container — CSS stagger on mount + AutoAnimate on DOM changes. */
export function PortalAnimatedList({
  children,
  className,
  as: Tag = 'div',
}: PortalAnimatedListProps) {
  const [parent] = usePortalAutoAnimate();

  return (
    <Tag
      ref={parent as never}
      role={Tag === 'div' ? 'list' : undefined}
      className={cn('portal-list-stagger', className)}
    >
      {children}
    </Tag>
  );
}

type PortalAnimatedListItemProps = {
  children: ReactNode;
  className?: string;
};

/** List row — direct child of PortalAnimatedList. */
export function PortalAnimatedListItem({ children, className }: PortalAnimatedListItemProps) {
  return (
    <div role="listitem" className={cn('portal-list-row', className)}>
      {children}
    </div>
  );
}
