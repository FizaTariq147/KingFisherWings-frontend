import type { CreateChartOfAccountFormValues } from '../types/chartOfAccount.types';

export const CHART_OF_ACCOUNT_FORM_DEFAULTS: CreateChartOfAccountFormValues = {
  account_code: '',
  account_name: '',
  account_name_ar: undefined,
  account_group: 'ASSETS',
  account_type: 'CURRENT_ASSET',
  account_sub_type: 'GENERAL',
  company_id: undefined,
  parent_id: undefined,
  is_header: false,
  is_postable: true,
  is_bank_account: false,
  is_cash_account: false,
  currency_code: 'AED',
  opening_balance: 0,
  opening_balance_type: 'DEBIT',
  allow_manual_entry: true,
  is_active: true,
  sort_order: 0,
  notes: undefined,
};

export function chartOfAccountToFormValues(
  account: Partial<CreateChartOfAccountFormValues> & {
    account_code?: string;
    account_name?: string;
  },
): CreateChartOfAccountFormValues {
  return {
    ...CHART_OF_ACCOUNT_FORM_DEFAULTS,
    ...account,
    account_code: account.account_code ?? '',
    account_name: account.account_name ?? '',
  };
}
