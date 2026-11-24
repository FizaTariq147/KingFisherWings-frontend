/** Tenant module REST paths — mirrors Swagger tag "Tenants (Super Admin)". */
export const TENANT_API = {
  list: '/tenants',
  /** Soft-deleted tenants (trash) until permanently deleted. Register before :id. */
  deleted: '/tenants/deleted',
  statistics: '/tenants/statistics',
  /** Product module catalog for Features allow-list (includes shipments). */
  productModules: '/tenants/product-modules',
  syncPermissionsAll: '/tenants/sync-permissions',
  byId: (id: string) => `/tenants/${id}`,
  /** Platform nested users list (not tenant ERP /users). */
  users: (id: string) => `/tenants/${id}/users`,
  features: (id: string) => `/tenants/${id}/features`,
  syncPermissions: (id: string) => `/tenants/${id}/sync-permissions`,
  restore: (id: string) => `/tenants/${id}/restore`,
  /** Irreversible hard-delete — only when already soft-deleted. */
  permanent: (id: string) => `/tenants/${id}/permanent`,
  activate: (id: string) => `/tenants/${id}/activate`,
  deactivate: (id: string) => `/tenants/${id}/deactivate`,
} as const;
