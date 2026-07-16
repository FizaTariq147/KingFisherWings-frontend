export const CHEQUE_ROUTE_PREFIX = '/gl/cheques';

export const CHEQUE_API = {
  list: '/gl/cheques',
  create: '/gl/cheques',
  pdcDue: '/gl/cheques/reports/pdc-due',
  byId: (id: string) => `/gl/cheques/${id}`,
  deposit: (id: string) => `/gl/cheques/${id}/deposit`,
  clear: (id: string) => `/gl/cheques/${id}/clear`,
  bounce: (id: string) => `/gl/cheques/${id}/bounce`,
  cancel: (id: string) => `/gl/cheques/${id}/cancel`,
} as const;
