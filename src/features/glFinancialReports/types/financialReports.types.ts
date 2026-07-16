export interface ReportCommonParams {
  from_date?: string;
  to_date?: string;
  as_of?: string;
  company_id?: string;
  hide_zero?: boolean;
}

export interface VatReturnParams {
  from_date: string;
  to_date: string;
  company_id?: string;
}

export interface FinancialReportResult {
  rows: Record<string, unknown>[];
  raw: unknown;
}
