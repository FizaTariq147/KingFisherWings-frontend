/**
 * Soft-delete helpers for Super Admin tenants.
 * Deleted roster comes from GET /tenants (status=deleted / include_deleted) — not browser storage.
 */

/** True when the tenant record is soft-deleted (any common API shape). */
export function isDeletedTenant(tenant: {
  deleted_at?: string | null;
  deletedAt?: unknown;
  is_deleted?: unknown;
  isDeleted?: unknown;
}): boolean {
  if (tenant.deleted_at) return true;
  if (typeof tenant.deletedAt === 'string' && tenant.deletedAt) return true;
  if (tenant.is_deleted === true || tenant.isDeleted === true) return true;
  return false;
}
