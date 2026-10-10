import { StatusBadge } from '@/components/erp';
import { crmLabel } from '../constants/crm.constants';

export function CrmStatusBadge({ status }: { status?: string }) {
  const value = status || 'UNKNOWN';
  return <StatusBadge status={value} label={crmLabel(value)} />;
}
