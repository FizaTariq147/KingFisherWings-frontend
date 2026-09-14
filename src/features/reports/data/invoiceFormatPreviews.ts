import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { isInvoiceReportFormatCode } from '../types/invoiceFormatPreview.types';
import { INVOICE_FORMAT_PREVIEWS as GENERATED } from './invoiceFormatPreviews.generated';

/** All Invoice Report Format-1…61 preview specs (JSON + generated TS). */
export const INVOICE_FORMAT_PREVIEWS: InvoiceFormatPreview[] = GENERATED;

const byCode = new Map(
  INVOICE_FORMAT_PREVIEWS.map((row) => [row.code.toUpperCase(), row]),
);

export function getInvoiceFormatPreview(code: string): InvoiceFormatPreview | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle || !isInvoiceReportFormatCode(needle)) return undefined;
  return byCode.get(needle);
}

export function listInvoiceFormatPreviews(): InvoiceFormatPreview[] {
  return INVOICE_FORMAT_PREVIEWS;
}
