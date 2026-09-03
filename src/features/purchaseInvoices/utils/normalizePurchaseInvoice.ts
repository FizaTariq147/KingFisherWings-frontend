import { isUuid } from '@/lib/isUuid';
import {
  PURCHASE_INVOICE_STATUSES,
  PURCHASE_INVOICE_TYPES,
  type PurchaseInvoiceStatus,
  type PurchaseInvoiceType,
} from '../constants/purchaseInvoice.constants';
import type { PurchaseInvoice, PurchaseInvoiceLine } from '../types/purchaseInvoice.types';

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

function normalizeStatus(value: unknown): PurchaseInvoiceStatus {
  const raw = String(value ?? 'DRAFT').trim().toUpperCase();
  return (PURCHASE_INVOICE_STATUSES as readonly string[]).includes(raw)
    ? (raw as PurchaseInvoiceStatus)
    : 'DRAFT';
}

function normalizeType(value: unknown): PurchaseInvoiceType | string | undefined {
  const raw = str(value)?.toUpperCase();
  if (!raw) return undefined;
  return (PURCHASE_INVOICE_TYPES as readonly string[]).includes(raw)
    ? (raw as PurchaseInvoiceType)
    : raw;
}

export function normalizePurchaseInvoiceLine(raw: unknown): PurchaseInvoiceLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id || !isUuid(id)) return null;
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

export function normalizePurchaseInvoiceLines(raw: unknown): PurchaseInvoiceLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizePurchaseInvoiceLine)
    .filter((l): l is PurchaseInvoiceLine => Boolean(l));
}

export function normalizePurchaseInvoice(raw: unknown): PurchaseInvoice | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id || !isUuid(id)) return null;
  const party_id = str(r.party_id) ?? '';
  return {
    id,
    invoice_number: str(r.invoice_number) ?? str(r.invoice_no) ?? str(r.number),
    status: normalizeStatus(r.status),
    invoice_type: normalizeType(r.invoice_type),
    party_id,
    party_name:
      str(r.party_name) ??
      str(r.vendor_name) ??
      str(r.supplier_name) ??
      str(r.customer_name) ??
      str(asRecord(r.party)?.name) ??
      str(asRecord(r.vendor)?.name) ??
      str(asRecord(r.supplier)?.name),
    company_id: str(r.company_id),
    job_id: str(r.job_id),
    branch_id: str(r.branch_id),
    department_id: str(r.department_id),
    currency_code: (str(r.currency_code) ?? 'AED').toUpperCase(),
    exchange_rate: num(r.exchange_rate) ?? 1,
    vat_rate: num(r.vat_rate) ?? 5,
    invoice_date: str(r.invoice_date),
    due_date: str(r.due_date),
    lpo_number: str(r.lpo_number),
    remarks: str(r.remarks),
    internal_notes: str(r.internal_notes),
    subtotal: num(r.subtotal),
    tax_total: num(r.tax_total) ?? num(r.vat_amount),
    total_amount: num(r.total_amount) ?? num(r.total),
    paid_amount: num(r.paid_amount) ?? num(r.amount_paid) ?? num(r.paid),
    outstanding_balance:
      num(r.outstanding_balance) ?? num(r.balance_due) ?? num(r.balanceDue) ?? num(r.balance),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
    created_by: str(r.created_by),
    lines: normalizePurchaseInvoiceLines(r.lines ?? r.invoice_lines),
  };
}

export function normalizePurchaseInvoices(raw: unknown): PurchaseInvoice[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizePurchaseInvoice)
    .filter((i): i is PurchaseInvoice => Boolean(i));
}

export function purchaseInvoiceDisplayNumber(inv: PurchaseInvoice): string {
  return inv.invoice_number || inv.id.slice(0, 8).toUpperCase();
}
