import type {
  BankReconciliation,
  BankReconciliationLine,
} from '../types/bankReconciliation.types';
import { BANK_RECON_STATUSES, type BankReconciliationStatus } from '../constants/bankReconciliation.constants';

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

function asStatus(value: unknown): BankReconciliationStatus {
  const s = str(value)?.toUpperCase();
  if (s && (BANK_RECON_STATUSES as readonly string[]).includes(s)) {
    return s as BankReconciliationStatus;
  }
  return 'DRAFT';
}

export function normalizeBankReconciliationLine(raw: unknown): BankReconciliationLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id) return null;
  return {
    id,
    txn_date: str(r.txn_date) ?? str(r.date),
    description: str(r.description),
    debit_amount: num(r.debit_amount) ?? 0,
    credit_amount: num(r.credit_amount) ?? 0,
    is_matched: bool(r.is_matched),
    statement_ref: str(r.statement_ref),
    voucher_id: str(r.voucher_id),
    voucher_line_id: str(r.voucher_line_id),
    account_id: str(r.account_id),
  };
}

export function normalizeBankReconciliation(raw: unknown): BankReconciliation | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id) return null;
  const linesRaw = Array.isArray(r.lines) ? r.lines : [];
  return {
    id,
    gl_account_id: str(r.gl_account_id),
    statement_date: str(r.statement_date),
    statement_balance: num(r.statement_balance),
    computed_balance: num(r.computed_balance),
    difference: num(r.difference),
    status: asStatus(r.status),
    bank_account_id: str(r.bank_account_id),
    company_id: str(r.company_id),
    remarks: str(r.remarks),
    lines: linesRaw
      .map(normalizeBankReconciliationLine)
      .filter((x): x is BankReconciliationLine => Boolean(x)),
  };
}

export function normalizeBankReconciliations(raw: unknown): BankReconciliation[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeBankReconciliation)
    .filter((x): x is BankReconciliation => Boolean(x));
}
