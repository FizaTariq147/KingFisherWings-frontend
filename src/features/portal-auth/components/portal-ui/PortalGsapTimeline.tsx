import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type PortalGsapTimelineProps = {
  children: ReactNode;
  className?: string;
  /** Vertical stack (default) or horizontal scrollable stepper. */
  orientation?: 'vertical' | 'horizontal';
};

/**
 * GSAP milestone timeline — line draws in, nodes pop, items cascade.
 * Use for shipment/history visualizations only.
 */
export function PortalGsapTimeline({
  children,
  className,
  orientation = 'vertical',
}: PortalGsapTimelineProps) {
  const ref = useRef<HTMLOListElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const horizontal = orientation === 'horizontal';

  useEffect(() => {
    const root = ref.current;
    if (!root || reduceMotion) return;

    const items = root.querySelectorAll<HTMLElement>('[data-gsap="milestone"]');
    const dots = root.querySelectorAll<HTMLElement>('[data-gsap="milestone-dot"]');
    const lines = root.querySelectorAll<HTMLElement>('[data-gsap="milestone-line"]');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        horizontal
          ? { scaleX: 0, transformOrigin: 'left center' }
          : { scaleY: 0, transformOrigin: 'top center' },
        {
          ...(horizontal ? { scaleX: 1 } : { scaleY: 1 }),
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
        { opacity: 0, ...(horizontal ? { y: 12 } : { x: -18 }) },
        {
          opacity: 1,
          ...(horizontal ? { y: 0 } : { x: 0 }),
          duration: 0.45,
          stagger: 0.12,
          delay: 0.18,
          ease: 'power2.out',
        },
      );
    }, root);

    return () => ctx.revert();
  }, [children, reduceMotion, horizontal]);

  return (
    <ol
      ref={ref}
      className={cn(
        horizontal
          ? 'portal-scrollbar flex w-full flex-row items-start gap-0 overflow-x-auto pb-2'
          : 'flex w-full flex-col space-y-0',
        className,
      )}
    >
      {children}
    </ol>
  );
}

export type PortalGsapMilestoneTone = 'complete' | 'hold' | 'pending';

const MILESTONE_TONE_CLASSES: Record<
  PortalGsapMilestoneTone,
  { dot: string; line: string }
> = {
  /** Mark complete — green */
  complete: {
    dot: 'bg-[var(--color-success-500)] ring-4 ring-[var(--color-success-500)]/25',
    line: 'bg-[var(--color-success-500)]/35',
  },
  /** Hold or custom — red */
  hold: {
    dot: 'bg-[var(--color-danger-500)] ring-4 ring-[var(--color-danger-500)]/25',
    line: 'bg-[var(--color-danger-500)]/35',
  },
  /** Not completed — orange */
  pending: {
    dot: 'bg-[var(--color-secondary)] ring-4 ring-[var(--color-secondary)]/20',
    line: 'bg-[var(--color-secondary)]/40',
  },
};

type PortalGsapTimelineItemProps = {
  children: ReactNode;
  className?: string;
  isLast?: boolean;
  /** complete=green, hold=red (hold/custom), pending=orange */
  tone?: PortalGsapMilestoneTone;
  orientation?: 'vertical' | 'horizontal';
};

export function PortalGsapTimelineItem({
  children,
  className,
  isLast = false,
  tone = 'pending',
  orientation = 'vertical',
}: PortalGsapTimelineItemProps) {
  const colors = MILESTONE_TONE_CLASSES[tone] ?? MILESTONE_TONE_CLASSES.pending;
  const horizontal = orientation === 'horizontal';

  if (horizontal) {
    return (
      <li
        className={cn(
          'relative flex min-w-[11rem] max-w-[14rem] shrink-0 flex-col gap-2 pr-4 last:pr-0',
          className,
        )}
        data-gsap="milestone"
      >
        <div className="relative flex w-full items-center">
          <span
            data-gsap="milestone-dot"
            className={cn('relative z-[1] h-2.5 w-2.5 shrink-0 rounded-full', colors.dot)}
            aria-hidden="true"
          />
          {!isLast ? (
            <span
              data-gsap="milestone-line"
              className={cn('ml-1 h-0.5 min-w-[2.5rem] flex-1', colors.line)}
              aria-hidden="true"
            />
          ) : null}
        </div>
        <div className="min-w-0">{children}</div>
      </li>
    );
  }

  return (
    <li
      className={cn('relative flex w-full flex-row items-stretch gap-3 pb-5 last:pb-0', className)}
      data-gsap="milestone"
    >
      <div className="relative flex w-3 shrink-0 flex-col items-center self-stretch">
        <span
          data-gsap="milestone-dot"
          className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', colors.dot)}
          aria-hidden="true"
        />
        {!isLast ? (
          <span
            data-gsap="milestone-line"
            className={cn('mt-1 w-0.5 flex-1 min-h-[1.75rem]', colors.line)}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
    </li>
  );
}
