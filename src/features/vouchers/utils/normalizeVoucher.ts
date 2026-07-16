import type { Voucher, VoucherLine } from '../types/voucher.types';
import type { VoucherStatus, VoucherType } from '../constants/voucher.constants';
import { VOUCHER_STATUSES, VOUCHER_TYPES } from '../constants/voucher.constants';

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

function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const s = str(value)?.toUpperCase();
  if (!s) return undefined;
  return (allowed as readonly string[]).includes(s) ? (s as T) : undefined;
}

export function normalizeVoucherLine(raw: unknown): VoucherLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.line_id) ||
    str(r.voucher_line_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;
  const account_id = str(r.account_id) ?? '';
  return {
    id,
    voucher_id: str(r.voucher_id),
    account_id,
    account_code: str(r.account_code),
    account_name: str(r.account_name),
    debit_amount: num(r.debit_amount) ?? num(r.debit) ?? 0,
    credit_amount: num(r.credit_amount) ?? num(r.credit) ?? 0,
    currency_code: str(r.currency_code)?.toUpperCase(),
    exchange_rate: num(r.exchange_rate),
    narration: str(r.narration),
    party_id: str(r.party_id),
    job_id: str(r.job_id),
    cost_center: str(r.cost_center),
    line_number: num(r.line_number) ?? num(r.line_no),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function normalizeVoucherLines(raw: unknown): VoucherLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeVoucherLine).filter((l): l is VoucherLine => Boolean(l));
}

export function normalizeVoucher(raw: unknown): Voucher | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.voucher_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;

  const linesRaw = r.lines ?? r.voucher_lines ?? r.entries;
  const lines = Array.isArray(linesRaw) ? normalizeVoucherLines(linesRaw) : undefined;

  const totalDebit =
    num(r.total_debit) ??
    (lines ? lines.reduce((s, l) => s + l.debit_amount, 0) : undefined);
  const totalCredit =
    num(r.total_credit) ??
    (lines ? lines.reduce((s, l) => s + l.credit_amount, 0) : undefined);

  return {
    id,
    voucher_number: str(r.voucher_number) ?? str(r.number),
    voucher_type:
      asEnum(r.voucher_type, VOUCHER_TYPES) ??
      asEnum(r.type, VOUCHER_TYPES) ??
      ('JOURNAL' as VoucherType),
    status:
      asEnum(r.status, VOUCHER_STATUSES) ??
      ('DRAFT' as VoucherStatus),
    currency_code: str(r.currency_code)?.toUpperCase(),
    exchange_rate: num(r.exchange_rate),
    voucher_date: str(r.voucher_date) ?? str(r.date),
    narration: str(r.narration),
    reference_number: str(r.reference_number) ?? str(r.reference),
    company_id: str(r.company_id),
    branch_id: str(r.branch_id),
    party_id: str(r.party_id),
    party_name: str(r.party_name),
    job_id: str(r.job_id),
    invoice_id: str(r.invoice_id),
    total_debit: totalDebit,
    total_credit: totalCredit,
    posted_at: str(r.posted_at),
    reversed_at: str(r.reversed_at),
    reversal_of_id: str(r.reversal_of_id),
    reversed_by_id: str(r.reversed_by_id),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
    lines,
  };
}

export function normalizeVouchers(raw: unknown): Voucher[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeVoucher).filter((v): v is Voucher => Boolean(v));
}

export function voucherDisplayNumber(v: Voucher): string {
  return v.voucher_number || v.id.slice(0, 8);
}

export function voucherIsBalanced(v: Voucher): boolean {
  const debit = v.total_debit ?? 0;
  const credit = v.total_credit ?? 0;
  return Math.abs(debit - credit) < 0.000001;
}
