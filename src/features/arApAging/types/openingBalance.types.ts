export interface PostArApOpeningBalanceDto {
  party_id: string;
  amount: number;
  currency: string;
  date: string;
  /** Default true — posts a Customer/Purchase Invoice with job_id null. */
  create_manual_invoice?: boolean;
  /** Optional CoA id to update AR/AP control account. */
  link_coa?: string;
  remarks?: string;
}

export interface PostGlAccountOpeningBalanceDto {
  amount: number;
  /** DEBIT | CREDIT */
  type?: 'DEBIT' | 'CREDIT' | string;
  date?: string;
  /** When true, post opening balance voucher against retained earnings (3200). */
  post_voucher?: boolean;
  remarks?: string;
}

export interface OpeningBalanceResult {
  invoice_id?: string;
  invoice_number?: string;
  voucher_id?: string;
  voucher_number?: string;
  message?: string;
  raw?: Record<string, unknown>;
}
