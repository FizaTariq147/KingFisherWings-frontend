import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData, InvoiceFormatPdfLine } from './invoiceFormatToInvoicePdfModel';
import { generateInvoiceFormatPreviewPdf } from './generateInvoiceFormatPreviewPdf';

export type { InvoiceFormatPdfData, InvoiceFormatPdfLine };

/**
 * Client PDF matching the KingFisher layout preview exactly.
 * Renders the same React preview used in the catalog, then captures it to PDF.
 */
export async function generateInvoiceFormatLayoutPdf(
  preview: InvoiceFormatPreview,
  data: InvoiceFormatPdfData = {},
  _options?: { logoUrl?: string },
): Promise<Blob> {
  void _options;
  return generateInvoiceFormatPreviewPdf(preview, data);
}

/** Map a staff invoice record into layout PDF data (best-effort). */
export function invoiceRecordToFormatPdfData(invoice: {
  invoice_number?: string | null;
  number?: string | null;
  invoice_date?: string | null;
  party_name?: string | null;
  currency_code?: string | null;
  subtotal?: number | null;
  tax_total?: number | null;
  total_amount?: number | null;
  lines?: Array<{
    description?: string | null;
    charge_code?: string | null;
    quantity?: number | null;
    unit_price?: number | null;
    amount?: number | null;
    line_total?: number | null;
  }>;
}): InvoiceFormatPdfData {
  const money = (n: number | null | undefined) =>
    n == null || Number.isNaN(Number(n))
      ? undefined
      : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return {
    invoiceNumber: invoice.invoice_number || invoice.number || undefined,
    invoiceDate: invoice.invoice_date || undefined,
    billToName: invoice.party_name || undefined,
    currencyCode: invoice.currency_code || undefined,
    subtotal: money(invoice.subtotal),
    tax: money(invoice.tax_total),
    total: money(invoice.total_amount),
    lines: (invoice.lines ?? []).map((line) => ({
      description: line.description || line.charge_code || 'Charge',
      qty: line.quantity != null ? String(line.quantity) : undefined,
      rate: money(line.unit_price),
      amount: money(line.amount ?? line.line_total),
    })),
  };
}
