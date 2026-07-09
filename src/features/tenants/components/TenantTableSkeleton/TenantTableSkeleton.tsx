export function TenantTableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[var(--color-neutral-200)] overflow-hidden">
      <div className="h-10 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-4 py-3 border-b border-[var(--color-neutral-100)] animate-pulse"
        >
          <div className="h-4 w-16 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-40 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-20 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-16 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-10 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-24 bg-[var(--color-neutral-100)] rounded" />
          <div className="h-4 w-8 bg-[var(--color-neutral-100)] rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}
