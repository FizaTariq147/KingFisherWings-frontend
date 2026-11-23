import { describe, expect, it } from 'vitest';
import { INVOICE_FLOW_TAX_INVOICE_1 } from './invoiceFlowCode';
import { flowTaxAmount, flowTotalsAddUp, flowTotalsRows } from './invoiceFlowTotals';
import { invoiceV2Suitability } from '../engine/invoiceV2Applicability';

describe('flow totals and suitability', () => {
  const invoice00094 = {
    currency_code: 'AED',
    subtotal: 152567,
    tax_amount: 7628.35,
    tax_total: null,
    total_amount: 160195.35,
    discount: 0,
    rounding: 0,
    lines: [
      { quantity: 1, unit_price: 152000, tax_amount: 7600, line_total: 159600 },
      { quantity: 1, unit_price: 567, tax_amount: 28.35, line_total: 595.35 },
    ],
  };

  it('uses tax_amount for INV/26/00094 and treats the flow template as suitable', () => {
    expect(flowTaxAmount(invoice00094)).toBeCloseTo(7628.35, 2);
    expect(flowTotalsAddUp(invoice00094)).toBe(true);
    expect(invoiceV2Suitability(INVOICE_FLOW_TAX_INVOICE_1, invoice00094)).toEqual({
      suitable: true,
      reason: null,
    });
    const taxRow = flowTotalsRows(invoice00094).find((row) => row.key === 'tax');
    expect(taxRow?.amount).toBeCloseTo(7628.35, 2);
  });

  it('is suitable for a discounted and rounded invoice', () => {
    const invoice = {
      currency_code: 'USD',
      subtotal: 200,
      tax_amount: 20,
      discount: 15,
      rounding: 0.04,
      total_amount: 205.04,
      lines: [{ quantity: 1, unit_price: 200, tax_amount: 20, line_total: 220 }],
    };
    expect(flowTotalsAddUp(invoice)).toBe(true);
    expect(invoiceV2Suitability(INVOICE_FLOW_TAX_INVOICE_1, invoice).suitable).toBe(true);
  });

  it('is suitable for a multi-currency record when printed totals add up', () => {
    const invoice = {
      currency_code: 'EUR',
      subtotal: 100,
      tax_amount: 10,
      discount: 0,
      rounding: 0,
      total_amount: 110,
      lines: [
        { description: 'A', quantity: 1, unit_price: 60, currency_code: 'EUR', tax_amount: 6, line_total: 66 },
        { description: 'B', quantity: 1, unit_price: 40, currency_code: 'USD', tax_amount: 4, line_total: 44 },
      ],
    };
    expect(invoiceV2Suitability(INVOICE_FLOW_TAX_INVOICE_1, invoice).suitable).toBe(true);
  });

  it('never reads tax_total for the flow tax figure', () => {
    const invoice = {
      subtotal: 100,
      tax_total: 999,
      tax_amount: 10,
      total_amount: 110,
      lines: [{ tax_amount: 10, line_total: 110 }],
    };
    expect(flowTaxAmount(invoice)).toBe(10);
  });

  it('assertFlowTaxIntegrity flags header vs line mismatch and equation failures', async () => {
    const { assertFlowTaxIntegrity } = await import('./invoiceFlowTotals');
    const ok = assertFlowTaxIntegrity(invoice00094);
    expect(ok.ok).toBe(true);
    const badHeader = assertFlowTaxIntegrity({
      ...invoice00094,
      tax_amount: 1,
    });
    expect(badHeader.ok).toBe(false);
    expect(badHeader.violations.some((row) => row.code === 'header_vs_line_tax')).toBe(true);
    const badTotal = assertFlowTaxIntegrity({
      ...invoice00094,
      total_amount: 1,
    });
    expect(badTotal.ok).toBe(false);
    expect(badTotal.violations.some((row) => row.code === 'totals_equation')).toBe(true);
  });
});
