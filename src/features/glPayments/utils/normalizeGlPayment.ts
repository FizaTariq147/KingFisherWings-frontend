import { isUuid } from '@/lib/isUuid';
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

/** Prefer human-readable labels; ignore bare UUIDs. */
function humanStr(value: unknown): string | undefined {
  const s = str(value);
  if (!s || isUuid(s)) return undefined;
  return s;
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

function bankLabel(nested: Record<string, unknown> | null): string | undefined {
  if (!nested) return undefined;
  const bank = humanStr(nested.bank_name) ?? humanStr(nested.bankName);
  const account =
    humanStr(nested.account_name) ??
    humanStr(nested.accountName) ??
    humanStr(nested.name);
  const number =
    humanStr(nested.account_number) ??
    humanStr(nested.accountNumber) ??
    humanStr(nested.iban);
  if (bank && account) return `${bank} — ${account}`;
  if (bank && number) return `${bank} — ${number}`;
  return bank || account || number;
}

export function normalizePaymentAllocation(raw: unknown): PaymentAllocation | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.allocation_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;

  const invoiceNested =
    asRecord(r.invoice) ?? asRecord(r.document) ?? asRecord(r.sales_invoice);
  const invoice_id =
    str(r.invoice_id) ??
    str(r.invoiceId) ??
    (invoiceNested ? str(invoiceNested.id) : undefined) ??
    '';

  return {
    id,
    payment_id: str(r.payment_id) ?? str(r.paymentId),
    invoice_id,
    invoice_number:
      humanStr(r.invoice_number) ??
      humanStr(r.invoice_no) ??
      humanStr(r.invoiceNumber) ??
      (invoiceNested
        ? humanStr(invoiceNested.invoice_number) ??
          humanStr(invoiceNested.invoice_no) ??
          humanStr(invoiceNested.number) ??
          humanStr(invoiceNested.invoiceNumber)
        : undefined),
    amount: num(r.amount) ?? 0,
    created_at: str(r.created_at) ?? str(r.createdAt),
    updated_at: str(r.updated_at) ?? str(r.updatedAt),
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
    num(r.allocatedAmount) ??
    (allocations ? allocations.reduce((s, a) => s + a.amount, 0) : undefined);
  const unallocated_amount =
    num(r.unallocated_amount) ??
    num(r.unallocatedAmount) ??
    (allocated_amount != null ? Math.max(0, amount - allocated_amount) : undefined);

  const partyNested =
    asRecord(r.party) ?? asRecord(r.customer) ?? asRecord(r.vendor) ?? asRecord(r.organization);
  const glNested =
    asRecord(r.gl_account) ?? asRecord(r.glAccount) ?? asRecord(r.account) ?? asRecord(r.coa);
  const bankNested = asRecord(r.bank_account) ?? asRecord(r.bankAccount);
  const voucherNested = asRecord(r.voucher) ?? asRecord(r.journal_voucher);

  return {
    id,
    payment_number:
      humanStr(r.payment_number) ??
      humanStr(r.payment_no) ??
      humanStr(r.paymentNumber) ??
      humanStr(r.number),
    direction:
      asEnum(r.direction, PAYMENT_DIRECTIONS) ??
      ('RECEIPT' as PaymentDirection),
    payment_method: asEnum(
      r.payment_method ?? r.paymentMethod,
      PAYMENT_METHODS,
    ) as PaymentMethod | undefined,
    status:
      asEnum(r.status, GL_PAYMENT_STATUSES) ??
      ('DRAFT' as GlPaymentStatus),
    party_id:
      str(r.party_id) ??
      str(r.partyId) ??
      str(r.customer_id) ??
      (partyNested ? str(partyNested.id) : undefined) ??
      '',
    party_name:
      humanStr(r.party_name) ??
      humanStr(r.partyName) ??
      humanStr(r.customer_name) ??
      humanStr(r.customerName) ??
      (partyNested
        ? humanStr(partyNested.name) ??
          humanStr(partyNested.party_name) ??
          humanStr(partyNested.short_name)
        : undefined),
    amount,
    currency_code:
      str(r.currency_code)?.toUpperCase() ??
      str(r.currencyCode)?.toUpperCase() ??
      'AED',
    exchange_rate: num(r.exchange_rate) ?? num(r.exchangeRate),
    payment_date: str(r.payment_date) ?? str(r.paymentDate) ?? str(r.date),
    company_id: str(r.company_id) ?? str(r.companyId),
    branch_id: str(r.branch_id) ?? str(r.branchId),
    bank_account_id:
      str(r.bank_account_id) ??
      str(r.bankAccountId) ??
      (bankNested ? str(bankNested.id) : undefined),
    bank_account_name:
      humanStr(r.bank_account_name) ??
      humanStr(r.bankAccountName) ??
      humanStr(r.bank_name) ??
      bankLabel(bankNested),
    gl_account_id:
      str(r.gl_account_id) ??
      str(r.glAccountId) ??
      (glNested ? str(glNested.id) : undefined),
    gl_account_code:
      humanStr(r.gl_account_code) ??
      humanStr(r.glAccountCode) ??
      humanStr(r.account_code) ??
      (glNested
        ? humanStr(glNested.account_code) ??
          humanStr(glNested.code) ??
          humanStr(glNested.accountCode)
        : undefined),
    gl_account_name:
      humanStr(r.gl_account_name) ??
      humanStr(r.glAccountName) ??
      humanStr(r.account_name) ??
      (glNested
        ? humanStr(glNested.account_name) ??
          humanStr(glNested.name) ??
          humanStr(glNested.accountName)
        : undefined),
    reference_number:
      humanStr(r.reference_number) ??
      humanStr(r.referenceNumber) ??
      humanStr(r.reference),
    narration: str(r.narration),
    cheque_number: str(r.cheque_number) ?? str(r.chequeNumber),
    cheque_date: str(r.cheque_date) ?? str(r.chequeDate),
    cheque_due_date: str(r.cheque_due_date) ?? str(r.chequeDueDate),
    cheque_bank_name: str(r.cheque_bank_name) ?? str(r.chequeBankName),
    is_pdc: bool(r.is_pdc) ?? bool(r.isPdc),
    allocated_amount,
    unallocated_amount,
    voucher_id:
      str(r.voucher_id) ??
      str(r.voucherId) ??
      (voucherNested ? str(voucherNested.id) : undefined),
    voucher_number:
      humanStr(r.voucher_number) ??
      humanStr(r.voucher_no) ??
      humanStr(r.voucherNumber) ??
      (voucherNested
        ? humanStr(voucherNested.voucher_number) ??
          humanStr(voucherNested.voucher_no) ??
          humanStr(voucherNested.number)
        : undefined),
    posted_at: str(r.posted_at) ?? str(r.postedAt),
    cancelled_at: str(r.cancelled_at) ?? str(r.cancelledAt),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at) ?? str(r.createdAt),
    updated_at: str(r.updated_at) ?? str(r.updatedAt),
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

export function glAccountDisplayLabel(p: GlPayment): string | undefined {
  if (p.gl_account_code && p.gl_account_name) {
    return `${p.gl_account_code} — ${p.gl_account_name}`;
  }
  return p.gl_account_code || p.gl_account_name;
}
