/** Tenant admin — mirrored website quote requests integration. */
export const ADMIN_QUOTE_REQUESTS_API = {
  list: '/admin/integrations/quote-requests',
  detail: (id: string) => `/admin/integrations/quote-requests/${encodeURIComponent(id)}`,
  convertToQuote: (id: string) =>
    `/admin/integrations/quote-requests/${encodeURIComponent(id)}/convert-to-quote`,
  linkCrm: (id: string) =>
    `/admin/integrations/quote-requests/${encodeURIComponent(id)}/link-crm`,
  status: (id: string) =>
    `/admin/integrations/quote-requests/${encodeURIComponent(id)}/status`,
  connection: '/admin/integrations/quote-requests/connection',
  connectionTest: '/admin/integrations/quote-requests/connection/test',
  sync: '/admin/integrations/quote-requests/sync',
  syncRuns: '/admin/integrations/quote-requests/sync-runs',
} as const;
