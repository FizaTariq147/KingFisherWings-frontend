export const CHEQUE_TYPES = ['RECEIVABLE', 'PAYABLE'] as const;

export const CHEQUE_STATUSES = [
  'PENDING',
  'DEPOSITED',
  'CLEARED',
  'BOUNCED',
  'CANCELLED',
] as const;

export const CHEQUE_CURRENCY_OPTIONS = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR'] as const;

export type ChequeType = (typeof CHEQUE_TYPES)[number];
export type ChequeStatus = (typeof CHEQUE_STATUSES)[number];

export const CHEQUE_TYPE_LABELS: Record<ChequeType, string> = {
  RECEIVABLE: 'Receivable (customer)',
  PAYABLE: 'Payable (vendor)',
};

export const CHEQUE_STATUS_LABELS: Record<ChequeStatus, string> = {
  PENDING: 'Pending',
  DEPOSITED: 'Deposited',
  CLEARED: 'Cleared',
  BOUNCED: 'Bounced',
  CANCELLED: 'Cancelled',
};

export const DEFAULT_CHEQUE_PAGE_SIZE = 25;

export const DEFAULT_PDC_WITHIN_DAYS = 30;

export type ChequeSortKey = 'cheque_number' | 'cheque_date' | 'due_date' | 'amount';
