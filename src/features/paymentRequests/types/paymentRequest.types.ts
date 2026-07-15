import type { PaymentRequestStatus } from '../constants/paymentRequest.constants';
import type {
  CreatePaymentRequestFormValues,
  RejectPaymentRequestFormValues,
  UpdatePaymentRequestFormValues,
} from '../schemas/paymentRequest.schema';

export type {
  CreatePaymentRequestFormValues,
  RejectPaymentRequestFormValues,
  UpdatePaymentRequestFormValues,
} from '../schemas/paymentRequest.schema';

export interface PaymentRequest {
  id: string;
  request_number?: string;
  status: PaymentRequestStatus;
  party_id: string;
  party_name?: string;
  amount: number;
  currency_code: string;
  invoice_id?: string;
  job_id?: string;
  due_date?: string;
  remarks?: string;
  rejected_reason?: string;
  approved_at?: string;
  rejected_at?: string;
  paid_at?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreatePaymentRequestDto = CreatePaymentRequestFormValues;
export type UpdatePaymentRequestDto = UpdatePaymentRequestFormValues;
export type RejectPaymentRequestDto = RejectPaymentRequestFormValues;

export interface PaymentRequestListParams {
  page?: number;
  limit?: number;
  status?: PaymentRequestStatus;
  party_id?: string;
  job_id?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentRequestListResult {
  paymentRequests: PaymentRequest[];
  meta: PaginationMeta;
}
