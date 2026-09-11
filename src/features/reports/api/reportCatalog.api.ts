/** Live Swagger tag: Reports — Catalog (kingfisherwings-backend). */
export const REPORT_CATALOG_API = {
  templates: '/reports/templates',
  template: (idOrCode: string) => `/reports/templates/${encodeURIComponent(idOrCode)}`,
  /** POST body: template[] or { templates: [] } — inactive unless pack-protected. */
  importRegistry: '/reports/templates/import',
  /** GET — implemented Puppeteer data-pack keys (~18). Not Jasper upload. */
  renderers: '/reports/templates/renderers',
  activate: (code: string) => `/reports/templates/${encodeURIComponent(code)}/activate`,
  /** POST BindRendererDto — set real renderer_key; optional activate=true. */
  bindRenderer: (code: string) =>
    `/reports/templates/${encodeURIComponent(code)}/bind-renderer`,
  deactivate: (code: string) => `/reports/templates/${encodeURIComponent(code)}/deactivate`,
  generate: '/reports/generate',
  job: (jobId: string) => `/reports/jobs/${encodeURIComponent(jobId)}`,
  download: (jobId: string) => `/reports/jobs/${encodeURIComponent(jobId)}/download`,
} as const;

export const REPORT_CATALOG_ROUTE = '/reports/catalog';

/** OpenAPI max for GET /reports/templates `limit`. */
export const REPORT_TEMPLATES_MAX_LIMIT = 200;

/** OpenAPI family enum for GET /reports/templates?family= */
export const REPORT_TEMPLATE_FAMILY_ENUM = [
  'ops_list',
  'sea_docs',
  'air_docs',
  'commercial',
  'finance',
  'wms',
  'quotation',
  'other',
] as const;

/** OpenAPI context enum for GET /reports/templates?context= */
export const REPORT_TEMPLATE_CONTEXT_ENUM = [
  'job',
  'quotation',
  'invoice',
  'gl',
  'wms',
  'list',
  'party',
] as const;
