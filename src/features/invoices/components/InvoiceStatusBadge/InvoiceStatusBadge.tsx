import { Badge } from '@/components/ui/Badge';
import {
  INVOICE_STATUS_LABELS,
  type InvoiceStatus,
} from '../../constants/invoice.constants';

const VARIANT: Record<
  InvoiceStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary'
> = {
  DRAFT: 'neutral',
  POSTED: 'primary',
  SENT: 'info',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  CANCELLED: 'danger',
  VOID: 'danger',
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus | string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const key = String(status || 'DRAFT').toUpperCase() as InvoiceStatus;
  const label = INVOICE_STATUS_LABELS[key] ?? status;
  return <Badge variant={VARIANT[key] ?? 'neutral'}>{label}</Badge>;
}
