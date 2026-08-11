export const VENDOR_PAYMENTS_API = {
  list: '/vendor/payments',
  remittance: (id: string) => `/vendor/payments/${encodeURIComponent(id)}/remittance.pdf`,
} as const;

export const VENDOR_ADVANCES_API = {
  list: '/vendor/advances',
} as const;
