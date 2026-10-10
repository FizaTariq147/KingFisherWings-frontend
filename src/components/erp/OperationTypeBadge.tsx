import { Badge } from '@/components/ui/Badge/Badge';
import { cn } from '@/lib/utils';

const LABELS: Record<string, string> = {
  SEA_FCL_EXPORT: 'FCL Export',
  SEA_FCL_IMPORT: 'FCL Import',
  AIR_EXPORT: 'Air Export',
  AIR_IMPORT: 'Air Import',
};

export function operationTypeLabel(code?: string | null): string | null {
  if (!code?.trim()) return null;
  const key = code.trim().toUpperCase();
  if (LABELS[key]) return LABELS[key];
  return key.replaceAll('_', ' ');
}

/** Consistent operation badge (Export / Import / mode) across enquiry, quotation, shipment, job. */
export function OperationTypeBadge({
  code,
  className,
}: {
  code?: string | null;
  className?: string;
}) {
  const label = operationTypeLabel(code);
  if (!label) return null;
  return (
    <Badge
      variant="primary"
      dot={false}
      className={cn('font-semibold uppercase tracking-wider', className)}
    >
      {label}
    </Badge>
  );
}
