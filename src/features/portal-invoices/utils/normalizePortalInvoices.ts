import {
  asRecord,
  normalizeMeta,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList
} from '@/features/portal-shared/normalize';
import type {
  PortalInvoiceDetail, PortalInvoiceLine, PortalInvoiceListItem,
  PortalInvoiceListResult, PortalInvoiceSummary,
} from '../types/portalInvoices.types';

export function normalizeInvoiceSummary(raw: unknown): PortalInvoiceSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const byStatusRaw = asRecord(data.by_status) ?? asRecord(data.byStatus) ?? {};
  const byStatus: Record<string, number> = {};
  for (const [k, v] of Object.entries(byStatusRaw)) {
    const n = pickNumber(v); if (n !== undefined) byStatus[k] = n;
  }
  const sum = Object.values(byStatus).reduce((s, n) => s + n, 0);
  return {
    total: pickNumber(data.total, data.count, data.invoices_total, data.invoicesTotal) ?? sum,
    outstanding:
      pickNumber(
        data.outstanding,
        data.outstanding_total,
        data.outstandingTotal,
        data.outstanding_amount,
        data.outstandingAmount,
        data.outstanding_balance,
        data.outstandingBalance,
        data.amount_outstanding,
        data.amountOutstanding,
        data.balance_due,
        data.balanceDue,
        data.total_outstanding,
        data.totalOutstanding,
      ) ?? 0,
    overdue:
      pickNumber(
        data.overdue,
        data.overdue_count,
        data.overdueCount,
        data.overdue_amount,
        data.overdueAmount,
      ) ?? 0,
    paid: pickNumber(data.paid, data.paid_count, data.paidCount) ?? 0,
    byStatus,
  };
}

export function normalizeInvoiceLine(raw: unknown): PortalInvoiceLine | null {
  const r = asRecord(raw); if (!r) return null;
  return {
    id: pickString(r.id) || Math.random().toString(36).slice(2),
    description: pickString(r.description) || 'Line',
    quantity: pickNumber(r.quantity, r.qty),
    unitPrice: pickNumber(r.unit_price, r.unitPrice),
    lineTotal: pickNumber(r.line_total, r.lineTotal, r.amount, r.total),
  };
}

export function normalizeInvoiceListItem(raw: unknown): PortalInvoiceListItem | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    number: pickString(r.invoice_number, r.invoiceNumber, r.number, r.ref) || id,
    status: pickString(r.status) || undefined,
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    invoiceDate: pickString(r.invoice_date, r.invoiceDate) || undefined,
    dueDate: pickString(r.due_date, r.dueDate) || undefined,
    totalAmount: pickNumber(r.total_amount, r.totalAmount, r.total),
    paidAmount: pickNumber(r.amount_paid, r.paid_amount, r.paidAmount, r.paid),
    outstandingBalance: pickNumber(
      r.balance_due,
      r.balanceDue,
      r.outstanding_balance,
      r.outstandingBalance,
      r.balance,
    ),
    jobId: pickString(r.job_id, r.jobId) || undefined,
  };
}

export function normalizeInvoiceList(raw: unknown, params: { page?: number; limit?: number }): PortalInvoiceListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'invoices', 'data']);
  const normalized = items.map(normalizeInvoiceListItem).filter((x): x is PortalInvoiceListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

/** Extract a downloadable PDF URL from portal invoice payloads (absolute or `/files/...`). */
export function pickPortalInvoicePdfUrl(data: Record<string, unknown>): string | undefined {
  const direct = pickString(
    data.pdf_url,
    data.pdfUrl,
    data.customer_pdf_url,
    data.customerPdfUrl,
    data.download_url,
    data.downloadUrl,
    data.file_url,
    data.fileUrl,
    data.file_path,
    data.filePath,
  );
  if (direct) return direct;

  for (const key of ['file', 'document', 'attachment', 'pdf']) {
    const nested = asRecord(data[key]);
    if (!nested) continue;
    const url = pickString(
      nested.pdf_url,
      nested.url,
      nested.file_url,
      nested.fileUrl,
      nested.download_url,
      nested.path,
    );
    if (url) return url;
  }
  return undefined;
}

export function normalizeInvoiceDetail(raw: unknown): PortalInvoiceDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw); if (!data) return null;
  const base = normalizeInvoiceListItem(data); if (!base) return null;
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    ...base,
    subtotal: pickNumber(data.subtotal),
    taxTotal: pickNumber(data.tax_total, data.taxTotal),
    paidAmount: pickNumber(data.amount_paid, data.paid_amount, data.paidAmount, data.paid),
    remarks: pickString(data.remarks) || undefined,
    pdfUrl: pickPortalInvoicePdfUrl(data),
    partyName: pickString(data.party_name, data.partyName, data.customer_name, data.customerName) || undefined,
    partyEmail: pickString(data.party_email, data.partyEmail, data.email) || undefined,
    partyPhone: pickString(data.party_phone, data.partyPhone, data.phone) || undefined,
    vatRate: pickNumber(data.vat_rate, data.vatRate),
    lines: linesRaw.map(normalizeInvoiceLine).filter((l): l is PortalInvoiceLine => Boolean(l)),
  };
}

