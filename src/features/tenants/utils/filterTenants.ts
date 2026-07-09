import type { PaginationMeta, Tenant } from '../types/tenant.types';

export type TenantStatusFilter = 'active' | 'inactive' | 'deleted';

export function filterTenantsByStatus(
  tenants: Tenant[],
  status: TenantStatusFilter,
): Tenant[] {
  switch (status) {
    case 'active':
      return tenants.filter((t) => !t.deleted_at && t.is_active);
    case 'inactive':
      return tenants.filter((t) => !t.deleted_at && !t.is_active);
    case 'deleted':
      return tenants.filter((t) => !!t.deleted_at);
    default:
      return tenants;
  }
}

export function paginateTenants(
  tenants: Tenant[],
  page: number,
  limit: number,
): { items: Tenant[]; meta: PaginationMeta } {
  const total = tenants.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: tenants.slice(start, start + limit),
    meta: { page: safePage, limit, total, totalPages },
  };
}
