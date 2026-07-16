import type { ChartOfAccount, ChartOfAccountTreeNode } from '../types/chartOfAccount.types';
import type {
  AccountGroup,
  AccountSubType,
  AccountType,
  OpeningBalanceType,
} from '../constants/chartOfAccount.constants';
import {
  ACCOUNT_GROUPS,
  ACCOUNT_SUB_TYPES,
  ACCOUNT_TYPES,
  OPENING_BALANCE_TYPES,
} from '../constants/chartOfAccount.constants';

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

export function normalizeChartOfAccount(raw: unknown): ChartOfAccount | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.account_id) ||
    str(r.gl_account_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;

  const account_code = str(r.account_code) ?? str(r.code) ?? '';
  const account_name = str(r.account_name) ?? str(r.name) ?? '';
  const account_group =
    asEnum(r.account_group, ACCOUNT_GROUPS) ??
    asEnum(r.group, ACCOUNT_GROUPS) ??
    ('ASSETS' as AccountGroup);
  const account_type =
    asEnum(r.account_type, ACCOUNT_TYPES) ??
    asEnum(r.type, ACCOUNT_TYPES) ??
    ('CURRENT_ASSET' as AccountType);

  return {
    id,
    account_code,
    account_name,
    account_name_ar: str(r.account_name_ar),
    account_group,
    account_type,
    account_sub_type: asEnum(r.account_sub_type, ACCOUNT_SUB_TYPES) as AccountSubType | undefined,
    company_id: str(r.company_id),
    parent_id: str(r.parent_id) ?? null,
    parent_code: str(r.parent_code),
    parent_name: str(r.parent_name),
    is_header: bool(r.is_header),
    is_postable: bool(r.is_postable),
    is_bank_account: bool(r.is_bank_account),
    is_cash_account: bool(r.is_cash_account),
    currency_code: str(r.currency_code)?.toUpperCase(),
    opening_balance: num(r.opening_balance),
    opening_balance_type: asEnum(r.opening_balance_type, OPENING_BALANCE_TYPES) as
      | OpeningBalanceType
      | undefined,
    allow_manual_entry: bool(r.allow_manual_entry),
    is_active: bool(r.is_active) ?? true,
    sort_order: num(r.sort_order),
    notes: str(r.notes),
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function normalizeChartOfAccounts(raw: unknown): ChartOfAccount[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeChartOfAccount).filter((a): a is ChartOfAccount => Boolean(a));
}

export function normalizeChartOfAccountTree(raw: unknown): ChartOfAccountTreeNode[] {
  if (!Array.isArray(raw)) return [];
  const nodes: ChartOfAccountTreeNode[] = [];
  for (const node of raw) {
    const base = normalizeChartOfAccount(node);
    if (!base) continue;
    const rec = asRecord(node);
    const childrenRaw = rec?.children ?? rec?.Accounts ?? rec?.nodes;
    const children = Array.isArray(childrenRaw)
      ? normalizeChartOfAccountTree(childrenRaw)
      : undefined;
    nodes.push({ ...base, children });
  }
  return nodes;
}

export function chartOfAccountDisplayLabel(a: ChartOfAccount): string {
  return `${a.account_code} — ${a.account_name}`;
}
