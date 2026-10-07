import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { resolveAnyFormatUiLayout } from '../data/resolveAnyFormatUiLayout';
import {
  generateInvoiceFormatLayoutPdf,
  type InvoiceFormatPdfData,
} from './generateInvoiceFormatLayoutPdf';

/**
 * Client layout PDF for any catalogue / registry code that has a permanent JSON layout.
 * Used for entity-bound live data (quotation / invoice / job / party) and as fallback
 * when POST /reports/generate is unavailable. Never replaces POST /invoices/:id/pdf
 * or /quotations/:id/pdf.
 */
export async function generateCatalogLayoutPdf(
  code: string,
  data: InvoiceFormatPdfData = {},
): Promise<{ blob: Blob; preview: InvoiceFormatPreview } | null> {
  const layout = resolveAnyFormatUiLayout(code);
  if (!layout) return null;

  const preview: InvoiceFormatPreview = {
    code: layout.code,
    formatNumber: layout.formatNumber || 0,
    name: layout.name || layout.code,
    samplePdfUrl: null,
    layoutKind: 'generic',
    paper: layout.paper,
    rtl: layout.rtl,
    sections: [],
  };

  const blob = await generateInvoiceFormatLayoutPdf(preview, data);
  return { blob, preview };
}

export function hasCatalogLayoutPdf(code: string): boolean {
  return Boolean(resolveAnyFormatUiLayout(code));
}
