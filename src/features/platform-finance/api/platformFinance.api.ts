/** Super Admin — platform ledger / finance (Swagger Platform Finance tag). */
export const PLATFORM_FINANCE_API = {
  status: '/platform/finance/status',
  apAging: '/platform/finance/ap/aging',
  apOpenItems: '/platform/finance/ap/open-items',
  apStatement: (partyId: string) =>
    `/platform/finance/ap/statement/${encodeURIComponent(partyId)}`,
  arAging: '/platform/finance/ar/aging',
  arOpenItems: '/platform/finance/ar/open-items',
  arStatement: (partyId: string) =>
    `/platform/finance/ar/statement/${encodeURIComponent(partyId)}`,
  arTenantStatement: (tenantId: string) =>
    `/platform/finance/ar/tenant/${encodeURIComponent(tenantId)}/statement`,
  payments: '/platform/finance/payments',
  paymentPost: (id: string) => `/platform/finance/payments/${encodeURIComponent(id)}/post`,
  receivables: '/platform/finance/receivables',
  vendorBills: '/platform/finance/vendor-bills',
  vouchers: '/platform/finance/vouchers',
  voucher: (id: string) => `/platform/finance/vouchers/${encodeURIComponent(id)}`,
  reports: {
    balanceSheet: '/platform/finance/reports/balance-sheet',
    cashFlow: '/platform/finance/reports/cash-flow',
    profitAndLoss: '/platform/finance/reports/profit-and-loss',
    trialBalance: '/platform/finance/reports/trial-balance',
  },
} as const;
