/**
 * Reference-only map of sample layout PDFs used when authoring KingFisher JSON layouts.
 * Runtime never opens these URLs — Formats 1–20 are KingFisher UI layouts + KF logo.
 */
export const INVOICE_FORMAT_SAMPLE_PDF_URLS: Record<string, string> = {};

export function getInvoiceFormatSamplePdfUrl(_code: string): string | undefined {
  return undefined;
}
