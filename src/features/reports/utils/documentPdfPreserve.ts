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
 */
export const DOCUMENT_PDF_PRESERVE = {
  quotationClient: 'src/features/quotations/utils/generateQuotationPdf.ts',
  invoiceClient: 'src/features/invoices/utils/generateInvoicePdf.ts',
  quotationApi: 'POST /quotations/:id/pdf',
  invoiceApi: 'POST /invoices/:id/pdf',
} as const;
