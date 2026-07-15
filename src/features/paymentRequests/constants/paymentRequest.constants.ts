export const PAYMENT_REQUEST_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'PAID',
  'CANCELLED',
] as const;

export type PaymentRequestStatus = (typeof PAYMENT_REQUEST_STATUSES)[number];

export const PAYMENT_REQUEST_STATUS_LABELS: Record<PaymentRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

export const DEFAULT_PAYMENT_REQUEST_PAGE_SIZE = 20;
