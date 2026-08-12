import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import type {
  VendorInvoiceDetail,
  VendorInvoiceLine,
  VendorInvoiceListItem,
  VendorInvoiceListResult,
  VendorInvoiceSummary,
} from '../types/vendorInvoices.types';

export function normalizeInvoiceSummary(raw: unknown): VendorInvoiceSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const byStatusRaw = asRecord(data.by_status) ?? asRecord(data.byStatus) ?? {};
  const byStatus: Record<string, number> = {};
  for (const [k, v] of Object.entries(byStatusRaw)) {
    const n = pickNumber(v);
    if (n !== undefined) byStatus[k] = n;
  }
  const sum = Object.values(byStatus).reduce((s, n) => s + n, 0);
  return {
    total: pickNumber(data.total, data.count) ?? sum,
    outstanding: pickNumber(data.outstanding, data.outstanding_total, data.outstandingTotal) ?? 0,
    overdue: pickNumber(data.overdue, data.overdue_count, data.overdueCount) ?? 0,
    paid: pickNumber(data.paid, data.paid_count, data.paidCount) ?? 0,
    byStatus,
  };
}

/** Extract a downloadable PDF/file URL from vendor invoice API payloads. */
export function pickInvoicePdfUrl(data: Record<string, unknown>): string | undefined {
  const direct = pickString(
    data.pdf_url,
    data.pdfUrl,
    data.customer_pdf_url,
    data.customerPdfUrl,
    data.vendor_pdf_url,
    data.vendorPdfUrl,
    data.attachment_url,
    data.attachmentUrl,
    data.source_file_url,
    data.sourceFileUrl,
    data.file_url,
    data.fileUrl,
    data.download_url,
    data.downloadUrl,
  );
  if (direct) return direct;

  for (const key of ['attachment', 'file', 'document', 'source_file', 'sourceFile', 'vendor_file']) {
    const nested = asRecord(data[key]);
    if (!nested) continue;
    const url = pickString(
      nested.url,
      nested.file_url,
      nested.fileUrl,
      nested.download_url,
      nested.downloadUrl,
      nested.path,
    );
    if (url) return url;
  }

  for (const key of ['attachments', 'documents', 'files']) {
    const list = data[key];
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const row = asRecord(item);
      if (!row) continue;
      const url = pickString(row.url, row.file_url, row.fileUrl, row.download_url, row.downloadUrl, row.path);
      if (url) return url;
    }
  }

  const purchaseInvoice = asRecord(data.purchase_invoice) ?? asRecord(data.purchaseInvoice);
  if (purchaseInvoice) return pickInvoicePdfUrl(purchaseInvoice);

  return undefined;
}

function normalizeLine(raw: unknown): VendorInvoiceLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  return {
    id: pickString(r.id) || Math.random().toString(36).slice(2),
    description: pickString(r.description) || 'Line',
    quantity: pickNumber(r.quantity, r.qty),
    unitPrice: pickNumber(r.unit_price, r.unitPrice),
    lineTotal: pickNumber(r.line_total, r.lineTotal, r.amount, r.total),
  };
}

export function normalizeInvoiceListItem(raw: unknown): VendorInvoiceListItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  return {
    id,
    number: pickString(r.invoice_number, r.invoiceNumber, r.number, r.pi_number, r.ref) || id,
    status: pickString(r.status) || undefined,
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    invoiceDate: pickString(r.invoice_date, r.invoiceDate, r.date) || undefined,
    dueDate: pickString(r.due_date, r.dueDate) || undefined,
    totalAmount: pickNumber(r.total_amount, r.totalAmount, r.amount, r.total),
    outstandingBalance: pickNumber(r.outstanding_balance, r.outstandingBalance, r.balance),
    reference: pickString(r.reference, r.vendor_ref, r.vendorRef) || undefined,
  };
}

export function normalizeInvoiceList(
  raw: unknown,
  params: { page?: number; limit?: number },
): VendorInvoiceListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'invoices', 'data']);
  const normalized = items
    .map(normalizeInvoiceListItem)
    .filter((x): x is VendorInvoiceListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeInvoiceDetail(raw: unknown): VendorInvoiceDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return null;
  const base = normalizeInvoiceListItem(data);
  if (!base) return null;
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    ...base,
    subtotal: pickNumber(data.subtotal),
    taxTotal: pickNumber(data.tax_total, data.taxTotal),
    paidAmount: pickNumber(data.paid_amount, data.paidAmount),
    remarks: pickString(data.remarks, data.notes) || undefined,
    pdfUrl: pickInvoicePdfUrl(data),
    lines: linesRaw.map(normalizeLine).filter((l): l is VendorInvoiceLine => Boolean(l)),
  };
}
