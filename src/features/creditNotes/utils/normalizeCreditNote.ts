import { isUuid } from '@/lib/isUuid';
import {
  CREDIT_NOTE_INVOICE_TYPES,
  CREDIT_NOTE_STATUSES,
  type CreditNoteInvoiceType,
  type CreditNoteStatus,
} from '../constants/creditNote.constants';
import type { CreditNote, CreditNoteLine } from '../types/creditNote.types';

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

function normalizeStatus(value: unknown): CreditNoteStatus {
  const raw = String(value ?? 'DRAFT').trim().toUpperCase();
  return (CREDIT_NOTE_STATUSES as readonly string[]).includes(raw)
    ? (raw as CreditNoteStatus)
    : 'DRAFT';
}

function normalizeType(value: unknown): CreditNoteInvoiceType | string | undefined {
  const raw = str(value)?.toUpperCase();
  if (!raw) return undefined;
  return (CREDIT_NOTE_INVOICE_TYPES as readonly string[]).includes(raw)
    ? (raw as CreditNoteInvoiceType)
    : raw;
}

export function normalizeCreditNoteLine(raw: unknown): CreditNoteLine | null {
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

export function normalizeCreditNoteLines(raw: unknown): CreditNoteLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeCreditNoteLine)
    .filter((l): l is CreditNoteLine => Boolean(l));
}

export function normalizeCreditNote(raw: unknown): CreditNote | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id || !isUuid(id)) return null;
  return {
    id,
    invoice_number: str(r.invoice_number) ?? str(r.invoice_no) ?? str(r.number),
    credit_note_number:
      str(r.credit_note_number) ??
      str(r.credit_note_no) ??
      str(r.invoice_number) ??
      str(r.number),
    status: normalizeStatus(r.status),
    invoice_type: normalizeType(r.invoice_type),
    credited_invoice_id: str(r.credited_invoice_id),
    party_id: str(r.party_id),
    party_name:
      str(r.party_name) ??
      str(r.customer_name) ??
      str(asRecord(r.party)?.name),
    company_id: str(r.company_id),
    job_id: str(r.job_id),
    branch_id: str(r.branch_id),
    department_id: str(r.department_id),
    currency_code: (str(r.currency_code) ?? 'AED').toUpperCase(),
    exchange_rate: num(r.exchange_rate) ?? 1,
    vat_rate: num(r.vat_rate),
    invoice_date: str(r.invoice_date),
    due_date: str(r.due_date),
    remarks: str(r.remarks),
    subtotal: num(r.subtotal),
    tax_total: num(r.tax_total) ?? num(r.vat_amount),
    total_amount: num(r.total_amount) ?? num(r.total),
    paid_amount: num(r.paid_amount),
    outstanding_balance: num(r.outstanding_balance) ?? num(r.balance),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
    created_by: str(r.created_by),
    lines: normalizeCreditNoteLines(r.lines ?? r.invoice_lines),
  };
}

export function normalizeCreditNotes(raw: unknown): CreditNote[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeCreditNote).filter((c): c is CreditNote => Boolean(c));
}

export function creditNoteDisplayNumber(cn: CreditNote): string {
  return (
    cn.credit_note_number ||
    cn.invoice_number ||
    cn.id.slice(0, 8).toUpperCase()
  );
}
