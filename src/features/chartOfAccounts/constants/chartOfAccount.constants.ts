export const ACCOUNT_GROUPS = [
  'ASSETS',
  'LIABILITIES',
  'EQUITY',
  'REVENUE',
  'EXPENSES',
] as const;

export const ACCOUNT_TYPES = [
  'CURRENT_ASSET',
  'FIXED_ASSET',
  'CURRENT_LIABILITY',
  'LONG_TERM_LIABILITY',
  'EQUITY',
  'REVENUE',
  'COST_OF_SALES',
  'EXPENSE',
  'OTHER_INCOME',
  'OTHER_EXPENSE',
] as const;

export const ACCOUNT_SUB_TYPES = [
  'BANK',
  'CASH',
  'TRADE_RECEIVABLE',
  'TRADE_PAYABLE',
  'TAX',
  'INVENTORY',
  'FIXED_ASSET',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
  'GENERAL',
] as const;

export const OPENING_BALANCE_TYPES = ['DEBIT', 'CREDIT'] as const;

export const COA_CURRENCY_OPTIONS = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR'] as const;

export type AccountGroup = (typeof ACCOUNT_GROUPS)[number];
export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type AccountSubType = (typeof ACCOUNT_SUB_TYPES)[number];
export type OpeningBalanceType = (typeof OPENING_BALANCE_TYPES)[number];

export const ACCOUNT_GROUP_LABELS: Record<AccountGroup, string> = {
  ASSETS: 'Assets',
  LIABILITIES: 'Liabilities',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  EXPENSES: 'Expenses',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CURRENT_ASSET: 'Current asset',
  FIXED_ASSET: 'Fixed asset',
  CURRENT_LIABILITY: 'Current liability',
  LONG_TERM_LIABILITY: 'Long-term liability',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  COST_OF_SALES: 'Cost of sales',
  EXPENSE: 'Expense',
  OTHER_INCOME: 'Other income',
  OTHER_EXPENSE: 'Other expense',
};

/** Client-side page size for list UX (Swagger list has no page/limit). */
export const DEFAULT_COA_PAGE_SIZE = 25;
