import type {
  AccountGroup,
  AccountSubType,
  AccountType,
  OpeningBalanceType,
} from '../constants/chartOfAccount.constants';
import type {
  CreateChartOfAccountFormValues,
  UpdateChartOfAccountFormValues,
} from '../schemas/chartOfAccount.schema';

export type {
  CreateChartOfAccountFormValues,
  UpdateChartOfAccountFormValues,
} from '../schemas/chartOfAccount.schema';

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_name_ar?: string;
  account_group: AccountGroup;
  account_type: AccountType;
  account_sub_type?: AccountSubType;
  company_id?: string;
  parent_id?: string | null;
  parent_code?: string;
  parent_name?: string;
  is_header?: boolean;
  is_postable?: boolean;
  is_bank_account?: boolean;
  is_cash_account?: boolean;
  currency_code?: string;
  opening_balance?: number;
  opening_balance_type?: OpeningBalanceType;
  allow_manual_entry?: boolean;
  is_active?: boolean;
  sort_order?: number;
  notes?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateChartOfAccountDto = CreateChartOfAccountFormValues;
export type UpdateChartOfAccountDto = UpdateChartOfAccountFormValues;

export interface ChartOfAccountListParams {
  search?: string;
  account_group?: AccountGroup;
  account_type?: AccountType;
  is_postable?: boolean;
  is_active?: boolean;
}

export interface ChartOfAccountTreeNode extends ChartOfAccount {
  children?: ChartOfAccountTreeNode[];
}

export interface TrialBalanceParams {
  from_date?: string;
  to_date?: string;
  hide_zero?: boolean;
}

export interface TrialBalanceLine {
  account_id?: string;
  account_code?: string;
  account_name?: string;
  account_group?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  opening_debit?: number;
  opening_credit?: number;
  [key: string]: unknown;
}

export interface TrialBalanceResult {
  lines: TrialBalanceLine[];
  raw: unknown;
}

export interface AccountLedgerParams {
  from_date?: string;
  to_date?: string;
}

export interface AccountLedgerLine {
  id?: string;
  voucher_id?: string;
  voucher_number?: string;
  voucher_date?: string;
  description?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  [key: string]: unknown;
}

export interface AccountLedgerResult {
  lines: AccountLedgerLine[];
  raw: unknown;
}

export interface ChartOfAccountListResult {
  accounts: ChartOfAccount[];
}
