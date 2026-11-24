import type { Company } from '../types/company.types';

/**
 * Soft-delete helpers for Super Admin companies.
 * Deleted roster is derived from soft-deleted tenants via GET /tenants — not browser storage.
 */

export function isDeletedCompany(company: {
  deleted_at?: string | null;
  deletedAt?: unknown;
  is_deleted?: unknown;
  isDeleted?: unknown;
}): boolean {
  if (company.deleted_at) return true;
  if (typeof company.deletedAt === 'string' && company.deletedAt) return true;
  if (company.is_deleted === true || company.isDeleted === true) return true;
  return false;
}

export function formatCompanyLabel(
  company: Pick<Company, 'name' | 'code'> & { legal_name?: string | null },
): string {
  for (const value of [company.name, company.legal_name, company.code]) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return 'This company';
}
