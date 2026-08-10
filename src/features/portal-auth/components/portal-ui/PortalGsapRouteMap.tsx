import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type PortalGsapRouteMapProps = {
  className?: string;
};

/**
 * Advanced login visualization — GSAP draws the logistics route path
 * and pulses waypoint markers. Decorative only; no business logic.
 */
export function PortalGsapRouteMap({ className }: PortalGsapRouteMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const path = svg.querySelector<SVGPathElement>('[data-gsap="route"]');
    const dots = svg.querySelectorAll<SVGCircleElement>('[data-gsap="dot"]');
    if (!path) return;

    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: reduceMotion ? 0 : length,
      opacity: 1,
    });
    gsap.set(dots, { scale: reduceMotion ? 1 : 0, transformOrigin: '50% 50%' });

    if (reduceMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(path, { strokeDashoffset: 0, duration: 2.2, delay: 0.25 });
    tl.to(
      dots,
      {
        scale: 1,
        duration: 0.45,
        stagger: 0.35,
        ease: 'back.out(2)',
      },
      '-=1.4',
    );
    tl.to(
      dots,
      {
        scale: 1.35,
        duration: 0.9,
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.25, repeat: -1 },
        ease: 'sine.inOut',
      },
      '+=0.2',
    );

    return () => {
      tl.kill();
    };
  }, [reduceMotion]);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="0 0 800 900"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        data-gsap="route"
        d="M60 720 C180 620, 220 480, 340 420 S560 360, 620 240 S700 80, 760 40"
        stroke="var(--color-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle data-gsap="dot" cx="340" cy="420" r="5" fill="var(--color-secondary)" />
      <circle data-gsap="dot" cx="620" cy="240" r="5" fill="white" fillOpacity="0.85" />
      <circle data-gsap="dot" cx="760" cy="40" r="4" fill="var(--color-secondary)" />
    </svg>
  );
}
