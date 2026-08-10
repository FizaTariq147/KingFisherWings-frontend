import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type HoverEffectItem = {
  title: string;
  description: string;
  link: string;
  icon?: ReactNode;
};

type HoverEffectProps = {
  items: HoverEffectItem[];
  className?: string;
};

/**
 * Aceternity UI Card Hover Effect — uses React Router `Link` (not `<a href>`).
 * Preserves in-app navigation; hover highlight is decorative only.
 */
export function HoverEffect({ items, className }: HoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn('grid grid-cols-1 gap-1 sm:grid-cols-3', className)}>
      {items.map((item, idx) => (
        <Link
          to={item.link}
          key={item.link}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx ? (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-xl bg-[var(--color-secondary-100)]/70"
                layoutId="portal-aceternity-hover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.05 } }}
              />
            ) : null}
          </AnimatePresence>

          <div className="relative z-10 flex h-full items-center gap-3 rounded-lg px-2 py-2">
            {item.icon ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]">
                {item.icon}
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[var(--color-neutral-900)]">
                {item.title}
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">{item.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
