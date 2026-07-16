export const BANK_RECON_STATUSES = ['DRAFT', 'COMPLETED', 'CANCELLED'] as const;
export type BankReconciliationStatus = (typeof BANK_RECON_STATUSES)[number];

export const BANK_RECON_STATUS_LABELS: Record<BankReconciliationStatus, string> = {
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
