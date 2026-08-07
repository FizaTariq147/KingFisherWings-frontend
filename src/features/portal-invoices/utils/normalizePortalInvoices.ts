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
    total: pickNumber(data.total, data.count) ?? sum,
    outstanding: pickNumber(data.outstanding, data.outstanding_total, data.outstandingTotal) ?? 0,
    overdue: pickNumber(data.overdue, data.overdue_count, data.overdueCount) ?? 0,
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
    outstandingBalance: pickNumber(r.outstanding_balance, r.outstandingBalance, r.balance),
    jobId: pickString(r.job_id, r.jobId) || undefined,
  };
}

export function normalizeInvoiceList(raw: unknown, params: { page?: number; limit?: number }): PortalInvoiceListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'invoices', 'data']);
  const normalized = items.map(normalizeInvoiceListItem).filter((x): x is PortalInvoiceListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeInvoiceDetail(raw: unknown): PortalInvoiceDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw); if (!data) return null;
  const base = normalizeInvoiceListItem(data); if (!base) return null;
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    ...base,
    subtotal: pickNumber(data.subtotal),
    taxTotal: pickNumber(data.tax_total, data.taxTotal),
    paidAmount: pickNumber(data.paid_amount, data.paidAmount),
    remarks: pickString(data.remarks) || undefined,
    lines: linesRaw.map(normalizeInvoiceLine).filter((l): l is PortalInvoiceLine => Boolean(l)),
  };
}

