import type { ChequeStatus, ChequeType } from '../constants/cheque.constants';
import type {
  BounceChequeFormValues,
  CreateChequeFormValues,
  UpdateChequeFormValues,
} from '../schemas/cheque.schema';

export type { CreateChequeFormValues, UpdateChequeFormValues, BounceChequeFormValues };

export interface GlCheque {
  id: string;
  cheque_number: string;
  cheque_type: ChequeType;
  status: ChequeStatus;
  party_id: string;
  party_name?: string;
  party_code?: string;
  amount: number;
  currency_code: string;
  cheque_date?: string;
  due_date?: string;
  is_pdc?: boolean;
  company_id?: string;
  bank_account_id?: string;
  bank_name?: string;
  remarks?: string;
  bounce_reason?: string;
  deposited_at?: string;
  cleared_at?: string;
  bounced_at?: string;
  cancelled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateChequeDto = CreateChequeFormValues;
export type UpdateChequeDto = UpdateChequeFormValues;
export type BounceChequeDto = BounceChequeFormValues;

export interface ChequeListParams {
  cheque_type?: ChequeType;
  status?: ChequeStatus;
  party_id?: string;
  is_pdc?: boolean;
  due_before?: string;
}

export interface ChequeListResult {
  cheques: GlCheque[];
}

export interface PdcDueReportParams {
  within_days?: number;
}

export interface PdcDueReportResult {
  cheques: GlCheque[];
}
