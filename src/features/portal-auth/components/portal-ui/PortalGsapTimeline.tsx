import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type PortalGsapTimelineProps = {
  children: ReactNode;
  className?: string;
};

/**
 * GSAP milestone timeline — line draws in, nodes pop, items cascade.
 * Use for shipment/history visualizations only.
 */
export function PortalGsapTimeline({ children, className }: PortalGsapTimelineProps) {
  const ref = useRef<HTMLOListElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduceMotion) return;

    const items = root.querySelectorAll<HTMLElement>('[data-gsap="milestone"]');
    const dots = root.querySelectorAll<HTMLElement>('[data-gsap="milestone-dot"]');
    const lines = root.querySelectorAll<HTMLElement>('[data-gsap="milestone-line"]');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          duration: 0.55,
          stagger: 0.14,
          ease: 'power2.out',
        },
      );
      gsap.fromTo(
        dots,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          stagger: 0.14,
          delay: 0.12,
          ease: 'back.out(2.2)',
        },
      );
      gsap.fromTo(
        items,
        { opacity: 0, x: -18 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.12,
          delay: 0.18,
          ease: 'power2.out',
        },
      );
    }, root);

    return () => ctx.revert();
  }, [children, reduceMotion]);

  return (
    <ol ref={ref} className={cn('space-y-0', className)}>
      {children}
    </ol>
  );
}

type PortalGsapTimelineItemProps = {
  children: ReactNode;
  className?: string;
  isLast?: boolean;
};

export function PortalGsapTimelineItem({
  children,
  className,
  isLast = false,
}: PortalGsapTimelineItemProps) {
  return (
    <li className={cn('relative flex gap-3 pb-5 last:pb-0', className)} data-gsap="milestone">
      <div className="relative flex w-3 shrink-0 flex-col items-center">
        <span
          data-gsap="milestone-dot"
          className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-secondary)] ring-4 ring-[var(--color-secondary)]/20"
          aria-hidden="true"
        />
        {!isLast ? (
          <span
            data-gsap="milestone-line"
            className="mt-1 w-0.5 flex-1 min-h-[1.5rem] bg-[var(--color-secondary)]/40"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
    </li>
  );
}
