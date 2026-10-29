/** FRESA Invoice Report Format-* catalog preview specs (sample PDF or layout mock). */

export type InvoiceFormatLayoutKind =
  | 'tax_india'
  | 'summary'
  | 'simple'
  | 'arabic_rtl'
  | 'usa'
  | 'land'
  | 'preprinted'
  | 'warehouse'
  | 'debit_vietnam'
  | 'generic';

export type InvoiceFormatPaper = 'A4' | 'Letter';

/** Mirrors layout orientation for PDF capture (optional). */
export type InvoiceFormatOrientation = 'portrait' | 'landscape';

export type InvoiceFormatSectionId =
  | 'companyHeader'
  | 'invoiceMeta'
  | 'billTo'
  | 'shipTo'
  | 'lineTable'
  | 'taxBreakdown'
  | 'totals'
  | 'bankDetails'
  | 'footerNotes';

export interface InvoiceFormatSection {
  id: InvoiceFormatSectionId | string;
  label: string;
  columns?: string[];
}

export interface InvoiceFormatPreview {
  code: string;
  formatNumber: number;
  name: string;
  /** Reserved; always null — previews are KingFisher layout mocks (no external PDF fetch). */
  samplePdfUrl: string | null;
  layoutKind: InvoiceFormatLayoutKind;
  paper: InvoiceFormatPaper;
  /** Optional; defaults to portrait in the shared PDF pipeline. */
  orientation?: InvoiceFormatOrientation;
  /**
   * Optional override for BL / Airway Terms & Conditions append.
   * When omitted, only BL and airway-bill format codes append T&C pages.
   */
  appendCustomerTerms?: boolean;
  rtl?: boolean;
  showGst?: boolean;
  showArabic?: boolean;
  sections: InvoiceFormatSection[];
}

export function isInvoiceReportFormatCode(code: string): boolean {
  return /^INVOICE_REPORT_FORMAT_/i.test(code.trim());
}
