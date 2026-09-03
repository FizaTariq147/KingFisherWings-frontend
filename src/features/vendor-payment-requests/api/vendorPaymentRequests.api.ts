export const VENDOR_PAYMENT_REQUESTS_API = {
  list: '/vendor/payment-requests',
  detail: (id: string) => `/vendor/payment-requests/${encodeURIComponent(id)}`,
} as const;
