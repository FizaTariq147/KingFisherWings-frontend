import type { Company } from '../types/company.types';

export type CompanyStatusFilter = 'active' | 'inactive' | 'deleted';

export function filterCompaniesByStatus<T extends Company>(
  companies: T[],
  status: CompanyStatusFilter,
): T[] {
  switch (status) {
    case 'active':
      return companies.filter((c) => !c.deleted_at && c.is_active);
    case 'inactive':
      return companies.filter((c) => !c.deleted_at && !c.is_active);
    case 'deleted':
      return companies.filter((c) => !!c.deleted_at);
    default:
      return companies;
  }
}

export function filterCompaniesBySearch<T extends Company>(companies: T[], search?: string): T[] {
  const q = search?.trim().toLowerCase();
  if (!q) return companies;

  return companies.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.legal_name?.toLowerCase().includes(q) ?? false),
  );
}

export function paginateCompanies<T extends Company>(
  companies: T[],
  page: number,
  limit: number,
) {
  const total = companies.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: companies.slice(start, start + limit),
    meta: { page: safePage, limit, total, totalPages },
  };
}