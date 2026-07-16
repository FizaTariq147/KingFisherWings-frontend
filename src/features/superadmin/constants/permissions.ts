/**
 * Super Admin platform capabilities.
 * User management inside a tenant is owned by Tenant Admin (ERP auth), not Super Admin.
 */
export const SUPER_ADMIN_CAPABILITIES = {
  companies: {
    create: true,
    list: true,
    view: true,
    edit: true,
    activateDeactivate: true,
    delete: true,
  },
  tenants: {
    create: true,
    list: true,
    view: true,
    edit: true,
    activateDeactivate: true,
    manageSubscriptions: true,
    viewMetrics: true,
  },
  /** Super Admin must not manage users inside tenant workspaces. */
  tenantUsers: {
    create: false,
    view: false,
    edit: false,
    activateDeactivate: false,
    delete: false,
    accessUserManagementScreens: false,
  },
} as const;

export function canSuperAdminAccessTenantUsers(): boolean {
  return SUPER_ADMIN_CAPABILITIES.tenantUsers.accessUserManagementScreens;
}

export function canSuperAdminManageCompanies(): boolean {
  return SUPER_ADMIN_CAPABILITIES.companies.list;
}

export function canSuperAdminManageTenants(): boolean {
  return SUPER_ADMIN_CAPABILITIES.tenants.list;
}
