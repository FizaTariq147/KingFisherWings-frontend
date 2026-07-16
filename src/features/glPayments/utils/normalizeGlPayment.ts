import type { GlPayment, PaymentAllocation } from '../types/glPayment.types';
import type {
  GlPaymentStatus,
  PaymentDirection,
  PaymentMethod,
} from '../constants/glPayment.constants';
import {
  GL_PAYMENT_STATUSES,
  PAYMENT_DIRECTIONS,
  PAYMENT_METHODS,
} from '../constants/glPayment.constants';

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

function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const s = str(value)?.toUpperCase();
  if (!s) return undefined;
  return (allowed as readonly string[]).includes(s) ? (s as T) : undefined;
}

export function normalizePaymentAllocation(raw: unknown): PaymentAllocation | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.allocation_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;
  const invoice_id = str(r.invoice_id) ?? '';
  return {
    id,
    payment_id: str(r.payment_id),
    invoice_id,
    invoice_number: str(r.invoice_number) ?? str(r.invoice_no),
    amount: num(r.amount) ?? 0,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function normalizePaymentAllocations(raw: unknown): PaymentAllocation[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizePaymentAllocation).filter((a): a is PaymentAllocation => Boolean(a));
}

export function normalizeGlPayment(raw: unknown): GlPayment | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.payment_id) ||
    str(r.gl_payment_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;

  const allocationsRaw = r.allocations ?? r.payment_allocations;
  const allocations = Array.isArray(allocationsRaw)
    ? normalizePaymentAllocations(allocationsRaw)
    : undefined;

  const amount = num(r.amount) ?? 0;
  const allocated_amount =
    num(r.allocated_amount) ??
    (allocations ? allocations.reduce((s, a) => s + a.amount, 0) : undefined);
  const unallocated_amount =
    num(r.unallocated_amount) ??
    (allocated_amount != null ? Math.max(0, amount - allocated_amount) : undefined);

  return {
    id,
    payment_number: str(r.payment_number) ?? str(r.number),
    direction:
      asEnum(r.direction, PAYMENT_DIRECTIONS) ??
      ('RECEIPT' as PaymentDirection),
    payment_method: asEnum(r.payment_method, PAYMENT_METHODS) as PaymentMethod | undefined,
    status:
      asEnum(r.status, GL_PAYMENT_STATUSES) ??
      ('DRAFT' as GlPaymentStatus),
    party_id: str(r.party_id) ?? '',
    party_name: str(r.party_name),
    amount,
    currency_code: str(r.currency_code)?.toUpperCase() ?? 'AED',
    exchange_rate: num(r.exchange_rate),
    payment_date: str(r.payment_date) ?? str(r.date),
    company_id: str(r.company_id),
    branch_id: str(r.branch_id),
    bank_account_id: str(r.bank_account_id),
    gl_account_id: str(r.gl_account_id),
    gl_account_code: str(r.gl_account_code),
    reference_number: str(r.reference_number) ?? str(r.reference),
    narration: str(r.narration),
    cheque_number: str(r.cheque_number),
    cheque_date: str(r.cheque_date),
    cheque_due_date: str(r.cheque_due_date),
    cheque_bank_name: str(r.cheque_bank_name),
    is_pdc: bool(r.is_pdc),
    allocated_amount,
    unallocated_amount,
    voucher_id: str(r.voucher_id),
    posted_at: str(r.posted_at),
    cancelled_at: str(r.cancelled_at),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
    allocations,
  };
}

export function normalizeGlPayments(raw: unknown): GlPayment[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeGlPayment).filter((p): p is GlPayment => Boolean(p));
}

export function glPaymentDisplayNumber(p: GlPayment): string {
  return p.payment_number || p.id.slice(0, 8);
}
