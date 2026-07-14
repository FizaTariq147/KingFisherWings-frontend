import { Badge } from '@/components/ui/Badge';
import type { ZipDistance } from '../../types/zipDistance.types';

export function ZipDistanceStatusBadge({
  item,
}: {
  item: Pick<ZipDistance, 'is_active' | 'deleted_at'>;
}) {
  if (item.deleted_at) return <Badge variant="neutral">Deleted</Badge>;
  const active = item.is_active !== false;
  return <Badge variant={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</Badge>;
}
