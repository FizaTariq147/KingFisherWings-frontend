export interface PortalCreditSummary {
  creditLimit?: number;
  used?: number;
  available?: number;
  currencyCode?: string;
  creditStatus?: string;
  creditDays?: number;
}

export interface PortalAgingBucket {
  label: string;
  amount: number;
}

export interface PortalAgingResult {
  asOf?: string;
  buckets: PortalAgingBucket[];
  total?: number;
}

export interface PortalStatementLine {
  id: string;
  date?: string;
  type?: string;
  reference?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  description?: string;
  /** UNPAID | PROOF_UPLOADED | PAID */
  paymentStatus?: string;
}

export interface PortalPendingJobCharge {
  chargeId: string;
  jobId?: string;
  jobNumber?: string;
  description?: string;
  saleAmount?: number;
  currencyCode?: string;
  needsInvoice?: boolean;
}

export interface PortalOpenInvoiceLine {
  id: string;
  number?: string;
  invoiceDate?: string;
  dueDate?: string;
  status?: string;
  currencyCode?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  /** Amount from payment proofs awaiting review (included in paidAmount). */
  pendingProofAmount?: number;
}

export interface PortalStatementResult {
  asOf?: string;
  openingBalance?: number;
  closingBalance?: number;
  /** Posted/sent invoice total. */
  invoiced?: number;
  /** Uninvoiced costing sale total. */
  pendingCosting?: number;
  /** Posted receipts total. */
  paid?: number;
  /** Open balance. */
  balance?: number;
  invoiceCount?: number;
  currencyCode?: string;
  truncated?: boolean;
  /** True when lines were built from invoices/payments/credit notes. */
  composedFromLedgers?: boolean;
  /** Invoices with a remaining balance (paid some / due some). */
  openInvoices?: PortalOpenInvoiceLine[];
  pendingJobCharges?: PortalPendingJobCharge[];
  lines: PortalStatementLine[];
}
