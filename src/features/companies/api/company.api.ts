/** Company module REST paths — Swagger tag "Companies". */
export const COMPANY_API = {
  list: '/companies',
  byId: (id: string) => `/companies/${id}`,
} as const;
