export type WmsValuationMethod = 'FIFO' | 'LIFO';

export interface WmsSettings {
  valuation_method: WmsValuationMethod;
  default_free_days: number;
  default_storage_rate: number;
  default_currency: string;
}

export interface UpsertWmsSettingsDto {
  valuation_method: WmsValuationMethod;
  default_free_days: number;
  default_storage_rate: number;
  default_currency: string;
}

export interface WmsItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  uom_code?: string;
  low_stock_threshold?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWmsItemDto {
  code: string;
  name: string;
  description?: string;
  uom_code?: string;
  low_stock_threshold?: number;
  is_active?: boolean;
}

export type UpdateWmsItemDto = Partial<CreateWmsItemDto>;

export interface WmsItemListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface WmsPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WmsItemListResult {
  items: WmsItem[];
  meta: WmsPaginationMeta;
}

export interface AsnLineDto {
  item_id: string;
  quantity: number;
  cbm?: number;
  remarks?: string;
}

export interface CreateAsnDto {
  warehouse_id: string;
  party_id?: string;
  job_id?: string;
  expected_at?: string;
  remarks?: string;
  lines: AsnLineDto[];
}

export interface GrnLineDto {
  item_id: string;
  quantity: number;
  cbm?: number;
  remarks?: string;
  unit_cost?: number;
  batch_code?: string;
}

export interface CreateGrnDto {
  warehouse_id: string;
  party_id?: string;
  job_id?: string;
  asn_id?: string;
  received_at?: string;
  remarks?: string;
  lines: GrnLineDto[];
}

export interface GdoLineDto {
  item_id: string;
  quantity: number;
  remarks?: string;
}

export interface CreateGdoDto {
  warehouse_id: string;
  party_id?: string;
  job_id?: string;
  delivered_at?: string;
  remarks?: string;
  lines: GdoLineDto[];
}

export interface WmsDocument {
  id: string;
  document_number?: string;
  status?: string;
  warehouse_id?: string;
  party_id?: string;
  job_id?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  lines?: unknown[];
  [key: string]: unknown;
}

export interface StockOnHandParams {
  warehouse_id?: string;
  item_id?: string;
}

export interface StockMovementsParams {
  warehouse_id?: string;
  item_id?: string;
  from?: string;
  to?: string;
}

export interface AdjustStockDto {
  warehouse_id: string;
  item_id: string;
  quantity: number;
  remarks: string;
}

export interface TransferLineDto {
  item_id: string;
  quantity: number;
}

export interface CreateTransferDto {
  from_warehouse_id: string;
  to_warehouse_id: string;
  remarks?: string;
  lines: TransferLineDto[];
}

export interface CalculateStorageDto {
  warehouse_id: string;
  party_id: string;
  period_from: string;
  period_to: string;
  free_days?: number;
  rate_per_day?: number;
  currency_code?: string;
}

export interface StorageChargesParams {
  /** Required by GET /wms/storage/charges */
  party_id: string;
  /** Required by GET /wms/storage/charges — typically OPEN before invoicing */
  status: string;
}

export interface InvoiceStorageDto {
  charge_ids: string[];
}

export interface WmsStockRow {
  id?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  item_id?: string;
  item_code?: string;
  item_name?: string;
  quantity?: number;
  uom_code?: string;
  [key: string]: unknown;
}
