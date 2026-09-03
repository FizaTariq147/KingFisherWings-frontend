import type { PermissionKey } from '@/types/auth.types';
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

const STAFF_FLAG_KEYS = [...USER_FUNCTIONAL_FLAGS, ...USER_VISIBILITY_PERMISSIONS] as const;

const SNAKE_TO_CAMEL: Record<string, string> = {
  is_salesperson: 'isSalesperson',
  is_cs_rep: 'isCsRep',
  is_operations: 'isOperations',
  is_finance: 'isFinance',
  can_see_sales: 'canSeeSales',
  can_see_cost: 'canSeeCost',
  can_see_gp: 'canSeeGp',
  can_see_invoices: 'canSeeInvoices',
  can_see_payments: 'canSeePayments',
  can_see_bank_balances: 'canSeeBankBalances',
  can_see_ar_ap: 'canSeeArAp',
  can_see_mgmt_reports: 'canSeeMgmtReports',
  can_see_job_pnl: 'canSeeJobPnl',
};

function readTruthyFlag(record: Record<string, unknown>, key: string): boolean {
  const camel = SNAKE_TO_CAMEL[key];
  const value = record[key] ?? (camel ? record[camel] : undefined);
  return value === true || value === 'true' || value === 1 || value === '1';
}

/** True when /auth/me (or user payload) includes Tenant Admin staff access flags. */
export function hasStaffAccessFlags(record: Record<string, unknown>): boolean {
  return STAFF_FLAG_KEYS.some((key) => {
    const camel = SNAKE_TO_CAMEL[key];
    return key in record || (camel != null && camel in record);
  });
}

export function isMenuPermissionKey(key: string): boolean {
  return key.startsWith('menu_');
}

/**
 * Map Tenant Admin user flags / visibility permissions (from GET /auth/me)
 * onto sidebar `menu_*` keys so staff nav matches what was assigned at create/edit.
 *
 * Functional flags drive modules:
 * - Sales → Sales + Quotations (+ Customers)
 * - Operations → Air/Sea jobs + Documentation + NVOCC
 * - Finance → Finance hub (invoices, payment requests, …)
 * - CS → Customers (+ Vendors)
 *
 * Visibility flags refine Accounts / Reports; `can_see_invoices` alone does NOT open Finance.
 */
export function menuKeysFromStaffAccess(record: Record<string, unknown>): PermissionKey[] {
  const keys = new Set<PermissionKey>();

  const isSales = readTruthyFlag(record, 'is_salesperson') || readTruthyFlag(record, 'can_see_sales');
  const isCs = readTruthyFlag(record, 'is_cs_rep');
  const isOps = readTruthyFlag(record, 'is_operations');
  const isFinance = readTruthyFlag(record, 'is_finance');

  if (isCs || isSales || isOps) {
    keys.add('menu_customers');
  }

  if (isSales) {
    keys.add('menu_sales');
    keys.add('menu_quotations');
  }

  if (isOps || readTruthyFlag(record, 'can_see_job_pnl')) {
    keys.add('menu_jobs_air_export');
    keys.add('menu_jobs_sea_export');
    keys.add('menu_jobs_sea_import');
    keys.add('menu_documentation');
    keys.add('menu_nvocc');
  }

  if (isOps) {
    keys.add('menu_quotations');
  }

  // Finance module requires the Finance functional flag — not can_see_invoices alone.
  if (isFinance) {
    keys.add('menu_finance');
  }

  // Vendors are a separate module (not the same as Finance invoices).
  if (isFinance || isCs) {
    keys.add('menu_vendors');
  }

  if (
    isFinance ||
    readTruthyFlag(record, 'can_see_payments') ||
    readTruthyFlag(record, 'can_see_ar_ap') ||
    readTruthyFlag(record, 'can_see_bank_balances')
  ) {
    keys.add('menu_accounts');
  }

  if (readTruthyFlag(record, 'can_see_mgmt_reports')) {
    keys.add('menu_reports');
    keys.add('menu_management');
  }

  return [...keys];
}

/**
 * Build the effective permission list for a signed-in staff user.
 * When Tenant Admin flags are present on /auth/me, those define `menu_*` keys
 * (JWT role menus cannot re-open Finance/Ops the admin turned off).
 * Action permissions (quotations.negotiate, gl.*, …) still come from JWT / me.
 */
export function mergeStaffPermissions(opts: {
  fromMe: string[];
  fromJwt: string[];
  fromStaffFlags: PermissionKey[];
  staffFlagsPresent: boolean;
  isTenantAdmin: boolean;
}): PermissionKey[] {
  const { fromMe, fromJwt, fromStaffFlags, staffFlagsPresent, isTenantAdmin } = opts;

  if (isTenantAdmin) {
    return [...new Set([...fromMe, ...fromJwt, ...fromStaffFlags])] as PermissionKey[];
  }

  const nonMenu = [...fromMe, ...fromJwt].filter((key) => !isMenuPermissionKey(key));

  if (staffFlagsPresent) {
    return [
      ...new Set([
        ...fromStaffFlags,
        ...nonMenu,
        'menu_dashboard',
        'menu_settings',
      ]),
    ] as PermissionKey[];
  }

  // /me had no staff flags — fall back to JWT / role menus so older tenants still work.
  return [
    ...new Set([...fromMe, ...fromJwt, ...fromStaffFlags, 'menu_dashboard', 'menu_settings']),
  ] as PermissionKey[];
}

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
