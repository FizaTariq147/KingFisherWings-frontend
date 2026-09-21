import { JOB_TYPE_LABELS } from '../constants/quotation.constants';
import type { Quotation, QuotationLine } from '../types/quotation.types';
import { quotationDisplayNumber } from './normalizeQuotation';
import {
  generateInvoicePdf,
  type InvoicePdfCompany,
  type InvoicePdfModel,
  type InvoicePdfShipment,
} from '@/features/invoices/utils/generateInvoicePdf';

export type QuotationPdfCompany = {
  name?: string;
  addressLines?: string[];
  tagline?: string;
  phone?: string;
  email?: string;
  website?: string;
};

export type QuotationPdfOptions = {
  quotation: Quotation;
  company?: QuotationPdfCompany;
  /** Shown in footer (e.g. current user email) — kept for API compatibility. */
  generatedBy?: string;
  /** Optional resolved container type label. */
  containerTypeLabel?: string;
  /** Subject / confirm line under To block — merged into remarks when set. */
  confirmNote?: string;
};

function revenueLines(lines: QuotationLine[] | undefined): QuotationLine[] {
  if (!lines?.length) return [];
  return lines.filter((l) => !l.is_cost);
}

function lineTaxable(line: QuotationLine): number {
  const qty = line.quantity ?? 0;
  const price = line.unit_price ?? 0;
  const rate = line.exchange_rate && line.exchange_rate > 0 ? line.exchange_rate : 1;
  return qty * price * rate;
}

function lineTotal(line: QuotationLine): number {
  if (line.line_total != null && Number.isFinite(line.line_total)) return line.line_total;
  const taxable = lineTaxable(line);
  const tax =
    line.tax_amount != null
      ? line.tax_amount
      : line.tax_percent != null
        ? (taxable * line.tax_percent) / 100
        : 0;
  return taxable + tax;
}

function portLabel(q: Quotation, side: 'origin' | 'dest'): string {
  if (side === 'origin') {
    return [q.origin_port_name, q.origin_port_code].filter(Boolean).join(' ') || '';
  }
  return [q.dest_port_name, q.dest_port_code].filter(Boolean).join(' ') || '';
}

function shipmentFromQuotation(
  q: Quotation,
  containerTypeLabel?: string,
): InvoicePdfShipment | undefined {
  const wt =
    q.gross_weight != null
      ? `${q.gross_weight.toLocaleString('en-US', { maximumFractionDigits: 3 })} kg`
      : '';
  const cbm =
    q.volume_cbm != null
      ? `${q.volume_cbm.toLocaleString('en-US', { maximumFractionDigits: 3 })} CBM`
      : '';
  const containerNo = [
    q.container_count != null ? String(q.container_count) : '',
    containerTypeLabel || '',
  ]
    .filter(Boolean)
    .join(' × ');

  const shipment: InvoicePdfShipment = {
    vesselFlight: q.carrier_name || q.carrier_preference || undefined,
    pol: portLabel(q, 'origin') || undefined,
    pod: portLabel(q, 'dest') || undefined,
    containerNo: containerNo || undefined,
    etdEta:
      q.transit_time_days != null ? `Transit ${q.transit_time_days} day(s)` : undefined,
    commodity: q.commodity || undefined,
    grossWtCbm: [wt, cbm].filter(Boolean).join(' / ') || undefined,
  };

  const hasValues = Object.values(shipment).some((v) => Boolean(String(v || '').trim()));
  return hasValues ? shipment : undefined;
}

function toCompany(company?: QuotationPdfCompany): InvoicePdfCompany | undefined {
  if (!company) return undefined;
  return {
    name: company.name,
    tagline: company.tagline || 'FREIGHT - LOGISTICS - GENERAL TRADING',
    phone: company.phone,
    email: company.email,
    website: company.website,
  };
}

/** Map staff/portal quotation into the shared KingFisher invoice PDF model. */
export function quotationToInvoicePdfModel(options: QuotationPdfOptions): InvoicePdfModel {
  const { quotation: q, company, containerTypeLabel, confirmNote } = options;
  const charges = revenueLines(q.lines);
  const currency = q.currency_code || 'AED';

  let sumTaxable = 0;
  let sumTax = 0;
  let sumTotal = 0;
  const lines = charges.map((line) => {
    const taxable = lineTaxable(line);
    const tax =
      line.tax_amount != null
        ? line.tax_amount
        : line.tax_percent != null
          ? (taxable * line.tax_percent) / 100
          : 0;
    const total = lineTotal(line);
    sumTaxable += taxable;
    sumTax += tax;
    sumTotal += total;
    return {
      description: line.description || line.charge_code || 'Charge',
      detail: line.unit || undefined,
      qty: line.quantity,
      unit: line.unit || ((line.quantity ?? 0) === 1 ? 'Lot' : 'Unit'),
      rate: line.unit_price,
      amount: total,
    };
  });

  const subtotal = q.subtotal ?? q.revenue_total ?? sumTaxable;
  const vatAmount = q.tax_total ?? sumTax;
  const discount = q.discount_amount ?? 0;
  const grand = q.total_amount ?? (sumTotal || subtotal + vatAmount - discount);
  const vatRate =
    subtotal > 0 && vatAmount > 0
      ? Math.round((vatAmount / Math.max(subtotal - discount, 0.01)) * 1000) / 10
      : 5;

  const movement =
    JOB_TYPE_LABELS[q.job_type] ?? String(q.job_type || '').replaceAll('_', ' ');
  const remarksParts = [
    confirmNote?.trim(),
    q.remarks?.trim(),
    q.special_requirements?.trim()
      ? `Special requirements: ${q.special_requirements.trim()}`
      : '',
    q.incoterm ? `Incoterm: ${q.incoterm}` : '',
  ].filter(Boolean);

  return {
    invoiceNumber: quotationDisplayNumber(q),
    invoiceDate: q.quotation_date || q.created_at,
    dueDate: q.valid_until,
    jobRef: movement || q.job_id || undefined,
    currencyCode: currency,
    vatRate,
    copyLabel: 'ORIGINAL',
    documentTitle: 'QUOTATION',
    documentSubtitle: 'FREIGHT QUOTATION / RATE PROPOSAL',
    detailsSectionTitle: 'QUOTATION DETAILS',
    numberLabel: 'Quotation No.',
    dateLabel: 'Quote Date',
    dueDateLabel: 'Valid Until',
    jobRefLabel: 'Movement Type',
    hideAdvanceBalance: true,
    billTo: {
      client: q.customer_name || '—',
      attn: q.contact_name || undefined,
      phone: q.contact_phone || undefined,
      email: q.contact_email || undefined,
    },
    shipment: shipmentFromQuotation(q, containerTypeLabel),
    lines,
    subtotal,
    discount,
    taxableAmount: Math.max(0, subtotal - discount),
    vatAmount,
    otherCharges: 0,
    grandTotal: grand,
    advanceReceived: 0,
    balanceDue: grand,
    remarks: remarksParts.join('\n') || undefined,
    company: toCompany(company),
  };
}

/**
 * Client-side KingFisher quotation PDF — same layout/design as the invoice PDF.
 * Self-contained header/footer — use skipBranding when previewing/downloading.
 */
export async function generateQuotationPdf(options: QuotationPdfOptions): Promise<Blob> {
  return generateInvoicePdf(quotationToInvoicePdfModel(options));
}
