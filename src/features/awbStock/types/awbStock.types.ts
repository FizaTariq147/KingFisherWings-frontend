import type {
  AllocateAwbFormValues,
  CreateAwbStockBatchFormValues,
  TransferAwbBatchFormValues,
  UpdateAwbStockBatchFormValues,
  VoidAwbAllocationFormValues,
} from '../schemas/awbStock.schema';

export type {
  AllocateAwbFormValues,
  CreateAwbStockBatchFormValues,
  TransferAwbBatchFormValues,
  UpdateAwbStockBatchFormValues,
  VoidAwbAllocationFormValues,
} from '../schemas/awbStock.schema';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AwbStockBatch {
  id: string;
  airline_id: string;
  airline_name?: string;
  airline_code?: string;
  branch_id?: string;
  branch_name?: string;
  prefix: string;
  range_from: number;
  range_to: number;
  next_number?: number;
  remaining?: number;
  total_count?: number;
  used_count?: number;
  allocated_count?: number;
  low_stock_threshold?: number;
  notes?: string;
  is_low_stock?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  allocations?: AwbAllocation[];
}

export interface AwbAllocation {
  id: string;
  batch_id?: string;
  airline_id?: string;
  awb_number?: string;
  serial_number?: number;
  prefix?: string;
  job_id?: string;
  job_number?: string;
  status?: string;
  void_reason?: string;
  allocated_at?: string;
  used_at?: string;
  voided_at?: string;
  created_at?: string;
}

export type CreateAwbStockBatchDto = CreateAwbStockBatchFormValues;
export type UpdateAwbStockBatchDto = UpdateAwbStockBatchFormValues;
export type AllocateAwbDto = AllocateAwbFormValues;
export type TransferAwbBatchDto = TransferAwbBatchFormValues;
export type VoidAwbAllocationDto = VoidAwbAllocationFormValues;

export interface AwbStockBatchListParams {
  page?: number;
  limit?: number;
  search?: string;
  airline_id?: string;
  branch_id?: string;
  job_id?: string;
  low_stock_only?: boolean;
  order?: 'asc' | 'desc';
}

export interface AwbAllocationListParams {
  airline_id?: string;
  branch_id?: string;
  job_id?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface AwbStockBatchListResult {
  items: AwbStockBatch[];
  meta: PaginationMeta;
}

export interface AwbAllocationListResult {
  items: AwbAllocation[];
  meta: PaginationMeta;
}
