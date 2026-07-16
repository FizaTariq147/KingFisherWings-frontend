import type { CreateVoucherDto } from '../types/voucher.types';

/** Demo create payload matching CreateVoucherDto (freight journal example). */
export const VOUCHER_DEMO_CREATE: CreateVoucherDto = {
  voucher_type: 'JOURNAL',
  currency_code: 'AED',
  exchange_rate: 1,
  voucher_date: new Date().toISOString().slice(0, 10),
  narration: 'Freight revenue accrual — ocean FCL',
  reference_number: 'JV-DEMO-001',
  lines: undefined,
};

export function buildVoucherDemoValues(
  accountDebitId?: string,
  accountCreditId?: string,
): CreateVoucherDto {
  const lines =
    accountDebitId && accountCreditId
      ? [
          {
            account_id: accountDebitId,
            debit_amount: 1500,
            credit_amount: 0,
            currency_code: 'AED',
            exchange_rate: 1,
            narration: 'Trade receivables',
          },
          {
            account_id: accountCreditId,
            debit_amount: 0,
            credit_amount: 1500,
            currency_code: 'AED',
            exchange_rate: 1,
            narration: 'Freight revenue',
          },
        ]
      : undefined;

  return {
    ...VOUCHER_DEMO_CREATE,
    lines,
  };
}
