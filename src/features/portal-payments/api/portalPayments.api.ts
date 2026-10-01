export const PORTAL_PAYMENTS_API = {
  list: '/portal/payments',
  summary: '/portal/payments/summary',
  online: '/portal/payments/online',
  onlineDetail: (id: string) => `/portal/payments/online/${encodeURIComponent(id)}`,
  cancel: (id: string) => `/portal/payments/online/${encodeURIComponent(id)}/cancel`,
  retry: (id: string) => `/portal/payments/online/${encodeURIComponent(id)}/retry`,
  stripeConfig: '/portal/payments/stripe/config',
} as const;
