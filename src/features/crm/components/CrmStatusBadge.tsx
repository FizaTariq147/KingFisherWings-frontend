import { Badge } from '@/components/ui/Badge/Badge';
import { crmLabel } from '../constants/crm.constants';

export function CrmStatusBadge({ status }: { status?: string }) {
  const value = status || 'UNKNOWN';
  const variant = ['WON', 'BOOKED', 'COMPLETED', 'POSITIVE', 'SENT', 'ACTIVE'].includes(value)
    ? 'success'
    : ['LOST', 'CANCELLED', 'NEGATIVE', 'UNSUBSCRIBED'].includes(value)
      ? 'danger'
      : ['NEW', 'PENDING', 'IN_PROGRESS', 'QUALIFIED', 'QUOTED'].includes(value) ? 'info' : 'neutral';
  return <Badge variant={variant}>{crmLabel(value)}</Badge>;
}
