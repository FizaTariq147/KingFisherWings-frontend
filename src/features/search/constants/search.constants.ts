import type { SearchEntityTypeParam } from '../api/search.api';

/** Swagger: q minLength 1 */
export const SEARCH_MIN_CHARS = 1;
export const SEARCH_DEBOUNCE_MS = 350;
export const SEARCH_DEFAULT_LIMIT = 20;
export const SEARCH_MAX_LIMIT = 100;
export const SEARCH_RECENT_KEY = 'kf.global-search.recent';
export const SEARCH_RECENT_MAX = 8;

export const SEARCH_TYPE_LABELS: Record<string, string> = {
  jobs: 'Jobs',
  job: 'Jobs',
  quotations: 'Quotations',
  quotation: 'Quotations',
  enquiries: 'Enquiries',
  enquiry: 'Enquiries',
  shipments: 'Shipments',
  shipment: 'Shipments',
  parties: 'Parties',
  party: 'Parties',
  invoices: 'Invoices',
  invoice: 'Invoices',
};

/** Swagger `types` — default all six entity groups when omitted. */
export const DEFAULT_SEARCH_TYPES: SearchEntityTypeParam[] = [
  'jobs',
  'quotations',
  'enquiries',
  'shipments',
  'parties',
  'invoices',
];

export const SEARCH_TYPE_FILTERS: Array<{
  value: SearchEntityTypeParam;
  label: string;
}> = [
  { value: 'jobs', label: 'Jobs' },
  { value: 'quotations', label: 'Quotations' },
  { value: 'enquiries', label: 'Enquiries' },
  { value: 'shipments', label: 'Shipments' },
  { value: 'parties', label: 'Parties' },
  { value: 'invoices', label: 'Invoices' },
];
