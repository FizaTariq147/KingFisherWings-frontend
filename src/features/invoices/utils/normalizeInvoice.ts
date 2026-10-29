import { isUuid } from '@/lib/isUuid';
import { pickDetailHints } from '@/features/shared/continuum';
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
  type InvoiceStatus,
  type InvoiceType,
} from '../constants/invoice.constants';
import type { Invoice, InvoiceLine } from '../types/invoice.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

function normalizeStatus(value: unknown): InvoiceStatus {
  const raw = String(value ?? 'DRAFT').trim().toUpperCase();
  return (INVOICE_STATUSES as readonly string[]).includes(raw)
    ? (raw as InvoiceStatus)
    : 'DRAFT';
}

function normalizeType(value: unknown): InvoiceType | string | undefined {
  const raw = str(value)?.toUpperCase();
  if (!raw) return undefined;
  return (INVOICE_TYPES as readonly string[]).includes(raw) ? (raw as InvoiceType) : raw;
}

function pickInvoiceId(record: Record<string, unknown>): string | undefined {
  const id = str(record.id) ?? str(record.invoice_id) ?? str(record.invoiceId);
  return id && isUuid(id) ? id : undefined;
}

/** Score how likely a record is the invoice entity (not party/company embed). */
function invoiceCandidateScore(record: Record<string, unknown>, fromKey?: string): number {
  let score = 0;
  if (fromKey && /invoice/i.test(fromKey)) score += 20;
  if (pickInvoiceId(record)) score += 5;
  if (str(record.invoice_number) || str(record.invoice_no) || str(record.number)) score += 12;
  if (str(record.currency_code) || str(record.currencyCode)) score += 4;
  if (str(record.party_id) || str(record.partyId) || asRecord(record.party)) score += 4;
  if (str(record.status)) score += 3;
  if (Array.isArray(record.lines) || Array.isArray(record.invoice_lines)) score += 6;
  if (record.subtotal != null || record.total_amount != null || record.total != null) score += 4;
  // Penalize obvious relation embeds that also have an id.
  if (fromKey && /^(party|customer|company|branch|department|job|user|created_by)$/i.test(fromKey)) {
    score -= 25;
  }
  if (str(record.email) && str(record.name) && !str(record.currency_code) && !str(record.invoice_number)) {
    score -= 10;
  }
  return score;
}

/**
 * Dig invoice-shaped objects out of varied Nest/API envelopes.
 * Avoids grabbing party/company embeds that also expose `id`.
 */
export function extractInvoiceCandidate(raw: unknown): unknown {
  const candidates: Array<{ value: unknown; score: number }> = [];

  const visit = (value: unknown, fromKey?: string, depth = 0) => {
    if (depth > 5 || value == null) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item, fromKey, depth + 1);
      return;
    }
    const record = asRecord(value);
    if (!record) return;
    const score = invoiceCandidateScore(record, fromKey);
    if (score > 0 && pickInvoiceId(record)) {
      candidates.push({ value, score });
    }
    for (const [key, child] of Object.entries(record)) {
      if (child && typeof child === 'object') visit(child, key, depth + 1);
    }
  };

  visit(raw);
  if (!candidates.length) return raw;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.value ?? raw;
}

export function normalizeInvoiceLine(raw: unknown): InvoiceLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickInvoiceId(r);
  if (!id) return null;
  return {
    id,
    invoice_id: str(r.invoice_id),
    description: str(r.description) ?? '',
    quantity: num(r.quantity) ?? 1,
    unit_price: num(r.unit_price) ?? 0,
    charge_code_id: str(r.charge_code_id),
    charge_code: str(r.charge_code) ?? str(r.charge_code_code),
    tax_rate_id: str(r.tax_rate_id),
    is_taxable: bool(r.is_taxable) ?? true,
    sort_order: num(r.sort_order) ?? 0,
    tax_amount: num(r.tax_amount),
    line_total: num(r.line_total) ?? num(r.amount) ?? num(r.total),
  };
}

export function normalizeInvoiceLines(raw: unknown): InvoiceLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeInvoiceLine).filter((l): l is InvoiceLine => Boolean(l));
}

export function normalizeInvoice(raw: unknown): Invoice | null {
  const extracted = extractInvoiceCandidate(raw);
  const r = asRecord(extracted) ?? asRecord(raw);
  if (!r) return null;
  const id = pickInvoiceId(r);
  if (!id) return null;
  const partyRecord = asRecord(r.party) ?? asRecord(r.customer);
  const party_id = str(r.party_id) ?? str(r.partyId) ?? str(partyRecord?.id) ?? '';
  const hints = pickDetailHints(r);
  return {
    id,
    invoice_number: str(r.invoice_number) ?? str(r.invoice_no) ?? str(r.number),
    status: normalizeStatus(r.status),
    invoice_type: normalizeType(r.invoice_type),
    party_id,
    party_name:
      str(r.party_name) ??
      str(r.customer_name) ??
      str(partyRecord?.name),
    company_id: str(r.company_id) ?? str(r.companyId) ?? str(asRecord(r.company)?.id),
    job_id: str(r.job_id) ?? str(r.jobId) ?? str(asRecord(r.job)?.id),
    branch_id: str(r.branch_id) ?? str(r.branchId),
    department_id: str(r.department_id) ?? str(r.departmentId),
    currency_code: (str(r.currency_code) ?? str(r.currencyCode) ?? 'AED').toUpperCase(),
    exchange_rate: num(r.exchange_rate) ?? num(r.exchangeRate) ?? 1,
    vat_rate: num(r.vat_rate) ?? num(r.vatRate) ?? 5,
    invoice_date: str(r.invoice_date) ?? str(r.invoiceDate),
    due_date: str(r.due_date) ?? str(r.dueDate),
    lpo_number: str(r.lpo_number) ?? str(r.lpoNumber),
    remarks: str(r.remarks),
    internal_notes: str(r.internal_notes) ?? str(r.internalNotes),
    subtotal: num(r.subtotal),
    tax_total: num(r.tax_total) ?? num(r.vat_amount) ?? num(r.taxTotal),
    total_amount: num(r.total_amount) ?? num(r.totalAmount) ?? num(r.total),
    paid_amount: num(r.paid_amount) ?? num(r.amount_paid) ?? num(r.paid) ?? num(r.paidAmount),
    outstanding_balance:
      num(r.outstanding_balance) ??
      num(r.balance_due) ??
      num(r.balanceDue) ??
      num(r.balance) ??
      num(r.outstandingBalance),
    pdf_url: str(r.pdf_url) ?? str(r.pdfUrl),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at) ?? str(r.createdAt),
    updated_at: str(r.updated_at) ?? str(r.updatedAt),
    created_by: str(r.created_by) ?? str(r.createdBy),
    lines: normalizeInvoiceLines(r.lines ?? r.invoice_lines ?? r.invoiceLines),
    path_hints: hints.path_hints,
    ops_continuum: hints.ops_continuum,
  };
}

export function normalizeInvoices(raw: unknown): Invoice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeInvoice).filter((i): i is Invoice => Boolean(i));
}

export function invoiceDisplayNumber(inv: Invoice): string {
  return inv.invoice_number || inv.id.slice(0, 8).toUpperCase();
}
