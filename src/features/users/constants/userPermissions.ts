import type { UserRole } from '../constants/user.constants';

/** Visibility permission field keys on the User entity. */
export const USER_VISIBILITY_PERMISSIONS = [
  'can_see_sales',
  'can_see_cost',
  'can_see_gp',
  'can_see_invoices',
  'can_see_payments',
  'can_see_bank_balances',
  'can_see_ar_ap',
  'can_see_mgmt_reports',
  'can_see_job_pnl',
] as const;

export type UserVisibilityPermission = (typeof USER_VISIBILITY_PERMISSIONS)[number];

/** Functional flag field keys on the User entity. */
export const USER_FUNCTIONAL_FLAGS = [
  'is_salesperson',
  'is_cs_rep',
  'is_operations',
  'is_finance',
] as const;

export type UserFunctionalFlag = (typeof USER_FUNCTIONAL_FLAGS)[number];

/**
 * Roles that may be assigned when provisioning tenant staff/customer users.
 * Platform SUPER_ADMIN and workspace TENANT_ADMIN are not assignable here.
 */
export function isAssignableUserRole(
  role: string,
): role is Exclude<UserRole, 'SUPER_ADMIN' | 'TENANT_ADMIN'> {
  return role !== 'SUPER_ADMIN' && role !== 'TENANT_ADMIN';
}

/**
 * Tenant Admin (ERP) may manage users in their own workspace.
 * Super Admin must not manage tenant users from the platform console.
 */
export function canManageUsers(isTenantAdminSession: boolean): boolean {
  return isTenantAdminSession;
}

/** Role slugs that may access Tenant Admin user management screens. */
export const TENANT_USER_MANAGER_ROLE_SLUGS = [
  'admin',
  'tenant_admin',
  'tenant-admin',
  'tenant_owner',
  'tenant',
  'TENANT_ADMIN',
] as const;

export function isTenantUserManagerRole(roleSlug?: string | null): boolean {
  if (!roleSlug) return false;
  const normalized = roleSlug
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
  return (
    normalized === 'admin' ||
    normalized === 'tenant_admin' ||
    normalized === 'tenantadmin' ||
    normalized === 'tenant_owner' ||
    normalized === 'tenantowner' ||
    normalized === 'tenant' ||
    roleSlug === 'TENANT_ADMIN'
  );
}

/** Normalize role from login store (string) or AuthContext (`{ slug }`). */
export function resolveAuthRoleSlug(role: unknown): string {
  if (!role) return '';
  if (typeof role === 'string') return role;
  if (typeof role === 'object') {
    const record = role as { slug?: unknown; name?: unknown };
    if (typeof record.slug === 'string' && record.slug) return record.slug;
    if (typeof record.name === 'string' && record.name) return record.name;
  }
  return '';
}

/** ERP home path by panel: Tenant Admin → Users; User/Customer → ops dashboard. */
export function getErpHomePath(roleSlug?: string | null): string {
  return isTenantUserManagerRole(roleSlug) ? '/admin/users' : '/dashboard';
}
