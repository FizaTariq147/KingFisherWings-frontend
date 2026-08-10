import { cn } from '@/lib/utils';

type PortalLoadingStateProps = {
  label?: string;
  className?: string;
};

/** Pulsed loading indicator for portal data fetches. */
export function PortalLoadingState({
  label = 'Loading…',
  className,
}: PortalLoadingStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-10', className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 portal-loading-dots" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]" />
      </div>
      <p className="text-sm text-[var(--color-neutral-400)]">{label}</p>
    </div>
  );
}
