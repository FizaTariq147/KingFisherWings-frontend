/**
 * Dynamic FRESA report catalog — architecture
 *
 * Principle: frontend never owns Jasper layouts. Every sample report is a
 * backend registry row + renderer. FE only:
 *   1. Lists templates (GET /reports/templates)
 *   2. Imports taxonomy (POST /reports/templates/import)
 *   3. Activates / deactivates (POST …/activate|deactivate)
 *   4. Renders parameter forms from GET /reports/templates/:id schema
 *   5. Calls POST /reports/generate → poll → download
 *
 * Adding a new FRESA sample:
 *   Backend: register code + Jasper + query + activate
 *   Frontend: zero layout code — catalog picks it up automatically
 */
export const DYNAMIC_REPORT_CATALOG = {
  browseLive: 'live',
  browseFresa: 'fresa',
  listApi: 'GET /reports/templates',
  detailApi: 'GET /reports/templates/:idOrCode',
  importApi: 'POST /reports/templates/import',
  activateApi: 'POST /reports/templates/:code/activate',
  deactivateApi: 'POST /reports/templates/:code/deactivate',
  generateApi: 'POST /reports/generate',
  jobApi: 'GET /reports/jobs/:jobId',
  downloadApi: 'GET /reports/jobs/:jobId/download',
} as const;
