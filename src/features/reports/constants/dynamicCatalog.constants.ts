/**
 * Dynamic FRESA report catalog — architecture
 *
 * Exact FRESA PDF UI for every report = backend Puppeteer packs only.
 * This frontend never builds per-report Jasper/React layouts (~600 names).
 *
 * FE only:
 *   1. Lists templates (GET /reports/templates) — FRESA-like sectioned browse by family
 *   2. Imports taxonomy (POST /reports/templates/import)
 *   3. Activates / deactivates / bind-renderer (keys from GET …/renderers only)
 *   4. Renders parameter forms from GET /reports/templates/:id schema
 *   5. Calls POST /reports/generate → poll → PdfReadyModal (no layout code, no /files redirect)
 *
 * Pack priority + pending.{CODE} mapping: fresaPdfParity.constants.ts +
 * BACKEND_REPORT_CATALOG_API.md (workstream for kingfisherwings-backend).
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
} as const;
