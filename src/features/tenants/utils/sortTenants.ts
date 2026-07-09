import type { Tenant, TenantListSortBy, TenantListSortOrder } from '../types/tenant.types';

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);

  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}

export function sortTenants(
  tenants: Tenant[],
  sortBy?: TenantListSortBy,
  order: TenantListSortOrder = 'asc',
): Tenant[] {
  if (!sortBy) return tenants;

  const dir = order === 'desc' ? -1 : 1;
  return [...tenants].sort((a, b) => compareValues(a[sortBy], b[sortBy]) * dir);
}
