import { useMemo } from 'react';
import { isUuid } from '@/lib/isUuid';
import { useChartOfAccounts } from './useChartOfAccounts';
import type { AccountGroup } from '../constants/chartOfAccount.constants';
import type { ChartOfAccount } from '../types/chartOfAccount.types';

export type GlAccountSelectOption = { value: string; label: string };

/** True when COA is suitable as the ledger behind an org bank account (payment posting). */
export function isBankOrCashGlAccount(account: ChartOfAccount): boolean {
  if (account.is_bank_account === true || account.is_cash_account === true) return true;
  const sub = String(account.account_sub_type ?? '')
    .trim()
    .toUpperCase();
  if (sub === 'BANK' || sub === 'CASH') return true;
  const name = `${account.account_name ?? ''} ${account.account_code ?? ''}`.toLowerCase();
  // Explicit AR/AP names are never valid bank ledgers for remittance approve.
  if (/receivable|payable|debtor|creditor/.test(name)) return false;
  if (/\bbank\b|\bcash\b|\bpetty\b/.test(name)) return true;
  return false;
}

/**
 * Postable COA rows for charge-code `gl_*_account_id` (and similar) selects.
 * Optional `accountGroup` narrows the list (e.g. REVENUE / EXPENSE) when the tenant COA uses groups.
 * Pass `bankCashOnly` for Organization → Bank accounts GL link.
 */
export function useGlAccountSelectOptions(
  enabled = true,
  accountGroup?: AccountGroup,
  bankCashOnly = false,
): {
  options: GlAccountSelectOption[];
  accounts: ChartOfAccount[];
  isLoading: boolean;
  isError: boolean;
} {
  const query = useChartOfAccounts(
    enabled
      ? {
          is_postable: true,
          is_active: true,
          ...(accountGroup ? { account_group: accountGroup } : {}),
        }
      : {},
  );

  const accounts = useMemo(() => {
    const rows = query.data?.accounts ?? [];
    return rows.filter((a) => {
      if (!isUuid(a.id)) return false;
      if (a.is_header) return false;
      if (a.is_postable === false) return false;
      if (a.is_active === false) return false;
      if (bankCashOnly && !isBankOrCashGlAccount(a)) return false;
      return true;
    });
  }, [query.data?.accounts, bankCashOnly]);

  const options = useMemo(() => {
    const opts: GlAccountSelectOption[] = [];
    for (const a of accounts) {
      const code = String(a.account_code ?? '').trim();
      const name = String(a.account_name ?? '').trim();
      const label =
        code && name ? `${code} — ${name}` : code || name || a.id;
      opts.push({ value: a.id, label });
    }
    opts.sort((x, y) => x.label.localeCompare(y.label));
    return opts;
  }, [accounts]);

  return {
    options,
    accounts,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
