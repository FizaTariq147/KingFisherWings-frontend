import { Badge } from '@/components/ui/Badge';
import {
  PAYMENT_REQUEST_STATUS_LABELS,
  type PaymentRequestStatus,
} from '../../constants/paymentRequest.constants';

const VARIANT: Record<
  PaymentRequestStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary'
> = {
  PENDING: 'warning',
  APPROVED: 'primary',
  REJECTED: 'danger',
  PAID: 'success',
  CANCELLED: 'neutral',
};

export function PaymentRequestStatusBadge({ status }: { status: PaymentRequestStatus | string }) {
  const key = String(status || 'PENDING').toUpperCase() as PaymentRequestStatus;
  return (
    <Badge variant={VARIANT[key] ?? 'neutral'}>
      {PAYMENT_REQUEST_STATUS_LABELS[key] ?? status}
    </Badge>
  );
}
