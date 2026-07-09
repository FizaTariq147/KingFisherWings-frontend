export function TenantDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded" />
      <div className="h-8 w-64 bg-[var(--color-neutral-100)] rounded" />
      <div className="h-4 w-48 bg-[var(--color-neutral-100)] rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-[var(--color-neutral-100)] rounded-md" />
        ))}
      </div>
      <div className="flex gap-6 border-b border-[var(--color-neutral-200)] pb-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 w-16 bg-[var(--color-neutral-100)] rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]"
          />
        ))}
      </div>
    </div>
  );
}
