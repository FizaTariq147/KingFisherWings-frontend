import type { VoucherStatus, VoucherType } from '../constants/voucher.constants';
import type {
  CreateVoucherFormValues,
  CreateVoucherLineFormValues,
  UpdateVoucherFormValues,
  UpdateVoucherLineFormValues,
} from '../schemas/voucher.schema';

export type {
  CreateVoucherFormValues,
  CreateVoucherLineFormValues,
  UpdateVoucherFormValues,
  UpdateVoucherLineFormValues,
} from '../schemas/voucher.schema';

export interface VoucherLine {
  id: string;
  voucher_id?: string;
  account_id: string;
  account_code?: string;
  account_name?: string;
  debit_amount: number;
  credit_amount: number;
  currency_code?: string;
  exchange_rate?: number;
  narration?: string;
  party_id?: string;
  job_id?: string;
  cost_center?: string;
  line_number?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Voucher {
  id: string;
  voucher_number?: string;
  voucher_type: VoucherType;
  status: VoucherStatus;
  currency_code?: string;
  exchange_rate?: number;
  voucher_date?: string;
  narration?: string;
  reference_number?: string;
  company_id?: string;
  branch_id?: string;
  party_id?: string;
  party_name?: string;
  job_id?: string;
  invoice_id?: string;
  total_debit?: number;
  total_credit?: number;
  posted_at?: string;
  reversed_at?: string;
  reversal_of_id?: string;
  reversed_by_id?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  lines?: VoucherLine[];
}

export type CreateVoucherDto = CreateVoucherFormValues;
export type UpdateVoucherDto = UpdateVoucherFormValues;
export type CreateVoucherLineDto = CreateVoucherLineFormValues;
export type UpdateVoucherLineDto = UpdateVoucherLineFormValues;

export interface VoucherListParams {
  voucher_type?: VoucherType;
  status?: VoucherStatus;
  party_id?: string;
  job_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface VoucherListResult {
  vouchers: Voucher[];
}
