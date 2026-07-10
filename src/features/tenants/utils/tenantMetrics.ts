import type { Tenant } from '../types/tenant.types';

export function getTenantMetric(
  tenant: Tenant,
  field: 'total_users' | 'total_branches',
): string {
  const value = tenant[field];
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '—';
}

export function formatStorageUsage(tenant: Tenant): string {
  const used = tenant.storage_used_gb;
  const limit = tenant.max_storage_gb;
  if (typeof used === 'number' && Number.isFinite(used)) {
    return `${used} / ${limit} GB`;
  }
  return `0 / ${limit} GB`;
}
