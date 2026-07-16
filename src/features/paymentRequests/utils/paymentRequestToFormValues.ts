import type { CreatePaymentRequestFormValues } from '../types/paymentRequest.types';
import type { PaymentRequest } from '../types/paymentRequest.types';

export const PAYMENT_REQUEST_FORM_DEFAULTS: CreatePaymentRequestFormValues = {
  party_id: '',
  amount: 0.01,
  currency_code: 'AED',
};

export function paymentRequestToFormValues(
  pr: PaymentRequest,
): CreatePaymentRequestFormValues {
  return {
    party_id: pr.party_id,
    amount: pr.amount,
    currency_code: pr.currency_code || 'AED',
    invoice_id: pr.invoice_id,
    job_id: pr.job_id,
    due_date: pr.due_date,
    remarks: pr.remarks,
  };
}
