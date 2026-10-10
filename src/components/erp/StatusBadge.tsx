import { Badge } from '@/components/ui/Badge/Badge';
import { formatStatusLabel, statusToBadgeVariant } from '@/lib/erpStatus';

export interface StatusBadgeProps {
  status?: string | null;
  /** Override display text (module-specific labels). */
  label?: string;
  className?: string;
  dot?: boolean;
}

/** Unified operational status badge — same colors for the same status everywhere. */
export function StatusBadge({ status, label, className, dot = false }: StatusBadgeProps) {
  const text = label ?? formatStatusLabel(status);
  return (
    <Badge variant={statusToBadgeVariant(status)} className={className} dot={dot}>
      {text}
    </Badge>
  );
}
