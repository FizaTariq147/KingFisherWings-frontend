/**
 * Document PDF preservation (do not regress).
 *
 * Full matrix: `reportPreserveMatrix.ts`. Branding: `reportBranding.constants.ts`.
 *
 * Existing flows that MUST remain unchanged by the FRESA report catalog:
 * - quotations/utils/generateQuotationPdf.ts + QuotationPdfModal + POST /quotations/:id/pdf
 * - invoices/utils/generateInvoicePdf.ts + InvoiceDetailPage "Generate PDF"
 * - classic BL draft until sea.hbl_* packs proven
 * - portal/vendor PDF fallbacks
 * - files/utils/triggerBlobDownload.ts + stampPdfBranding
 *
 * Catalog "Invoice Report Format-N" templates are ADDITIONAL formats via
 * POST /reports/generate — never replace the default invoice/quotation PDF buttons.
 *
 * Product path for catalogue formats = backend Puppeteer/Excel packs.
 * Client KingFisher layout PDF (`generateCatalogLayoutPdf`) is Dev/offline fallback
 * only (`VITE_REPORTS_CLIENT_LAYOUT_FALLBACK` / DEV). That path must never call
 * POST /invoices/:id/pdf or POST /quotations/:id/pdf.
 *
 * Format-1 Tax Invoice India = backend pack `commercial.invoice_tax_india_1`
 * (see BACKEND_REPORT_CATALOG_API.md + fresaPdfParity.constants.ts).
 */
export const DOCUMENT_PDF_PRESERVE = {
  quotationClient: 'src/features/quotations/utils/generateQuotationPdf.ts',
  invoiceClient: 'src/features/invoices/utils/generateInvoicePdf.ts',
  wmsClient: 'src/features/wms/utils/generateWmsDocumentPdf.ts',
  quotationApi: 'POST /quotations/:id/pdf',
  invoiceApi: 'POST /invoices/:id/pdf',
  classicBlClient: 'src/features/shared/bl-draft/generateBlDraftPdf.ts',
  catalogProductGenerate: 'POST /reports/generate',
  catalogClientLayoutFallback: 'src/features/reports/utils/generateCatalogLayoutPdf.ts',
  fresaFormat1Code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  fresaFormat1Pack: 'commercial.invoice_tax_india_1',
  brandingLogo: 'kingfisher',
  /** Catalogue chrome only — do not rewire default invoice/quotation PDF buttons. */
  orgChromeResolver: 'src/features/reports/utils/resolveReportOrgChrome.ts',
} as const;

/** Smoke checklist — catalogue work must not regress these (manual / E2E). */
export const DOCUMENT_PDF_PRESERVE_SMOKE = [
  'Invoice detail → Generate PDF (pdf-lib path)',
  'Quotation detail → Generate PDF',
  'Job documents → classic BL draft fallback',
  'WMS document PDF',
  'GL account statement PDF',
  'Catalogue Generate with unbound pack → client layout + org logo',
  'Catalogue Generate with bound pack → POST /reports/generate',
  'Deep-link ?invoice_id= / ?job_id= / ?quotation_id= still opens catalog',
] as const;
