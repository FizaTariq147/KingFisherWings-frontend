/**
 * Dynamic FRESA report catalog — architecture (Fresa-parity rebuild)
 *
 * Exact FRESA PDF/XLSX UI for every report = backend Puppeteer / Excel packs only.
 * FE JSON *FormatUiLayouts are FROZEN — taxonomy + Dev fallback only
 * (see reportPreserveMatrix.ts + clientLayoutFallback.ts).
 *
 * FE only:
 *   1. Lists templates (GET /reports/templates) — FRESA-like sectioned browse by family
 *   2. Imports taxonomy (POST /reports/templates/import)
 *   3. Activates / deactivates / bind-renderer (keys from GET …/renderers only)
 *   4. Renders parameter forms from GET /reports/templates/:id schema
 *   5. Calls POST /reports/generate → poll → PdfReadyModal (prefer packs; KF logo)
 *   6. Entity deep-links lock context ids (invoice / quotation / job / shipment)
 *
 * Pack priority + pending.{CODE} mapping: fresaPdfParity.constants.ts +
 * BACKEND_REPORT_CATALOG_API.md (workstream for kingfisherwings-backend).
 * Branding: reportBranding.constants.ts (KingFisher logo, never Fresa).
 */
export const DYNAMIC_REPORT_CATALOG = {
  browseLive: 'live',
  browseFresa: 'fresa',
  listApi: 'GET /reports/templates',
  detailApi: 'GET /reports/templates/:idOrCode',
  importApi: 'POST /reports/templates/import',
  renderersApi: 'GET /reports/templates/renderers',
  bindRendererApi: 'POST /reports/templates/:code/bind-renderer',
  activateApi: 'POST /reports/templates/:code/activate',
  deactivateApi: 'POST /reports/templates/:code/deactivate',
  generateApi: 'POST /reports/generate',
  jobApi: 'GET /reports/jobs/:jobId',
  downloadApi: 'GET /reports/jobs/:jobId/download',
  /** Client layout PDF only when packs missing + fallback flag / DEV. */
  clientLayoutFallbackEnv: 'VITE_REPORTS_CLIENT_LAYOUT_FALLBACK',
} as const;
