import { describe, expect, it } from 'vitest';
import type { JobCharge } from '@/features/jobs/types/job.types';
import { isClientFlowInvoiceCode } from './invoiceFlowOptions';
import { jobChargesToFlowLines } from './loadInvoiceFlowRecord';

describe('client flow invoice', () => {
  it('prints the tax invoice and quotation in the browser and keeps staging notes out', () => {
    expect(isClientFlowInvoiceCode('INVOICE_FLOW_TAX_INVOICE_1')).toBe(true);
    expect(isClientFlowInvoiceCode('QUOTATION_FLOW_1')).toBe(true);
    expect(isClientFlowInvoiceCode('CREDIT_NOTE_FLOW_1')).toBe(false);
  });

  it('maps sale charges and skips cost lines', () => {
    const lines = jobChargesToFlowLines([
      {
        id: '1',
        charge_code_id: 'c',
        description: 'Freight',
        quantity: 2,
        unit_price: 50,
        currency_code: 'INR',
        is_cost: false,
        line_total: 100,
        sale_tax_amount: 18,
      } as JobCharge,
      {
        id: '2',
        charge_code_id: 'c2',
        description: 'Cost',
        quantity: 1,
        unit_price: 10,
        currency_code: 'INR',
        is_cost: true,
      } as JobCharge,
    ]);
    expect(lines).toEqual([
      {
        description: 'Freight',
        quantity: 2,
        unit_price: 50,
        currency_code: 'INR',
        exchange_rate: undefined,
        line_total: 100,
        tax_amount: 18,
        taxable_amount: undefined,
      },
    ]);
  });
});
