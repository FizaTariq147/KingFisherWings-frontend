/**
 * Document PDF preservation (do not regress).
 *
 * Existing flows that MUST remain unchanged by the FRESA report catalog:
 * - quotations/utils/generateQuotationPdf.ts + QuotationPdfModal + POST /quotations/:id/pdf
 * - invoices/utils/generateInvoicePdf.ts + InvoiceDetailPage "Generate PDF"
 * - portal/vendor PDF fallbacks
 * - files/utils/triggerBlobDownload.ts + stampPdfBranding
 *
 * Catalog "Invoice Report Format-N" templates are ADDITIONAL formats via
 * POST /reports/generate — never replace the default invoice/quotation PDF buttons.
 *
 * Format-1 Tax Invoice India = backend pack `commercial.invoice_tax_india_1`
 * (see BACKEND_REPORT_CATALOG_API.md + fresaPdfParity.constants.ts). Invoice detail
 * "FRESA formats" deep-links the catalog; it does not draw FRESA layouts in FE.
 */
export const DOCUMENT_PDF_PRESERVE = {
  quotationClient: 'src/features/quotations/utils/generateQuotationPdf.ts',
  invoiceClient: 'src/features/invoices/utils/generateInvoicePdf.ts',
  quotationApi: 'POST /quotations/:id/pdf',
  invoiceApi: 'POST /invoices/:id/pdf',
  fresaFormat1Code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  fresaFormat1Pack: 'commercial.invoice_tax_india_1',
} as const;
