export interface OperationsListParams {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  from_date?: string;
  to_date?: string;
  branch_id?: string;
  status?: string;
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
  from_date: string;
  to_date: string;
  branch_id?: string;
}

export interface OperationsListResult {
  items: Record<string, unknown>[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  raw?: unknown;
}
