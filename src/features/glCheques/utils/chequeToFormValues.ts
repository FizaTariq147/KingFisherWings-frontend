import type { CreateChequeFormValues } from '../types/cheque.types';
import type { GlCheque } from '../types/cheque.types';

export const CHEQUE_FORM_DEFAULTS: CreateChequeFormValues = {
  cheque_number: '',
  cheque_type: 'RECEIVABLE',
  party_id: '',
  amount: 0,
  currency_code: 'AED',
  cheque_date: new Date().toISOString().slice(0, 10),
  due_date: undefined,
  is_pdc: false,
  company_id: undefined,
  bank_account_id: undefined,
  bank_name: undefined,
  remarks: undefined,
};

export function chequeToFormValues(cheque: Partial<GlCheque>): CreateChequeFormValues {
  return {
    ...CHEQUE_FORM_DEFAULTS,
    cheque_number: cheque.cheque_number ?? '',
    cheque_type: cheque.cheque_type ?? 'RECEIVABLE',
    party_id: cheque.party_id ?? '',
    amount: cheque.amount ?? 0,
    currency_code: cheque.currency_code ?? 'AED',
    cheque_date: cheque.cheque_date ?? CHEQUE_FORM_DEFAULTS.cheque_date,
    due_date: cheque.due_date,
    is_pdc: cheque.is_pdc ?? false,
    company_id: cheque.company_id,
    bank_account_id: cheque.bank_account_id,
    bank_name: cheque.bank_name,
    remarks: cheque.remarks,
  };
}
