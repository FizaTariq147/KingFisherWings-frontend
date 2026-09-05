export interface VendorAgingBucket {
  label: string;
  amount: number;
}

export interface VendorAgingResult {
  asOf?: string;
  buckets: VendorAgingBucket[];
  total?: number;
}

export interface VendorStatementLine {
  id: string;
  date?: string;
  type?: string;
  reference?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  description?: string;
}

export interface VendorStatementResult {
  asOf?: string;
  openingBalance?: number;
  closingBalance?: number;
  /** Present when API returns summary-only payload (no ledger lines). */
  invoiceCount?: number;
  advancesUnallocated?: number;
  truncated?: boolean;
  /** True when lines were built from invoices/payments/credit notes. */
  composedFromLedgers?: boolean;
  lines: VendorStatementLine[];
}
