/** Tenant module REST paths — mirrors Swagger tag "Tenants (Super Admin)". */
export const TENANT_API = {
  list: '/tenants',
  statistics: '/tenants/statistics',
  byId: (id: string) => `/tenants/${id}`,
  restore: (id: string) => `/tenants/${id}/restore`,
  activate: (id: string) => `/tenants/${id}/activate`,
  deactivate: (id: string) => `/tenants/${id}/deactivate`,
} as const;
