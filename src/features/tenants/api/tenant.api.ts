/** Tenant module REST paths — mirrors Swagger tag "Tenants (Super Admin)". */
export const TENANT_API = {
  list: '/tenants',
  statistics: '/tenants/statistics',
  syncPermissionsAll: '/tenants/sync-permissions',
  byId: (id: string) => `/tenants/${id}`,
  syncPermissions: (id: string) => `/tenants/${id}/sync-permissions`,
  restore: (id: string) => `/tenants/${id}/restore`,
  activate: (id: string) => `/tenants/${id}/activate`,
  deactivate: (id: string) => `/tenants/${id}/deactivate`,
} as const;
