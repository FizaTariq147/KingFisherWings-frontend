export const SAVED_REPORT_TYPES = [
  'BALANCE_SHEET',
  'PROFIT_AND_LOSS',
  'CASH_FLOW',
  'TRIAL_BALANCE',
  'VAT_RETURN',
  'AR_AGING',
  'AP_AGING',
  'JOB_PROFITABILITY',
  'MIS_DASHBOARD',
  'CUSTOM',
] as const;

export type SavedReportType = (typeof SAVED_REPORT_TYPES)[number];

export const SAVED_REPORT_TYPE_LABELS: Record<SavedReportType, string> = {
  BALANCE_SHEET: 'Balance Sheet',
  PROFIT_AND_LOSS: 'Profit & Loss',
  CASH_FLOW: 'Cash Flow',
  TRIAL_BALANCE: 'Trial Balance',
  VAT_RETURN: 'VAT Return',
  AR_AGING: 'AR Aging',
  AP_AGING: 'AP Aging',
  JOB_PROFITABILITY: 'Job Profitability',
  MIS_DASHBOARD: 'MIS Dashboard',
  CUSTOM: 'Custom',
};

export const DEFAULT_SAVED_REPORT_PAGE_SIZE = 25;
