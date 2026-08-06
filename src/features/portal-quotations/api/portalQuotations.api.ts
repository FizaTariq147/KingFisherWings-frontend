export const PORTAL_QUOTATIONS_API = {
  summary: '/portal/quotations/summary',
  list: '/portal/quotations',
  request: '/portal/quotations/request',
  detail: (id: string) => `/portal/quotations/${id}`,
} as const;
