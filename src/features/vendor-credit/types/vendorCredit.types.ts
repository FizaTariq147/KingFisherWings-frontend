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
  lines: VendorStatementLine[];
}
