export interface OperationsListParams {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  from_date?: string;
  to_date?: string;
  branch_id?: string;
  status?: string;
  /** Wave 1 — job not invoiced / finance filters */
  job_type?: string;
  date_basis?: 'do_issued' | 'job_date' | 'shipment_date' | 'voucher_date';
  group_by?: 'branch' | 'salesperson' | 'job_type';
  voyage_number?: string;
  vessel_name?: string;
}

export interface PatchImportCargoDeliveryDto {
  do_status?: string;
  number_of_pallets?: number;
  cargo_delivered_date?: string;
  truck_details?: string;
  driver_name?: string;
  remarks?: string;
  shipment_id?: string;
}

export interface OperationsDashboardQueryDto {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  from_date?: string;
  to_date?: string;
  branch_id?: string;
  job_type?: string;
  date_basis?: string;
  group_by?: string;
  voyage_number?: string;
  vessel_name?: string;
  format?: 'xlsx' | 'pdf';
}

export interface OperationsListResult {
  items: Record<string, unknown>[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totals?: Record<string, unknown>;
  raw?: unknown;
}

export type OperationsReportKey =
  | 'job-not-invoiced-do'
  | 'job-finance-report'
  | 'exceptions'
  | 'kpi-status'
  | 'job-list-summary'
  | 'voyage-jobs-shipments'
  | 'closed-job-report';
