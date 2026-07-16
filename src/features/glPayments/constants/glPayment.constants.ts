export const PAYMENT_DIRECTIONS = ['RECEIPT', 'PAYMENT'] as const;

export const GL_PAYMENT_STATUSES = ['DRAFT', 'POSTED', 'CANCELLED'] as const;

export const PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'CHEQUE',
  'CREDIT_CARD',
  'OTHER',
] as const;

export const GL_PAYMENT_CURRENCY_OPTIONS = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR'] as const;

export type PaymentDirection = (typeof PAYMENT_DIRECTIONS)[number];
export type GlPaymentStatus = (typeof GL_PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_DIRECTION_LABELS: Record<PaymentDirection, string> = {
  RECEIPT: 'Customer receipt (AR)',
  PAYMENT: 'Vendor payment (AP)',
};

export const GL_PAYMENT_STATUS_LABELS: Record<GlPaymentStatus, string> = {
  DRAFT: 'Draft',
  POSTED: 'Posted',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank transfer',
  CHEQUE: 'Cheque',
  CREDIT_CARD: 'Credit card',
  OTHER: 'Other',
};

export const DEFAULT_GL_PAYMENT_PAGE_SIZE = 25;
