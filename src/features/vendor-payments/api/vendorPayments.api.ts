export const VENDOR_PAYMENTS_API = {
  list: '/vendor/payments',
  summary: '/vendor/payments/summary',
  remittance: (id: string) => `/vendor/payments/${encodeURIComponent(id)}/remittance.pdf`,
  remittanceSendEmail: (id: string) =>
    `/vendor/payments/${encodeURIComponent(id)}/remittance/send-email`,
} as const;

export const VENDOR_ADVANCES_API = {
  list: '/vendor/advances',
} as const;
