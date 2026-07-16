import { Badge } from '@/components/ui/Badge';
import type { Tariff } from '../../types/tariff.types';

export function TariffStatusBadge({ tariff }: { tariff: Pick<Tariff, 'is_active' | 'deleted_at'> }) {
  if (tariff.deleted_at) return <Badge variant="neutral">Deleted</Badge>;
  const active = tariff.is_active !== false;
  return <Badge variant={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</Badge>;
}
