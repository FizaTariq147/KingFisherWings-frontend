export const CHART_OF_ACCOUNT_ROUTE_PREFIX = '/gl/accounts';

export const CHART_OF_ACCOUNT_API = {
  list: '/gl/accounts',
  create: '/gl/accounts',
  tree: '/gl/accounts/tree',
  trialBalance: '/gl/accounts/reports/trial-balance',
  seedDefaults: '/gl/accounts/seed-defaults',
  byId: (id: string) => `/gl/accounts/${id}`,
  ledger: (id: string) => `/gl/accounts/${id}/ledger`,
} as const;
