import type { CreateGlPaymentFormValues } from '../types/glPayment.types';

export const GL_PAYMENT_FORM_DEFAULTS: CreateGlPaymentFormValues = {
  direction: 'RECEIPT',
  payment_method: 'BANK_TRANSFER',
  party_id: '',
  amount: 0,
  currency_code: 'AED',
  exchange_rate: 1,
  payment_date: new Date().toISOString().slice(0, 10),
  narration: undefined,
  reference_number: undefined,
  company_id: undefined,
  branch_id: undefined,
  bank_account_id: undefined,
  gl_account_id: undefined,
  allocations: undefined,
  cheque_number: undefined,
  cheque_date: undefined,
  cheque_due_date: undefined,
  cheque_bank_name: undefined,
  is_pdc: false,
};

export function glPaymentToFormValues(
  payment: Partial<CreateGlPaymentFormValues>,
): CreateGlPaymentFormValues {
  return {
    ...GL_PAYMENT_FORM_DEFAULTS,
    ...payment,
    direction: payment.direction ?? 'RECEIPT',
    party_id: payment.party_id ?? '',
    currency_code: payment.currency_code ?? 'AED',
    allocations: undefined,
  };
}
