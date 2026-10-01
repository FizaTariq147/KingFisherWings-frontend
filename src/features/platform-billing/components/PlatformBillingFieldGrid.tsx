import { collectDisplayFields } from '../utils/platformBillingUi';

type PlatformBillingFieldGridProps = {
  normalized: Record<string, unknown>;
  raw?: Record<string, unknown>;
  className?: string;
};

export function PlatformBillingFieldGrid({
  normalized,
  raw,
  className = '',
}: PlatformBillingFieldGridProps) {
  const rows = collectDisplayFields(normalized, raw);

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--color-neutral-500)]">No fields to display.</p>;
  }

  return (
    <dl className={`grid gap-2 sm:grid-cols-2 ${className}`}>
      {rows.map((row) => (
        <div key={row.key} className="flex flex-col gap-0.5 text-sm min-w-0">
          <dt className="text-xs text-[var(--color-neutral-500)]">{row.label}</dt>
          <dd className="font-medium text-[var(--color-neutral-800)] break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
