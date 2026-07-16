export const SAVED_REPORT_ROUTE_PREFIX = '/gl/saved-reports';

export const SAVED_REPORT_API = {
  list: '/gl/saved-reports',
  create: '/gl/saved-reports',
  byId: (id: string) => `/gl/saved-reports/${id}`,
} as const;
