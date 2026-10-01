export const ONLINE_PAYMENTS_STRIPE_API = {
  status: '/payments/stripe/status',
  config: '/payments/stripe/config',
  settings: '/payments/stripe/settings',
  rotateWebhook: '/payments/stripe/settings/rotate-webhook',
  reconcile: '/payments/stripe/reconcile',
} as const;

export const ONLINE_PAYMENTS_API = {
  list: '/payments',
  detail: (id: string) => `/payments/${encodeURIComponent(id)}`,
  checkout: (id: string) => `/payments/${encodeURIComponent(id)}/checkout`,
  checkoutStatus: (id: string) => `/payments/${encodeURIComponent(id)}/checkout-status`,
  cancel: (id: string) => `/payments/${encodeURIComponent(id)}/cancel`,
  retry: (id: string) => `/payments/${encodeURIComponent(id)}/retry`,
  refund: (id: string) => `/payments/${encodeURIComponent(id)}/refund`,
  refunds: (id: string) => `/payments/${encodeURIComponent(id)}/refunds`,
  refundById: (refundId: string) => `/payments/refunds/${encodeURIComponent(refundId)}`,

  history: '/payments/history',
  historyCustomer: (customerId: string) =>
    `/payments/history/customer/${encodeURIComponent(customerId)}`,
  historyVendor: (vendorId: string) =>
    `/payments/history/vendor/${encodeURIComponent(vendorId)}`,
  historyInvoice: (invoiceId: string) =>
    `/payments/history/invoice/${encodeURIComponent(invoiceId)}`,
} as const;

export const ONLINE_INVOICE_PAYMENTS_API = {
  pay: (invoiceId: string) => `/invoices/${encodeURIComponent(invoiceId)}/pay`,
  paymentLink: (invoiceId: string) => `/invoices/${encodeURIComponent(invoiceId)}/payment-link`,
  paymentLinks: (invoiceId: string) => `/invoices/${encodeURIComponent(invoiceId)}/payment-links`,
  revokePaymentLink: (invoiceId: string, linkId: string) =>
    `/invoices/${encodeURIComponent(invoiceId)}/payment-links/${encodeURIComponent(linkId)}/revoke`,
  paymentStatus: (invoiceId: string) =>
    `/invoices/${encodeURIComponent(invoiceId)}/payment-status`,
  payments: (invoiceId: string) => `/invoices/${encodeURIComponent(invoiceId)}/payments`,
} as const;
