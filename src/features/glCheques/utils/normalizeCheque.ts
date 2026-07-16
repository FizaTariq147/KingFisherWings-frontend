import type { GlCheque } from '../types/cheque.types';
import type { ChequeStatus, ChequeType } from '../constants/cheque.constants';
import { CHEQUE_STATUSES, CHEQUE_TYPES } from '../constants/cheque.constants';

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

export function normalizeCheque(raw: unknown): GlCheque | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.cheque_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;

  const cheque_number = str(r.cheque_number) ?? str(r.number) ?? '';
  const cheque_type =
    asEnum(r.cheque_type, CHEQUE_TYPES) ?? ('RECEIVABLE' as ChequeType);
  const party = asRecord(r.party);

  return {
    id,
    cheque_number,
    cheque_type,
    status: asEnum(r.status, CHEQUE_STATUSES) ?? ('PENDING' as ChequeStatus),
    party_id: str(r.party_id) ?? '',
    party_name: str(r.party_name) ?? str(party?.name),
    party_code: str(r.party_code) ?? str(party?.code),
    amount: num(r.amount) ?? 0,
    currency_code: str(r.currency_code)?.toUpperCase() ?? 'AED',
    cheque_date: str(r.cheque_date),
    due_date: str(r.due_date) ?? str(r.pdc_date),
    is_pdc: bool(r.is_pdc),
    company_id: str(r.company_id),
    bank_account_id: str(r.bank_account_id),
    bank_name: str(r.bank_name),
    remarks: str(r.remarks),
    bounce_reason: str(r.bounce_reason) ?? str(r.reason),
    deposited_at: str(r.deposited_at),
    cleared_at: str(r.cleared_at),
    bounced_at: str(r.bounced_at),
    cancelled_at: str(r.cancelled_at),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function normalizeCheques(raw: unknown): GlCheque[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeCheque).filter((c): c is GlCheque => Boolean(c));
}

export function chequeDisplayNumber(cheque: Pick<GlCheque, 'cheque_number' | 'id'>): string {
  return cheque.cheque_number || cheque.id.slice(0, 8);
}
