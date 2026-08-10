import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type PortalGsapHeroVizProps = {
  className?: string;
};

/**
 * Dashboard hero visualization — ambient glow drift + route line draw.
 * Purely decorative; does not affect data or navigation.
 */
export function PortalGsapHeroViz({ className }: PortalGsapHeroVizProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;

    const glow = root.querySelector<HTMLElement>('[data-gsap="glow"]');
    const path = root.querySelector<SVGPathElement>('[data-gsap="hero-route"]');
    const dots = root.querySelectorAll<SVGCircleElement>('[data-gsap="hero-dot"]');

    const ctx = gsap.context(() => {
      if (glow) {
        gsap.to(glow, {
          xPercent: 8,
          yPercent: 6,
          scale: 1.12,
          opacity: 0.7,
          duration: 5.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 0.55 });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2.4,
          delay: 0.2,
          ease: 'power2.inOut',
        });
      }

      if (dots.length) {
        gsap.fromTo(
          dots,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.28,
            delay: 0.9,
            ease: 'back.out(2)',
          },
        );
        gsap.to(dots, {
          opacity: 0.45,
          duration: 1.4,
          yoyo: true,
          repeat: -1,
          stagger: 0.3,
          delay: 1.8,
          ease: 'sine.inOut',
        });
      }
    }, root);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div ref={rootRef} className={className} aria-hidden="true">
      <div
        data-gsap="glow"
        className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[var(--color-secondary)]/40 blur-3xl"
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 640 220"
        fill="none"
        preserveAspectRatio="xMaxYMid meet"
      >
        <path
          data-gsap="hero-route"
          d="M40 170 C140 150, 180 90, 260 80 S400 110, 460 70 S560 30, 610 24"
          stroke="var(--color-secondary)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle data-gsap="hero-dot" cx="260" cy="80" r="4" fill="var(--color-secondary)" />
        <circle data-gsap="hero-dot" cx="460" cy="70" r="4" fill="white" fillOpacity="0.9" />
        <circle data-gsap="hero-dot" cx="610" cy="24" r="3.5" fill="var(--color-secondary)" />
      </svg>
    </div>
  );
}
