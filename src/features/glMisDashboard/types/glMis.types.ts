export type MisGroupBy = 'customer' | 'job_type' | 'branch' | 'salesperson';

export interface MisParams {
  from_date?: string;
  to_date?: string;
  company_id?: string;
  branch_id?: string;
  period?: '7d' | '30d' | 'mtd' | 'custom';
}

export interface MisProfitabilityParams extends MisParams {
  group_by?: MisGroupBy;
}

export interface MisResult {
  rows: Record<string, unknown>[];
  raw: unknown;
}
