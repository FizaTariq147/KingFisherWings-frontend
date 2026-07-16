import { Badge } from '@/components/ui/Badge';
import type { Company } from '../../types/company.types';

interface CompanyStatusBadgeProps {
  company: Company;
}

export function CompanyStatusBadge({ company }: CompanyStatusBadgeProps) {
  if ((company as { is_draft?: boolean }).is_draft) {
    return <Badge variant="info">Draft</Badge>;
  }
  if (company.deleted_at) {
    return <Badge variant="neutral">Deleted</Badge>;
  }
  if (!company.is_active) {
    return <Badge variant="warning">Inactive</Badge>;
  }
  return <Badge variant="success">Active</Badge>;
}

export function CompanyDefaultBadge({ isDefault }: { isDefault: boolean }) {
  if (!isDefault) return null;
  return <Badge variant="primary">Default</Badge>;
}
