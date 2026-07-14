import { Badge } from '@/components/ui/Badge';
import {
  STATUS_LABELS,
  type QuotationStatus,
} from '../../constants/quotation.constants';

const VARIANT: Record<
  QuotationStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary'
> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  APPROVED: 'primary',
  REJECTED: 'danger',
  SENT: 'info',
  WON: 'success',
  LOST: 'danger',
  EXPIRED: 'warning',
  CONVERTED: 'success',
};

interface QuotationStatusBadgeProps {
  status: QuotationStatus | string;
}

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  const key = String(status || 'DRAFT').toUpperCase() as QuotationStatus;
  const label = STATUS_LABELS[key] ?? status;
  return <Badge variant={VARIANT[key] ?? 'neutral'}>{label}</Badge>;
}
