export const GL_FINANCIAL_REPORTS_ROUTE_PREFIX = '/gl/reports';

export const GL_FINANCIAL_REPORTS_API = {
  trialBalance: '/gl/reports/trial-balance',
  balanceSheet: '/gl/reports/balance-sheet',
  profitAndLoss: '/gl/reports/profit-and-loss',
  cashFlow: '/gl/reports/cash-flow',
  vatReturn: '/gl/reports/vat-return',
} as const;
