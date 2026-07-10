export const USER_ROLES = [
  'SUPER_ADMIN',
  'TENANT_ADMIN',
  'BRANCH_MANAGER',
  'FINANCE_MANAGER',
  'ACCOUNTANT',
  'SALES_MANAGER',
  'SALES_EXECUTIVE',
  'OPERATIONS_MANAGER',
  'OPERATIONS_EXECUTIVE',
  'WAREHOUSE_STAFF',
  'HR_MANAGER',
  'CUSTOMER',
  'AGENT',
  'READ_ONLY',
  'DOCUMENTATION',
  'CUSTOMER_SUPPORT',
  'DRIVER',
] as const;

export const USER_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'INVITED',
  'SUSPENDED',
  'LOCKED',
] as const;

export const USER_SORT_FIELDS = [
  'created_at',
  'updated_at',
  'first_name',
  'last_name',
  'email',
  'last_login_at',
  'status',
  'role',
] as const;

export const USER_SORT_ORDERS = ['asc', 'desc'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type UserSortField = (typeof USER_SORT_FIELDS)[number];
export type UserSortOrder = (typeof USER_SORT_ORDERS)[number];

export const DEFAULT_USER_LIST_SORT: UserSortField = 'created_at';
export const DEFAULT_USER_LIST_ORDER: UserSortOrder = 'desc';
export const DEFAULT_USER_PAGE_SIZE = 20;

/** Super Admin user module — assignable roles (excludes SUPER_ADMIN for tenant users). */
export const ASSIGNABLE_USER_ROLES = USER_ROLES.filter(
  (role) => role !== 'SUPER_ADMIN',
) as Exclude<UserRole, 'SUPER_ADMIN'>[];

export const ACTIVE_USER_STATUSES: UserStatus[] = ['ACTIVE'];
export const INACTIVE_USER_STATUSES: UserStatus[] = ['INACTIVE', 'SUSPENDED', 'LOCKED'];
