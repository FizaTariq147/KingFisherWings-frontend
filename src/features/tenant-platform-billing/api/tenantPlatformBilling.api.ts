export const TENANT_PLATFORM_BILLING_API = {
  plans: '/tenant/billing/plans',
  subscription: '/tenant/subscription',
  subscriptionCheckout: '/tenant/subscription/checkout',
  subscriptionChangePlan: '/tenant/subscription/change-plan',
  subscriptionCancel: '/tenant/subscription/cancel',

  invoices: '/tenant/platform-invoices',
  invoice: (id: string) => `/tenant/platform-invoices/${encodeURIComponent(id)}`,
  invoicePdf: (id: string) => `/tenant/platform-invoices/${encodeURIComponent(id)}/pdf`,
  invoicePaymentStatus: (id: string) =>
    `/tenant/platform-invoices/${encodeURIComponent(id)}/payment-status`,
  invoicePay: (id: string) => `/tenant/platform-invoices/${encodeURIComponent(id)}/pay`,
  invoiceCheckout: (id: string) => `/tenant/platform-invoices/${encodeURIComponent(id)}/checkout`,
  invoicePaymentProof: (id: string) =>
    `/tenant/platform-invoices/${encodeURIComponent(id)}/payment-proof`,

  payments: '/tenant/platform-payments',
  payment: (id: string) => `/tenant/platform-payments/${encodeURIComponent(id)}`,
  paymentProof: (id: string) => `/tenant/platform-payments/${encodeURIComponent(id)}/proof`,
} as const;
