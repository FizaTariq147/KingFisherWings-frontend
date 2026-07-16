import { Badge } from '@/components/ui/Badge';
import type { AwbStockBatch } from '../../types/awbStock.types';

export function AwbStockStatusBadge({ batch }: { batch: Pick<AwbStockBatch, 'remaining' | 'is_low_stock' | 'deleted_at'> }) {
  if (batch.deleted_at) return <Badge variant="neutral">Deleted</Badge>;
  if (batch.is_low_stock) return <Badge variant="warning">Low stock</Badge>;
  if (typeof batch.remaining === 'number' && batch.remaining <= 0) {
    return <Badge variant="danger">Exhausted</Badge>;
  }
  return <Badge variant="success">Available</Badge>;
}
