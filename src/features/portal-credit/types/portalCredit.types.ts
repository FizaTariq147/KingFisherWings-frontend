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
  invoiceCount?: number;
  currencyCode?: string;
  truncated?: boolean;
  /** True when lines were built from invoices/payments/credit notes. */
  composedFromLedgers?: boolean;
  /** Invoices with a remaining balance (paid some / due some). */
  openInvoices?: PortalOpenInvoiceLine[];
  lines: PortalStatementLine[];
}
