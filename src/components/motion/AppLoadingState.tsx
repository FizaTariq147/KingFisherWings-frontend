import { cn } from '@/lib/utils';

type AppLoadingStateProps = {
  label?: string;
  className?: string;
};

/** Pulsed loading indicator — matches customer portal style. */
export function AppLoadingState({
  label = 'Loading…',
  className,
}: AppLoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-10', className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 app-loading-dots" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
      </div>
      <p className="text-sm text-[var(--color-neutral-400)]">{label}</p>
    </div>
  );
}
