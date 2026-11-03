/** Admin — Quote Requests Integration (KFPP / KFQA / multi-tenant bridge). */

export type QuoteRequestProvider = 'KFPP_WP' | 'KFQA_WP' | 'GENERIC_REST';

/** KFQA website status values pushed via PATCH …/status. */
export const KFQA_QUOTE_STATUSES = [
  'new',
  'received',
  'contacted',
  'quoted',
  'won',
  'lost',
  'closed',
] as const;

export type KfqaQuoteStatus = (typeof KFQA_QUOTE_STATUSES)[number];

export type QuoteRequestSource = 'gq' | 'pq' | 'tl' | 'si' | string;

export interface UpsertQuoteRequestConnectionDto {
  base_url: string;
  /** Write-only. Never returned on GET. */
  api_key: string;
  provider?: QuoteRequestProvider;
  auth_header_name?: string;
  is_active?: boolean;
  /** Optional remote→local status map (KFPP). */
  status_map?: Record<string, string>;
}

export interface PatchQuoteRequestStatusDto {
  status: string;
  /** KFQA: local SO / quotation number pushed to WordPress. */
  software_ref?: string;
  /** KFQA: defaults to true on BE when pushing. */
  synced?: boolean;
}

export interface QuoteRequestConnection {
  id: string;
  tenant_id?: string;
  provider: QuoteRequestProvider | string;
  base_url: string;
  /** Redacted prefix only — never the full key. */
  api_key_prefix: string;
  auth_header_name: string;
  is_active: boolean;
  last_health_at: string | null;
  last_health_ok: boolean | null;
  last_health_error: string | null;
  last_sync_at: string | null;
  last_external_id: string | null;
  sync_cursor: string | null;
  status_map: Record<string, string> | null;
  configured: boolean;
  raw: Record<string, unknown>;
}

export interface QuoteLineItem {
  product_id?: number | null;
  name?: string | null;
  sku?: string | null;
  variation?: string | null;
  quantity?: number | null;
  unit?: string | null;
  pcs_per_carton?: number | null;
  total_pieces?: number | null;
  price?: number | null;
  currency?: string | null;
  url?: string | null;
  image?: string | null;
  categories?: string[];
}

export interface QuoteRequestCustomer {
  type: string | null;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
}

export interface ExternalQuoteRequest {
  id: string;
  tenant_id: string | null;
  external_id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company_name: string | null;
  message: string | null;
  commodity: string | null;
  status: string | null;
  submitted_at: string | null;
  company_id: string | null;
  lead_id: string | null;
  enquiry_id: string | null;
  party_id: string | null;
  last_synced_at: string | null;
  status_pushed_at: string | null;
  sync_error: string | null;
  /** Alias of API `pending_status_push`. */
  status_push_pending: boolean;
  remote_status_at_pull: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  raw_json: Record<string, unknown> | null;

  /** Enriched (KFQA General Trading) — prefer in UI. */
  reference: string | null;
  source: QuoteRequestSource | null;
  source_label: string | null;
  software_ref: string | null;
  synced: boolean | null;
  page_url: string | null;
  admin_url: string | null;
  customer: QuoteRequestCustomer;
  items: QuoteLineItem[];
  service: unknown | null;
  remote: Record<string, unknown> | null;

  raw: Record<string, unknown>;
}

export interface QuoteRequestSyncRun {
  id: string;
  started_at: string | null;
  finished_at: string | null;
  fetched: number;
  upserted: number;
  failed: number;
  error_summary: string | null;
  raw: Record<string, unknown>;
}

export interface QuoteRequestListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface QuoteRequestListResult {
  items: ExternalQuoteRequest[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuoteRequestSyncRunListParams {
  page?: number;
  limit?: number;
}

export interface QuoteRequestSyncRunListResult {
  items: QuoteRequestSyncRun[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuoteRequestHealthResult {
  ok: boolean;
  message: string | null;
  raw: Record<string, unknown>;
}

export interface QuoteRequestSyncResult {
  fetched?: number;
  upserted?: number;
  failed?: number;
  run_id?: string;
  message: string | null;
  raw: Record<string, unknown>;
}
