import { Badge } from '@/components/ui/Badge';
import type { Tenant } from '../../types/tenant.types';

interface TenantStatusBadgeProps {
  tenant: Pick<Tenant, 'is_active' | 'deleted_at'>;
}

export function TenantStatusBadge({ tenant }: TenantStatusBadgeProps) {
  if (tenant.deleted_at) {
    return <Badge variant="danger">Deleted</Badge>;
  }
  if (tenant.is_active) {
    return <Badge variant="success">Active</Badge>;
  }
  return <Badge variant="neutral">Inactive</Badge>;
}
