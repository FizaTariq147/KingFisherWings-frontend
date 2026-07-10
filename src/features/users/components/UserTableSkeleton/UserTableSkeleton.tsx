import { Card } from '@/components/ui/Card';

export function UserTableSkeleton() {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="animate-pulse space-y-0">
        <div className="h-10 bg-[var(--color-neutral-100)]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-t border-[var(--color-neutral-100)] bg-white px-4 flex items-center gap-4">
            <div className="h-4 w-32 rounded bg-[var(--color-neutral-100)]" />
            <div className="h-4 flex-1 max-w-xs rounded bg-[var(--color-neutral-100)]" />
            <div className="h-4 w-20 rounded bg-[var(--color-neutral-100)]" />
          </div>
        ))}
      </div>
    </Card>
  );
}
