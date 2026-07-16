import type {
  GlPaymentStatus,
  PaymentDirection,
  PaymentMethod,
} from '../constants/glPayment.constants';
import type {
  CreateGlPaymentFormValues,
  PaymentAllocationInputFormValues,
  UpdateGlPaymentFormValues,
} from '../schemas/glPayment.schema';

export type {
  CreateGlPaymentFormValues,
  PaymentAllocationInputFormValues,
  UpdateGlPaymentFormValues,
} from '../schemas/glPayment.schema';

export interface PaymentAllocation {
  id: string;
  payment_id?: string;
  invoice_id: string;
  invoice_number?: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface GlPayment {
  id: string;
  payment_number?: string;
  direction: PaymentDirection;
  payment_method?: PaymentMethod;
  status: GlPaymentStatus;
  party_id: string;
  party_name?: string;
  amount: number;
  currency_code: string;
  exchange_rate?: number;
  payment_date?: string;
  company_id?: string;
  branch_id?: string;
  bank_account_id?: string;
  gl_account_id?: string;
  gl_account_code?: string;
  reference_number?: string;
  narration?: string;
  cheque_number?: string;
  cheque_date?: string;
  cheque_due_date?: string;
  cheque_bank_name?: string;
  is_pdc?: boolean;
  allocated_amount?: number;
  unallocated_amount?: number;
  voucher_id?: string;
  posted_at?: string;
  cancelled_at?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  allocations?: PaymentAllocation[];
}

export type CreateGlPaymentDto = CreateGlPaymentFormValues;
export type UpdateGlPaymentDto = UpdateGlPaymentFormValues;
export type PaymentAllocationInputDto = PaymentAllocationInputFormValues;

export interface GlPaymentListParams {
  direction?: PaymentDirection;
  status?: GlPaymentStatus;
  party_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface GlPaymentListResult {
  payments: GlPayment[];
}
