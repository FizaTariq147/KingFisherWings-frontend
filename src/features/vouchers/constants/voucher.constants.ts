export const VOUCHER_TYPES = [
  'JOURNAL',
  'BANK_PAYMENT',
  'CASH_PAYMENT',
  'BANK_RECEIPT',
  'CASH_RECEIPT',
  'CONTRA',
  'PURCHASE_INVOICE',
  'PURCHASE_CREDIT_NOTE',
  'OPENING_BALANCE',
  'RECURRING',
] as const;

export const VOUCHER_STATUSES = ['DRAFT', 'POSTED', 'REVERSED', 'CANCELLED'] as const;

export const VOUCHER_CURRENCY_OPTIONS = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR'] as const;

export type VoucherType = (typeof VOUCHER_TYPES)[number];
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];

export const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  JOURNAL: 'Journal',
  BANK_PAYMENT: 'Bank payment',
  CASH_PAYMENT: 'Cash payment',
  BANK_RECEIPT: 'Bank receipt',
  CASH_RECEIPT: 'Cash receipt',
  CONTRA: 'Contra',
  PURCHASE_INVOICE: 'Purchase invoice',
  PURCHASE_CREDIT_NOTE: 'Purchase credit note',
  OPENING_BALANCE: 'Opening balance',
  RECURRING: 'Recurring',
};

export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  DRAFT: 'Draft',
  POSTED: 'Posted',
  REVERSED: 'Reversed',
  CANCELLED: 'Cancelled',
};

export const DEFAULT_VOUCHER_PAGE_SIZE = 25;
