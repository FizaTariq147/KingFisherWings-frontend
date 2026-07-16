import type { BankReconciliationStatus } from '../constants/bankReconciliation.constants';

export interface BankTransferDto {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  currency_code: string;
  exchange_rate?: number;
  transfer_date?: string;
  narration?: string;
  reference_number?: string;
  company_id?: string;
}

export interface CreateBankReconciliationDto {
  gl_account_id: string;
  statement_date: string;
  statement_balance: number;
  bank_account_id?: string;
  company_id?: string;
  remarks?: string;
}

export interface UpdateBankReconciliationDto {
  statement_date?: string;
  statement_balance?: number;
  remarks?: string;
}

export interface CreateBankReconciliationLineDto {
  voucher_id?: string;
  voucher_line_id?: string;
  account_id?: string;
  txn_date: string;
  description?: string;
  debit_amount?: number;
  credit_amount?: number;
  is_matched?: boolean;
  statement_ref?: string;
}

export interface UpdateBankReconciliationLineDto {
  is_matched?: boolean;
  statement_ref?: string;
  description?: string;
}

export interface BankReconciliationLine {
  id: string;
  txn_date?: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  is_matched?: boolean;
  statement_ref?: string;
  voucher_id?: string;
  voucher_line_id?: string;
  account_id?: string;
}

export interface BankReconciliation {
  id: string;
  gl_account_id?: string;
  statement_date?: string;
  statement_balance?: number;
  computed_balance?: number;
  difference?: number;
  status: BankReconciliationStatus;
  bank_account_id?: string;
  company_id?: string;
  remarks?: string;
  lines?: BankReconciliationLine[];
}

export interface BankReconciliationListParams {
  status?: BankReconciliationStatus;
  gl_account_id?: string;
}
