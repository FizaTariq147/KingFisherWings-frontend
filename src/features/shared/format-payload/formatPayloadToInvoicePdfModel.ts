import type {
  InvoicePdfChargeLine,
  InvoicePdfCompany,
  InvoicePdfModel,
  InvoicePdfShipment,
} from '@/features/invoices/utils/generateInvoicePdf';

export type FormatPayloadPdfMeta = {
  documentTitle: string;
  documentSubtitle: string;
  detailsSectionTitle: string;
  numberLabel: string;
  dateLabel?: string;
  dueDateLabel?: string;
  jobRefLabel?: string;
  copyLabel?: string;
  hideAdvanceBalance?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(/,/g, ''));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function pick(record: Record<string, unknown> | null, ...keys: string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const v = readString(record[key]);
    if (v) return v;
  }
  return undefined;
}

function pickNested(
  root: Record<string, unknown>,
  path: string[],
  ...leafKeys: string[]
): string | undefined {
  let cur: Record<string, unknown> | null = root;
  for (const seg of path) {
    cur = asRecord(cur?.[seg]);
    if (!cur) return undefined;
  }
  return pick(cur, ...leafKeys);
}

function mapLines(raw: unknown, currency: string): InvoicePdfChargeLine[] {
  if (!Array.isArray(raw)) return [];
  const out: InvoicePdfChargeLine[] = [];
  for (const entry of raw) {
    const row = asRecord(entry);
    if (!row) continue;
    const description =
      pick(row, 'description', 'desc', 'charge_description', 'particulars', 'name') || '—';
    const qty = readNumber(row.qty ?? row.quantity ?? row.qty_count);
    const rate = readNumber(
      row.rate ??
        row.unit_price ??
        row.amount_per_qty ??
        row.amountPerQty ??
        row.unitPrice,
    );
    const amount = readNumber(
      row.amount ??
        row.line_total ??
        row.total_inr ??
        row.total ??
        row.fcy_amount ??
        row.fcyAmount,
    );
    out.push({
      description,
      detail: pick(row, 'sac_hsn', 'hsn', 'sac', 'charge_code', 'unit'),
      qty,
      unit: pick(row, 'unit', 'uom') || (qty != null ? 'UNIT' : undefined),
      rate,
      amount: amount ?? (qty != null && rate != null ? qty * rate : undefined),
    });
  }
  return out.filter((l) => l.description && l.description !== '—');
}

function mapShipment(root: Record<string, unknown>): InvoicePdfShipment | undefined {
  const ship = asRecord(root.shipment) ?? root;
  const blAwb = pick(ship, 'hbl_hawb', 'hblHawb', 'bl_awb', 'blAwb', 'mbl_mawb', 'mblMawb');
  const vessel = pick(ship, 'vessel_voyage', 'vesselVoyage', 'vessel_flight', 'vesselFlight');
  const pol = pick(ship, 'pol', 'port_of_loading', 'origin');
  const pod = pick(ship, 'pod', 'port_of_discharge', 'destination');
  const etd = pick(ship, 'etd');
  const eta = pick(ship, 'eta');
  const etdEta =
    pick(ship, 'etd_eta', 'etdEta') ||
    [etd, eta].filter(Boolean).join(' / ') ||
    undefined;
  const containers = Array.isArray(root.containers) ? root.containers : [];
  const containerNo =
    pick(ship, 'container_no', 'containerNo') ||
    containers
      .map((c) => pick(asRecord(c), 'container_no', 'containerNo', 'no'))
      .filter(Boolean)
      .join(', ') ||
    undefined;

  const shipment: InvoicePdfShipment = {
    blAwb,
    vesselFlight: vessel,
    pol,
    pod,
    containerNo,
    etdEta,
    commodity: pick(ship, 'commodity', 'goods_description'),
    grossWtCbm: pick(ship, 'gross_wt_cbm', 'grossWtCbm', 'weight_cbm'),
  };

  const has = Object.values(shipment).some((v) => Boolean(String(v || '').trim()));
  return has ? shipment : undefined;
}

function mapCompany(root: Record<string, unknown>): InvoicePdfCompany | undefined {
  const company = asRecord(root.company);
  if (!company) {
    const flatName = pick(root, 'company_name', 'companyName');
    if (!flatName) return undefined;
    return { name: flatName };
  }
  const addressLines = Array.isArray(company.address_lines)
    ? company.address_lines.map((l) => readString(l)).filter(Boolean)
    : [];
  return {
    name: pick(company, 'name', 'legal_name'),
    tagline: pick(company, 'tagline', 'subtitle'),
    phone: pick(company, 'phone', 'tel'),
    email: pick(company, 'email'),
    website: pick(company, 'website', 'web'),
  };
}

/**
 * Map backend format-payload (InvoiceFormatPayload or flat merge) into invoice PDF model.
 * Document title/subtitle chrome comes from `meta` — payload supplies business fields only.
 */
