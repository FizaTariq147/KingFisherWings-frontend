import { Badge } from '@/components/ui/Badge';
import {
  STATUS_LABELS,
  type QuotationStatus,
} from '../../constants/quotation.constants';
import { coerceQuotationStatus } from '../../utils/quotationStatus';

const VARIANT: Partial<
  Record<QuotationStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary'>
> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  INTERNALLY_APPROVED: 'primary',
  REJECTED: 'danger',
  SENT: 'info',
  CUSTOMER_REVIEW: 'warning',
  NEGOTIATING: 'warning',
  APPROVED: 'success',
  DISAPPROVED: 'danger',
  EXPIRED: 'warning',
  CONVERTED: 'success',
  WON: 'success',
  LOST: 'danger',
};

interface QuotationStatusBadgeProps {
  status: QuotationStatus | string;
}

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  const key = coerceQuotationStatus(status);
  const label = STATUS_LABELS[key] ?? status;
  return <Badge variant={VARIANT[key] ?? 'neutral'}>{label}</Badge>;
}
