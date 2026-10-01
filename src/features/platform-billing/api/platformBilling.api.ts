export const PLATFORM_BILLING_API = {
  plans: '/platform/billing/plans',
  plan: (id: string) => `/platform/billing/plans/${encodeURIComponent(id)}`,
  reconcile: '/platform/billing/reconcile',
  stripeStatus: '/platform/billing/stripe/status',
  webhookEvents: '/platform/billing/webhook-events',
  replayWebhookEvent: (id: string) =>
    `/platform/billing/webhook-events/${encodeURIComponent(id)}/replay`,

  invoices: '/platform/invoices',
  invoice: (id: string) => `/platform/invoices/${encodeURIComponent(id)}`,
  invoiceSend: (id: string) => `/platform/invoices/${encodeURIComponent(id)}/send`,
  invoicePaymentLink: (id: string) => `/platform/invoices/${encodeURIComponent(id)}/payment-link`,
  invoiceCancel: (id: string) => `/platform/invoices/${encodeURIComponent(id)}/cancel`,
  invoicePdf: (id: string) => `/platform/invoices/${encodeURIComponent(id)}/pdf`,
  invoicePaymentStatus: (id: string) =>
    `/platform/invoices/${encodeURIComponent(id)}/payment-status`,
  invoicePayments: (id: string) => `/platform/invoices/${encodeURIComponent(id)}/payments`,
  invoiceManualPayments: (id: string) =>
    `/platform/invoices/${encodeURIComponent(id)}/manual-payments`,

  payments: '/platform/payments',
  payment: (id: string) => `/platform/payments/${encodeURIComponent(id)}`,
  paymentProof: (id: string) => `/platform/payments/${encodeURIComponent(id)}/proof`,
  paymentVerify: (id: string) => `/platform/payments/${encodeURIComponent(id)}/verify`,
  paymentReject: (id: string) => `/platform/payments/${encodeURIComponent(id)}/reject`,
  paymentRefund: (id: string) => `/platform/payments/${encodeURIComponent(id)}/refund`,

  tenantSubscription: (tenantId: string) =>
    `/platform/tenants/${encodeURIComponent(tenantId)}/subscription`,
  tenantSubscriptionChangePlan: (tenantId: string) =>
    `/platform/tenants/${encodeURIComponent(tenantId)}/subscription/change-plan`,
  tenantSubscriptionCancel: (tenantId: string) =>
    `/platform/tenants/${encodeURIComponent(tenantId)}/subscription/cancel`,
  tenantPaymentGateway: (tenantId: string) =>
    `/platform/tenants/${encodeURIComponent(tenantId)}/payment-gateway`,
} as const;
