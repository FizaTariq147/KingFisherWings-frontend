export type PaymentProofStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'APPROVED'
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
  /** Maps to multipart `amount_claimed` (backend validated DTO). */
  amount?: number;
  /** YYYY-MM-DD → multipart `payment_date`. */
  payment_date?: string;
  reference?: string;
  notes?: string;
  /** Optional; ISO currency from the open invoice. */
  currency_code?: string;
}

export interface ReviewPaymentProofDto {
  review_notes?: string;
}

export interface ApprovePaymentProofDto {
  review_notes?: string;
  payment_method?: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT_CARD' | 'OTHER';
  bank_account_id?: string;
}

export interface FinanceOpenItemsSummary {
  totalOutstanding?: number;
  totalPaidYtd?: number;
  count?: number;
  currencyCode?: string;
  raw?: Record<string, unknown>;
}