export function formatPayloadToInvoicePdfModel(
  payload: Record<string, unknown>,
  meta: FormatPayloadPdfMeta,
  fallbacks?: {
    jobRef?: string;
    currencyCode?: string;
    company?: InvoicePdfCompany;
  },
): InvoicePdfModel {
  const invoice = asRecord(payload.invoice) ?? payload;
  const billTo = asRecord(payload.bill_to) ?? asRecord(payload.billTo) ?? payload;
  const totals = asRecord(payload.totals) ?? payload;

  const currency =
    pick(invoice, 'currency_code', 'currencyCode') ??
    pick(payload, 'currencyCode', 'currency_code') ??
    fallbacks?.currencyCode ??
    'AED';

  const lines =
    mapLines(payload.lines, currency).length > 0
      ? mapLines(payload.lines, currency)
      : mapLines(payload.charge_lines ?? payload.chargeLines, currency);

  const subtotal =
    readNumber(totals.taxable ?? totals.subtotal) ??
    readNumber(pickNested(payload, [], 'subtotal')) ??
    lines.reduce((s, l) => s + (l.amount ?? 0), 0);

  const vatAmount =
    readNumber(totals.sgst ?? totals.cgst ?? totals.igst ?? totals.tax ?? totals.vat) ??
    readNumber(pickNested(payload, [], 'tax', 'tax_total', 'vatAmount'));

  const grandTotal =
    readNumber(totals.grand_total ?? totals.grandTotal ?? totals.total) ??
    readNumber(pickNested(payload, [], 'total', 'total_amount', 'grandTotal')) ??
    subtotal + (vatAmount ?? 0);

  const billAddress = Array.isArray(billTo.address_lines)
    ? billTo.address_lines.map((l) => readString(l)).filter(Boolean)
    : readString(billTo.billToAddress ?? billTo.address)
      ? [readString(billTo.billToAddress ?? billTo.address)!]
      : undefined;

  const remarksParts = [
    pick(invoice, 'remarks', 'narration'),
    pick(payload, 'remarks', 'narration'),
    Array.isArray(payload.terms) ? payload.terms.map(String).join('\n') : undefined,
  ].filter(Boolean);

  const company = mapCompany(payload) ?? fallbacks?.company;

  return {
    invoiceNumber:
      pick(invoice, 'number', 'invoice_number', 'document_number') ??
      pick(payload, 'invoiceNumber', 'documentNumber', 'number') ??
      fallbacks?.jobRef ??
      '—',
    invoiceDate:
      pick(invoice, 'invoice_date', 'document_date', 'date') ??
      pick(payload, 'invoiceDate', 'documentDate') ??
      undefined,
    dueDate:
      pick(invoice, 'due_date', 'valid_until') ??
      pick(payload, 'dueDate', 'validUntil'),
    jobRef:
      pickNested(payload, ['shipment'], 'job_no', 'jobNo') ??
      pick(payload, 'jobRef', 'job_ref', 'job_number') ??
      fallbacks?.jobRef,
    currencyCode: currency,
    vatRate: readNumber(payload.vat_rate ?? payload.vatRate) ?? 5,
    copyLabel: meta.copyLabel || pick(payload, 'copy_label', 'copyLabel') || 'ORIGINAL',
    documentTitle: meta.documentTitle,
    documentSubtitle: meta.documentSubtitle,
    detailsSectionTitle: meta.detailsSectionTitle,
    numberLabel: meta.numberLabel,
    dateLabel: meta.dateLabel || 'Document Date',
    dueDateLabel: meta.dueDateLabel || 'Due Date',
    jobRefLabel: meta.jobRefLabel || 'Job / Ref No.',
    hideAdvanceBalance: meta.hideAdvanceBalance ?? true,
    billTo: {
      client:
        pick(billTo, 'name', 'client', 'billToName', 'party_name') ??
        pick(payload, 'billToName', 'party_name') ??
        '—',
      attn: pick(billTo, 'attn', 'attention', 'contact_name'),
      phone: pick(billTo, 'phone', 'mobile'),
      email: pick(billTo, 'email'),
      vatNumber: pick(billTo, 'gstin', 'vat_number', 'vatNumber'),
      addressLines: billAddress,
    },
    shipment: mapShipment(payload),
    lines,
    subtotal,
    discount: readNumber(totals.discount) ?? 0,
    taxableAmount: readNumber(totals.taxable) ?? subtotal,
    vatAmount: vatAmount ?? 0,
    otherCharges: readNumber(totals.other_charges) ?? 0,
    grandTotal,
    advanceReceived: readNumber(totals.advance_received) ?? 0,
    balanceDue:
      readNumber(totals.balance_due) ??
      Math.max(0, grandTotal - (readNumber(totals.advance_received) ?? 0)),
    remarks: remarksParts.join('\n') || undefined,
    company: company ?? {
      name: 'KINGFISHER WINGS GROUP',
      tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
    },
  };
}
