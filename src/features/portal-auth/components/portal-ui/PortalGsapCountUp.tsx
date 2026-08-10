import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function parseNumeric(value: string | number): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value).replace(/,/g, '').trim();
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

type PortalGsapCountUpProps = {
  value: string | number;
  className?: string;
  duration?: number;
};

/**
 * GSAP count-up for numeric dashboard/stat values.
 * Non-numeric values render as-is (no animation).
 */
export function PortalGsapCountUp({
  value,
  className,
  duration = 1.1,
}: PortalGsapCountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const target = parseNumeric(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (target == null || reduceMotion) {
      el.textContent = String(value);
      return;
    }

    const decimals = String(target).includes('.')
      ? Math.min(String(target).split('.')[1]?.length ?? 0, 2)
      : 0;
    const state = { n: 0 };

    const tween = gsap.to(state, {
      n: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = state.n.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      },
    });

    return () => {
      tween.kill();
    };
  }, [target, value, duration, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {String(value)}
    </span>
  );
}
