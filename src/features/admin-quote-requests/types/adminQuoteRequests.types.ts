/** Admin — Quote Requests Integration (KFPP / multi-tenant bridge). */

export type QuoteRequestProvider = 'KFPP_WP' | 'GENERIC_REST';

export interface UpsertQuoteRequestConnectionDto {
  base_url: string;
  /** Write-only. Never returned on GET. */
  api_key: string;
  provider?: QuoteRequestProvider;
  auth_header_name?: string;
  is_active?: boolean;
  /** Optional remote→local status map. */
  status_map?: Record<string, string>;
}

export interface PatchQuoteRequestStatusDto {
  status: string;
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
  last_health_error: string | null;
  last_sync_at: string | null;
  last_external_id: string | null;
  sync_cursor: string | null;
  status_map: Record<string, string> | null;
  configured: boolean;
  raw: Record<string, unknown>;
}

export interface ExternalQuoteRequest {
  id: string;
  external_id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
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
  status_push_pending: boolean;
  raw_json: Record<string, unknown> | null;
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
