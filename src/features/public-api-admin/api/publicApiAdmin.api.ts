export const PUBLIC_API_ADMIN = {
  keys: '/admin/api-keys',
  revokeKey: (id: string) => `/admin/api-keys/${encodeURIComponent(id)}/revoke`,
  webhooks: '/admin/webhooks',
  testDispatch: '/admin/webhooks/test-dispatch',
  billingStatus: '/admin/billing/status',
  checkout: '/admin/billing/checkout-session',
} as const;
