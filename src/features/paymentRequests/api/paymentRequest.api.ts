export const PAYMENT_REQUEST_ROUTE_PREFIX = '/payment-requests';

export const PAYMENT_REQUEST_API = {
  list: '/payment-requests',
  create: '/payment-requests',
  byId: (id: string) => `/payment-requests/${id}`,
  approve: (id: string) => `/payment-requests/${id}/approve`,
  reject: (id: string) => `/payment-requests/${id}/reject`,
  markPaid: (id: string) => `/payment-requests/${id}/mark-paid`,
} as const;
