export type MisGroupBy = 'customer' | 'job_type' | 'branch' | 'salesperson';

export interface MisParams {
  from_date?: string;
  to_date?: string;
  company_id?: string;
  branch_id?: string;
}

export interface MisProfitabilityParams extends MisParams {
  group_by?: MisGroupBy;
}

export interface MisResult {
  rows: Record<string, unknown>[];
  raw: unknown;
}
