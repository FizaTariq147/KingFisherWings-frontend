import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData, InvoiceFormatPdfLine } from './invoiceFormatToInvoicePdfModel';
import { formatReportLayoutDate } from './formatReportLayoutDate';
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
  due_date?: string | null;
  job_id?: string | null;
  lpo_number?: string | null;
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

  const partyName = invoice.party_name?.trim() || undefined;
  return {
    invoiceNumber: invoice.invoice_number || invoice.number || undefined,
    invoiceDate: formatReportLayoutDate(invoice.invoice_date),
    dueDate: formatReportLayoutDate(invoice.due_date),
    referenceNo: invoice.lpo_number || undefined,
    billToName: partyName,
    consigneeLines: partyName ? [partyName] : undefined,
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

/** Map a staff quotation record into layout PDF data (best-effort). */
export function quotationRecordToFormatPdfData(quotation: {
  quotation_number?: string | null;
  quote_no?: string | null;
  quotation_date?: string | null;
  created_at?: string | null;
  valid_until?: string | null;
  job_number?: string | null;
  job_id?: string | null;
  booking_id?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  currency_code?: string | null;
  origin_port_code?: string | null;
  dest_port_code?: string | null;
  origin_port_name?: string | null;
  dest_port_name?: string | null;
  commodity?: string | null;
  incoterm?: string | null;
  carrier_name?: string | null;
  carrier_preference?: string | null;
  subtotal?: number | null;
  tax_total?: number | null;
  total_amount?: number | null;
  revenue_total?: number | null;
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

  const origin =
    quotation.origin_port_code || quotation.origin_port_name || undefined;
  const dest = quotation.dest_port_code || quotation.dest_port_name || undefined;
  const route =
    origin || dest ? [origin, dest].filter(Boolean).join(' → ') : undefined;

  const lines = (quotation.lines ?? []).map((line) => ({
    description: line.description || line.charge_code || 'Charge',
    qty: line.quantity != null ? String(line.quantity) : undefined,
    rate: money(line.unit_price),
    amount: money(line.amount ?? line.line_total),
  }));
  const total = money(quotation.total_amount ?? quotation.revenue_total);

  const quoteNo = quotation.quotation_number || quotation.quote_no || undefined;
  const consigneeLines = [
    quotation.customer_name,
    quotation.contact_name ? `Attn: ${quotation.contact_name}` : null,
    quotation.contact_phone,
    quotation.contact_email,
  ].filter((v): v is string => Boolean(v && String(v).trim()));

  return {
    invoiceNumber: quoteNo,
    quotationNumber: quoteNo,
    jobNumber: quotation.job_number || undefined,
    shipmentNumber: quotation.booking_id || undefined,
    invoiceDate: formatReportLayoutDate(
      quotation.quotation_date || quotation.created_at?.slice(0, 10) || undefined,
    ),
    dueDate: formatReportLayoutDate(quotation.valid_until),
    validUntil: formatReportLayoutDate(quotation.valid_until),
    billToName: quotation.customer_name || undefined,
    billToAddress: [route, quotation.commodity].filter(Boolean).join(' · ') || undefined,
    billToPhone: quotation.contact_phone || undefined,
    billToEmail: quotation.contact_email || undefined,
    consigneeLines: consigneeLines.length ? consigneeLines : undefined,
    pol: origin,
    pod: dest,
    commodity: quotation.commodity || undefined,
    vesselFlight: quotation.carrier_name || quotation.carrier_preference || undefined,
    incoterm: quotation.incoterm || undefined,
    currencyCode: quotation.currency_code || undefined,
    subtotal: money(quotation.subtotal) ?? total,
    tax: money(quotation.tax_total),
    total,
    // Always replace demo charge rows when we have a live quote (even a single total line).
    lines: lines.length
      ? lines
      : total
        ? [{ description: 'Quotation total', qty: '1', amount: total }]
        : undefined,
  };
}
