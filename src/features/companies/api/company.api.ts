/** Company module REST paths — Swagger tag "Companies" (tenant ERP). */
export const COMPANY_API = {
  list: '/companies',
  /** Soft-deleted companies (trash) until permanently deleted. */
  deleted: '/companies/deleted',
  byId: (id: string) => `/companies/${id}`,
  restore: (id: string) => `/companies/${id}/restore`,
  permanent: (id: string) => `/companies/${id}/permanent`,
} as const;
