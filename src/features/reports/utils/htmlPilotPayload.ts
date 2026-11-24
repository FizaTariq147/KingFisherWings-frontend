import type {
  InvoiceFormatPdfData,
  InvoiceFormatPdfLine,
} from './invoiceFormatToInvoicePdfModel';
import type { ReportContextIds } from './reportParameterUtils';

const BLOCKED_PARAMETER_KEYS = new Set([
  'companyId',
  'company_id',
  'tenantId',
  'tenant_id',
  'organizationId',
  'organization_id',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
}

function partyLines(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const lines = value.map((item) => text(item)).filter((item): item is string => Boolean(item));
    return lines.length ? lines : undefined;
  }
  if (typeof value === 'string') {
    const line = text(value);
    return line ? [line] : undefined;
  }
  if (!isRecord(value)) return undefined;
  const lines = [value.name, value.address, value.phone, value.email, ...(Array.isArray(value.lines) ? value.lines : [])]
    .map((item) => text(item))
    .filter((item): item is string => Boolean(item));
  return lines.length ? lines : undefined;
}

function chargeLines(value: unknown): InvoiceFormatPdfLine[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const lines = value
    .filter(isRecord)
    .map((row) => ({
      description: text(row.description) || '',
      qty: text(row.quantity ?? row.qty),
      rate: text(row.unit_price ?? row.rate),
      amount: text(row.line_total ?? row.amount),
      taxAmount: text(row.tax_amount ?? row.taxAmount),
    }))
    .filter((row) => row.description || row.qty || row.rate || row.amount || row.taxAmount);
  return lines.length ? lines : undefined;
}

function stringTable(value: unknown): string[][] | undefined {
  if (!Array.isArray(value)) return undefined;
  const rows = value
    .filter(Array.isArray)
    .map((row) => row.map((cell) => text(cell) || ''));
  return rows.length ? rows : undefined;
}

function jobRows(value: unknown): { headers: string[]; rows: string[][] } | undefined {
  if (!Array.isArray(value) || !value.length || !isRecord(value[0])) return undefined;
  const headers = ['Job', 'Customer', 'POL', 'POD', 'ETD', 'Status'];
  const rows = value.filter(isRecord).map((row) => [
    text(row.job ?? row.job_number ?? row.jobNumber) || '',
    text(row.customer ?? row.customer_name ?? row.customerName) || '',
    text(row.pol ?? row.port_of_loading) || '',
    text(row.pod ?? row.port_of_discharge) || '',
    text(row.etd) || '',
    text(row.status) || '',
  ]);
  return rows.length ? { headers, rows } : undefined;
}

function unwrap(raw: unknown): Record<string, unknown> | null {
  if (!isRecord(raw)) return null;
  if (isRecord(raw.payload)) return raw.payload;
  if (isRecord(raw.data) && !text(raw.invoiceNumber) && !Array.isArray(raw.lines) && !Array.isArray(raw.rows)) {
    return raw.data;
  }
  return raw;
}

/** Keep record values. Preview fields replace them only when the preview value is present. */
export function overlayHtmlPilotPayload(
  base: InvoiceFormatPdfData,
  overlay: InvoiceFormatPdfData,
): InvoiceFormatPdfData {
  const next: InvoiceFormatPdfData = { ...base, entityBound: true };
  for (const [key, value] of Object.entries(overlay) as [keyof InvoiceFormatPdfData, unknown][]) {
    if (key === 'entityBound') continue;
    if (value == null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    next[key] = value as never;
  }
  return next;
}

/**
 * Copy only fields the three HTML pilots already render.
 * Missing notify, net weight, and GST split stay omitted. No sample values.
 */
export function mapHtmlPilotPayload(raw: unknown): InvoiceFormatPdfData | null {
  const source = unwrap(raw);
  if (!source) return null;

  const header = isRecord(source.header) ? source.header : {};
  const parties = isRecord(source.parties) ? source.parties : {};
  const routing = isRecord(source.routing) ? source.routing : {};
  const cargo = isRecord(source.cargo) ? source.cargo : {};
  const totals = isRecord(source.totals) ? source.totals : {};
  const company = isRecord(source.company) ? source.company : {};

  const lines = chargeLines(source.lines ?? header.lines);
  const tableRows = stringTable(source.tableRows ?? source.table_rows);
  const jobs = jobRows(source.rows ?? source.jobs);
  const notify = partyLines(source.notifyLines ?? source.notify_lines ?? parties.notify);

  const data: InvoiceFormatPdfData = {
    entityBound: true,
    companyName: text(source.companyName ?? company.name),
    companyAddress: text(source.companyAddress ?? company.address),
    companyPhone: text(source.companyPhone ?? company.phone),
    companyEmail: text(source.companyEmail ?? company.email),
    companyWeb: text(source.companyWeb ?? company.web),
    logoUrl: text(source.logoUrl ?? company.logoUrl ?? company.logo_url),
    invoiceNumber: text(source.invoiceNumber ?? header.invoice_number ?? header.invoiceNumber),
    invoiceDate: text(source.invoiceDate ?? header.invoice_date ?? header.date),
    currencyCode: text(source.currencyCode ?? header.currency_code ?? header.currency),
    jobNumber: text(source.jobNumber ?? routing.job ?? routing.job_number ?? header.job_number),
    referenceNo: text(source.referenceNo ?? header.reference_no ?? routing.reference),
    hblNo: text(source.hblNo ?? header.hbl_number ?? routing.hbl),
    billToName: text(source.billToName ?? header.bill_to_name),
    billToAddress: text(source.billToAddress ?? header.bill_to_address),
    billToPhone: text(source.billToPhone),
    billToEmail: text(source.billToEmail),
    shipperLines: partyLines(source.shipperLines ?? parties.shipper),
    consigneeLines: partyLines(source.consigneeLines ?? parties.consignee),
    notifyLines: notify,
    pol: text(source.pol ?? routing.pol ?? routing.port_of_loading),
    pod: text(source.pod ?? routing.pod ?? routing.port_of_discharge),
    vesselFlight: text(source.vesselFlight ?? routing.vessel_voyage ?? routing.vessel),
    commodity: text(source.commodity ?? cargo.commodity ?? cargo.description),
    pieces: text(source.pieces ?? cargo.pieces),
    grossWeight: text(source.grossWeight ?? cargo.gross_weight ?? cargo.grossWeight),
    measurement: text(source.measurement ?? cargo.measurement),
    lines,
    tableHeaders: Array.isArray(source.tableHeaders)
      ? source.tableHeaders.map((cell) => text(cell) || '')
      : jobs?.headers,
    tableRows: tableRows ?? jobs?.rows,
    subtotal: text(source.subtotal ?? totals.subtotal),
    tax: text(source.tax ?? totals.tax_total ?? totals.tax_amount),
    total: text(source.total ?? totals.total_amount ?? totals.total),
  };

  return data;
}

/** Context and filters only. Company and tenant ids are never sent. */
export function buildHtmlPilotPreviewBody(
  context?: ReportContextIds | null,
  parameters?: Record<string, unknown> | null,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const ctx: Record<string, string> = {};
  for (const key of ['job_id', 'quotation_id', 'invoice_id', 'party_id', 'shipment_id'] as const) {
    const value = text(context?.[key]);
    if (value) ctx[key] = value;
  }
  if (Object.keys(ctx).length) body.context = ctx;

  if (parameters) {
    const safe: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parameters)) {
      if (BLOCKED_PARAMETER_KEYS.has(key)) continue;
      if (value == null || value === '') continue;
      safe[key] = value;
    }
    if (Object.keys(safe).length) body.parameters = safe;
  }
  return body;
}
