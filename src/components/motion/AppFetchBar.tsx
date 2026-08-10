import { cn } from '@/lib/utils';

type AppFetchBarProps = {
  active?: boolean;
  className?: string;
};

/** Animated top loading bar for background refetches — matches customer portal. */
export function AppFetchBar({ active = false, className }: AppFetchBarProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        'relative h-0.5 overflow-hidden bg-[var(--color-secondary)]/15',
        className,
      )}
      role="progressbar"
      aria-label="Loading"
    >
      <div className="app-fetch-bar-shimmer absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-[var(--color-secondary)] to-transparent" />
    </div>
  );
}
