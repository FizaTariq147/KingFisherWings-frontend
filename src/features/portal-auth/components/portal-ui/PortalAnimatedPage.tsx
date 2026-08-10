import { Children, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePortalAutoAnimate } from './usePortalAutoAnimate';

type PortalAnimatedPageProps = {
  children: ReactNode;
  className?: string;
  /** When true, skips auto-animate (page owns motion manually). */
  jsMotion?: boolean;
};

/** Page root with AutoAnimate on direct section children. */
export function PortalAnimatedPage({
  children,
  className,
  jsMotion = false,
}: PortalAnimatedPageProps) {
  const [ref] = usePortalAutoAnimate();

  if (jsMotion) {
    return <div className={cn('portal-js-motion', className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn('portal-js-motion', className)}>
      {Children.map(children, (child) => child)}
    </div>
  );
}
