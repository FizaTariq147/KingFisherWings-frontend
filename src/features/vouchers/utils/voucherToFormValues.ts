import type { CreateVoucherFormValues } from '../types/voucher.types';

export const VOUCHER_FORM_DEFAULTS: CreateVoucherFormValues = {
  voucher_type: 'JOURNAL',
  currency_code: 'AED',
  exchange_rate: 1,
  voucher_date: new Date().toISOString().slice(0, 10),
  narration: undefined,
  reference_number: undefined,
  company_id: undefined,
  branch_id: undefined,
  party_id: undefined,
  job_id: undefined,
  invoice_id: undefined,
  lines: [
    {
      account_id: '',
      debit_amount: 0,
      credit_amount: 0,
      currency_code: 'AED',
      exchange_rate: 1,
      narration: undefined,
      party_id: undefined,
      job_id: undefined,
      cost_center: undefined,
    },
    {
      account_id: '',
      debit_amount: 0,
      credit_amount: 0,
      currency_code: 'AED',
      exchange_rate: 1,
      narration: undefined,
      party_id: undefined,
      job_id: undefined,
      cost_center: undefined,
    },
  ],
};

export function voucherToFormValues(
  v: Partial<CreateVoucherFormValues> & {
    voucher_type?: CreateVoucherFormValues['voucher_type'];
  },
): CreateVoucherFormValues {
  return {
    ...VOUCHER_FORM_DEFAULTS,
    ...v,
    voucher_type: v.voucher_type ?? 'JOURNAL',
    lines: undefined,
  };
}
