/**
 * Family rollout waves (plan Phase 3).
 * Templates with rolloutPhase <= active wave are shown as "in rollout".
 */
export const REPORT_FAMILY_ROLLOUT = {
  /** Ops list reports */
  phase1: 1,
  /** Sea docs */
  phase2: 2,
  /** Air docs + quotations */
  phase3: 3,
  /** Commercial / invoice formats */
  phase4: 4,
  /** Finance */
  phase5: 5,
  /** WMS */
  phase6: 6,
} as const;

/**
 * Active FE rollout ceiling for "?rollout=active" filter.
 * Full program (Option D): all six waves are in the product catalogue.
 * Exact FRESA print still requires backend Puppeteer packs
 * (`fresaCorePackShells.constants.ts` + BACKEND_REPORT_CATALOG_API.md).
 * Client JSON layouts remain the Dev/offline fallback
 * (`VITE_REPORTS_CLIENT_LAYOUT_FALLBACK`, default ON) with registered org branding.
 *
 * Pipeline smoke packs: ops.list_generic + sea.hbl_draft + air.hawb_draft +
 * commercial.invoice_tax_india_1 (additive — never replaces POST /invoices/:id/pdf).
 */
export const ACTIVE_REPORT_ROLLOUT_PHASE = REPORT_FAMILY_ROLLOUT.phase6;

/**
 * Backend pack dependency — FE does not invent renderer_key values.
 * Bind only keys returned by GET /reports/templates/renderers.
 */
export const REPORT_PACK_BACKEND_DEPENDENCY = {
  generatePath: 'POST /reports/generate',
  renderersPath: 'GET /reports/templates/renderers',
  brandingFields: [
    'legal_name',
    'trade_name',
    'logo_url',
    'logo_base64',
    'address',
    'phone',
    'email',
    'web',
    'vat_number',
    'gstin',
  ] as const,
  note:
    'Packs must inject registered organization name + logo (never Fresa logos). Client layout fallback keeps catalogue Generate working when packs are unbound.',
} as const;

export const ROLLOUT_PHASE_LABELS: Record<number, string> = {
  1: 'Ops lists',
  2: 'Sea documents',
  3: 'Air documents',
  4: 'Commercial / invoices',
  5: 'Finance & GL',
  6: 'WMS',
};
