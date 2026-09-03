export type PaymentProofStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'REJECTED'
  | string;

export interface PaymentProof {
  id: string;
  invoiceId?: string;
  status?: PaymentProofStatus;
  amount?: number;
  currencyCode?: string;
  paymentDate?: string;
  reference?: string;
  notes?: string;
  reviewNotes?: string;
  fileName?: string;
  fileUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  raw?: Record<string, unknown>;
}

export interface UploadPaymentProofDto {
  amount?: number;
  payment_date?: string;
  reference?: string;
  notes?: string;
}

export interface ReviewPaymentProofDto {
  review_notes?: string;
}

export interface FinanceOpenItemsSummary {
  totalOutstanding?: number;
  totalPaidYtd?: number;
  count?: number;
  currencyCode?: string;
  raw?: Record<string, unknown>;
}
