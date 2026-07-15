import type { SearchEntityTypeParam } from '../api/search.api';

/**
 * Query params for GET /search — exact Swagger SearchController_search names.
 * Only `q` is required.
 */
export interface GlobalSearchParams {
  q: string;
  /** Comma-separated entity types (default: all). e.g. "jobs,quotations,parties,invoices" */
  types?: string;
  limit?: number;
  party_id?: string;
  customer_id?: string;
  shipper_id?: string;
  consignee_id?: string;
  job_type?: string;
  status?: string;
  origin_port_id?: string;
  dest_port_id?: string;
  hawb_number?: string;
  mawb_number?: string;
  hbl_number?: string;
  mbl_number?: string;
  booking_number?: string;
  container_number?: string;
  invoice_number?: string;
  quotation_number?: string;
  etd_from?: string;
  etd_to?: string;
  eta_from?: string;
  eta_to?: string;
  created_from?: string;
  created_to?: string;
  salesperson_id?: string;
  branch_id?: string;
  hs_code?: string;
}

/** Normalized hit for UI (Swagger response body is undocumented — normalizer is tolerant). */
export interface SearchHit {
  id: string;
  type: SearchEntityTypeParam | string;
  title: string;
  subtitle?: string;
  status?: string;
  href: string;
  raw: Record<string, unknown>;
}

export interface SearchResultGroup {
  type: string;
  label: string;
  items: SearchHit[];
}

export interface GlobalSearchResult {
  groups: SearchResultGroup[];
  total: number;
  query: string;
}
