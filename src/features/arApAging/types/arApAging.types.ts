export interface AgingReportParams {
  as_of?: string;
  party_id?: string;
  company_id?: string;
}

export interface StatementReportParams {
  as_of?: string;
  party_id?: string;
  company_id?: string;
}

export interface AgingLine {
  party_id?: string;
  party_name?: string;
  party_code?: string;
  currency_code?: string;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_over_90: number;
  total: number;
  [key: string]: unknown;
}

export interface AgingReportResult {
  as_of?: string;
  lines: AgingLine[];
  totals?: AgingLine;
  raw: unknown;
}

export interface StatementLine {
  id?: string;
  date?: string;
  type?: string;
  reference?: string;
  description?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  document_id?: string;
  document_number?: string;
  [key: string]: unknown;
}

export interface StatementReportResult {
  party_id?: string;
  party_name?: string;
  as_of?: string;
  opening_balance?: number;
  closing_balance?: number;
  currency_code?: string;
  lines: StatementLine[];
  raw: unknown;
}

/** Per-invoice open item with paid vs pending (balance due). */
export interface OpenItemLine {
  id: string;
  number?: string;
  partyId?: string;
  partyName?: string;
  invoiceDate?: string;
  dueDate?: string;
  currencyCode?: string;
  status?: string;
  totalAmount?: number;
  paidAmount?: number;
  balanceDue?: number;
  raw?: Record<string, unknown>;
}

export interface OpenItemsParams {
  party_id: string;
  company_id: string;
}

export interface OpenItemsResult {
  items: OpenItemLine[];
  partyId?: string;
  partyName?: string;
  currencyCode?: string;
  totalOutstanding?: number;
  totalPaid?: number;
  raw: unknown;
}
