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

export interface PortalStatementResult {
  asOf?: string;
  openingBalance?: number;
  closingBalance?: number;
  invoiceCount?: number;
  currencyCode?: string;
  truncated?: boolean;
  /** True when lines were built from invoices/payments/credit notes. */
  composedFromLedgers?: boolean;
  lines: PortalStatementLine[];
}
