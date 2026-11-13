/**
 * Fresa-parity Reports Rebuild — preserve matrix + FE layout freeze.
 *
 * Do NOT expand *FormatUiLayouts.json / scraped layouts for product PDF.
 * Exact FRESA look = backend packs (BACKEND_REPORT_CATALOG_API.md).
 * Client html2canvas layouts are Dev/offline fallback only (see clientLayoutFallback.ts).
 * Catalogue chrome injects registered org name/logo via resolveReportOrgChrome —
 * never rewrite default invoice/quotation PDF buttons to catalog Format-N.
 */

export const REPORT_LAYOUT_FREEZE = {
  /** Stop adding new scraped JSON layouts for production generate. */
  freezeClientJsonLayouts: true,
  /**
   * Legacy JSON stays read-mostly. New visual work goes to
   * `templates/*` + `registry/` enrichment (template-v2), not new scraped JSON.
   */
  registryRole: 'taxonomy_plus_enrichment' as const,
  templateV2Path: 'src/features/reports/templates',
  completeCatalogPath: 'src/features/reports/data/fresaReportCatalogComplete.json',
} as const;

/**
 * Flows that must keep working unchanged while catalog packs roll out.
 */
export const REPORT_PRESERVE_MATRIX = {
  defaultInvoicePdf: {
    api: 'POST /invoices/:id/pdf',
    client: 'src/features/invoices/utils/generateInvoicePdf.ts',
    note: 'Invoice detail Generate PDF — never replaced by catalog Format-N',
  },
  defaultQuotationPdf: {
    api: 'POST /quotations/:id/pdf',
    client: 'src/features/quotations/utils/generateQuotationPdf.ts',
    note: 'Quotation detail Generate PDF — never replaced by catalog formats',
  },
  classicBlDraft: {
    client: 'src/features/shared/bl-draft/generateBlDraftPdf.ts',
    note: 'Operational BL until sea.hbl_* packs proven; keep as fallback',
  },
  moduleAnalytics: {
    note: 'covered_analytics tiles + module hub KPI screens stay primary for lists/KPIs',
  },
  catalogDeepLinks: {
    params: ['job_id', 'quotation_id', 'invoice_id', 'shipment_id', 'party_id'] as const,
    builder: 'src/features/reports/utils/moduleCatalogFamily.ts',
  },
  accessControl: {
    permission: 'menu_reports',
    enabledModules: 'reportFamilyAllowed / hasEnabledModule',
  },
  reportsApiContract: {
    routes: [
      'GET /reports/templates',
      'GET /reports/templates/:idOrCode',
      'POST /reports/templates/import',
      'GET /reports/templates/renderers',
      'POST /reports/templates/:code/bind-renderer',
      'POST /reports/templates/:code/activate',
      'POST /reports/templates/:code/deactivate',
      'POST /reports/generate',
      'GET /reports/jobs/:jobId',
      'GET /reports/jobs/:jobId/download',
    ] as const,
    note: 'Additive packs only — do not rename/remove bound keys without migration',
  },
} as const;

/** Primary product generate path for catalogue formats. */
export const REPORT_PRODUCT_GENERATE_PATH = 'POST /reports/generate' as const;

/**
 * Product generate priority for catalogue formats (Fresa fidelity).
 * Do not expand JSON shell aliases to invent unique Format-N designs.
 *
 * 1. Browse / unbound + official CDN sample → sample stamp (HBL/HAWB)
 * 2. Entity-bound + pack ready → POST /reports/generate (Puppeteer pack)
 * 3. Entity-bound + no pack → template-v2 (no Fresa-identical claim)
 * 4. JSON layout → Dev/offline fallback only (clientLayoutFallback)
 *
 * Entity-bound must never substitute a CDN sample for live data.
 */
export const REPORT_GENERATE_PRIORITY = [
  'sample_browse',
  'backend_pack',
  'template_v2',
  'json_fallback',
] as const;

export const REPORT_SHARED_SHELL_POLICY = {
  /** Aliased Format-N codes share one JSON shell — not Fresa unique designs. */
  aliasesAreCoverageNotFidelity: true,
  /** Do not add new *FormatUiLayouts.json rows to “cover” missing Format-N. */
  forbidNewJsonAliasesForCoverage: true,
  honestyFields: ['layoutSourceCode', 'isSharedLayout', 'implementationStatus:shared_shell'],
} as const;
