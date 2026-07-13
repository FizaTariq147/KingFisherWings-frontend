import { Badge } from '@/components/ui/Badge';
import {
  CREDIT_STATUS_LABELS,
  type CreditStatus,
} from '../../constants/party.constants';

const VARIANT: Record<CreditStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  BLACKLISTED: 'danger',
};

interface PartyCreditBadgeProps {
  status?: CreditStatus | null;
}

export function PartyCreditBadge({ status }: PartyCreditBadgeProps) {
  if (!status) return <Badge variant="neutral">—</Badge>;
  return <Badge variant={VARIANT[status]}>{CREDIT_STATUS_LABELS[status]}</Badge>;
}
