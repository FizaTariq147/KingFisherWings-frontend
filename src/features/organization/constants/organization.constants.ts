export const DOCUMENT_TYPES = [
  'JOB_NUMBER',
  'QUOTATION',
  'INVOICE',
  'CREDIT_NOTE',
  'DEBIT_NOTE',
  'HAWB',
  'MAWB',
  'HBL',
  'MBL',
  'VOUCHER',
  'BOOKING',
  'GRN',
  'GDO',
  'PURCHASE_INVOICE',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  JOB_NUMBER: 'Job Number',
  QUOTATION: 'Quotation',
  INVOICE: 'Invoice',
  CREDIT_NOTE: 'Credit Note',
  DEBIT_NOTE: 'Debit Note',
  HAWB: 'HAWB',
  MAWB: 'MAWB',
  HBL: 'HBL',
  MBL: 'MBL',
  VOUCHER: 'Voucher',
  BOOKING: 'Booking',
  GRN: 'GRN',
  GDO: 'GDO',
  PURCHASE_INVOICE: 'Purchase Invoice',
};

export const RESET_FREQUENCIES = ['NEVER', 'YEARLY', 'MONTHLY'] as const;
export type ResetFrequency = (typeof RESET_FREQUENCIES)[number];

export const RESET_FREQUENCY_LABELS: Record<ResetFrequency, string> = {
  NEVER: 'Never',
  YEARLY: 'Yearly',
  MONTHLY: 'Monthly',
};

export const DEFAULT_BANK_PAGE_SIZE = 20;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
] as const;

export const TIMEZONE_OPTIONS = [
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Europe/London',
  'UTC',
] as const;

export const CURRENCY_OPTIONS = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR'] as const;
