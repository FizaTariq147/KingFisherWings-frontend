type PortalFetchBarProps = {
  active?: boolean;
};

/** Animated top loading indicator for portal data fetches. */
export function PortalFetchBar({ active = false }: PortalFetchBarProps) {
  if (!active) return null;

  return (
    <div
      className="portal-fetch-bar relative h-0.5 overflow-hidden bg-[var(--color-secondary)]/15"
      role="progressbar"
      aria-label="Loading"
    >
      <div className="portal-fetch-bar-shimmer absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-[var(--color-secondary)] to-transparent" />
    </div>
  );
}
