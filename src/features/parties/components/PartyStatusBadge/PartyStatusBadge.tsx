import { Badge } from '@/components/ui/Badge';
import type { Party } from '../../types/party.types';

interface PartyStatusBadgeProps {
  party: Pick<Party, 'is_active' | 'deleted_at'>;
}

export function PartyStatusBadge({ party }: PartyStatusBadgeProps) {
  if (party.deleted_at) {
    return <Badge variant="neutral">Deleted</Badge>;
  }
  const active = party.is_active !== false;
  return <Badge variant={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</Badge>;
}
