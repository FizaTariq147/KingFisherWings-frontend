/** Global Search REST — Swagger tag Search, GET /search (Bearer JWT). */
export const SEARCH_API = {
  search: '/search',
} as const;

/** Entity types accepted by the `types` query param (Swagger example). */
export const SEARCH_ENTITY_TYPES = [
  'jobs',
  'quotations',
  'parties',
  'invoices',
] as const;

export type SearchEntityTypeParam = (typeof SEARCH_ENTITY_TYPES)[number];
