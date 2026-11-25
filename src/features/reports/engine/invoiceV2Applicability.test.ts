import { describe, expect, it } from 'vitest';
import {
  invoiceV2ApplicabilityHint,
  invoiceV2ListRank,
  invoiceV2Suitability,
  invoiceV2TotalsProfile,
} from './invoiceV2Applicability';

/** INV/26/00094 amounts. The line totals include the tax. The subtotal does not. */
const invoice00094 = {
  invoice_number: 'INV/26/00094',
  currency_code: 'AED',
  subtotal: 152567,
  tax_total: null,
  tax_amount: 7628.35,
  total_amount: 160195.35,
  lines: [
    { quantity: 1, unit_price: 152000, tax_amount: 7600, line_total: 159600 },
    { quantity: 1, unit_price: 567, tax_amount: 28.35, line_total: 595.35 },
  ],
};

const realInvoices = [
  { invoice_number: 'INV/26/00102', subtotal: 120, total_amount: 120, lines: [{ quantity: 10, unit_price: 12, tax_amount: 0, line_total: 120 }] },
  { invoice_number: 'INV/26/00093', subtotal: 900, tax_amount: 45, total_amount: 945, lines: [{ quantity: 1, unit_price: 900, tax_amount: 45, line_total: 945 }] },
  { invoice_number: 'INV/26/00101', subtotal: 1831, total_amount: 1831, lines: [
    { quantity: 480, unit_price: 3.25, tax_amount: 0, line_total: 1560 },
    { quantity: 1, unit_price: 55, tax_amount: 0, line_total: 55 },
    { quantity: 480, unit_price: 0.45, tax_amount: 0, line_total: 216 },
  ] },
  { invoice_number: 'INV/26/00100', subtotal: 1200, total_amount: 1200, lines: [{ quantity: 1, unit_price: 1200, tax_amount: 0, line_total: 1200 }] },
  { invoice_number: 'INV/26/00099', subtotal: 22, total_amount: 22, lines: [
    { quantity: 1, unit_price: 20, tax_amount: 0, line_total: 20 },
    { quantity: 1, unit_price: 2, tax_amount: 0, line_total: 2 },
  ] },
  { invoice_number: 'INV/26/00097', subtotal: 70, tax_amount: 3.5, total_amount: 73.5, lines: [{ quantity: 1, unit_price: 70, tax_amount: 3.5, line_total: 73.5 }] },
  invoice00094,
  { invoice_number: 'INV/26/00095', subtotal: 56789, tax_amount: 2839.45, total_amount: 59628.45, lines: [{ quantity: 1, unit_price: 56789, tax_amount: 2839.45, line_total: 59628.45 }] },
  { invoice_number: 'INV/26/00098', subtotal: 1520000, tax_amount: 76000, total_amount: 1596000, lines: [{ quantity: 1, unit_price: 1520000, tax_amount: 76000, line_total: 1596000 }] },
  { invoice_number: 'INV/26/00089', subtotal: 90, tax_amount: 4.5, total_amount: 94.5, lines: [{ quantity: 1, unit_price: 90, tax_amount: 4.5, line_total: 94.5 }] },
];

const formats = {
  'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE': ['INV/26/00102', 'INV/26/00093', 'INV/26/00101', 'INV/26/00100', 'INV/26/00099', 'INV/26/00097', 'INV/26/00094', 'INV/26/00095', 'INV/26/00098', 'INV/26/00089'],
  'INVOICE_REPORT_FORMAT_17_INVOICE_JASPER': ['INV/26/00102', 'INV/26/00101', 'INV/26/00100', 'INV/26/00099'],
  'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE': ['INV/26/00102', 'INV/26/00101', 'INV/26/00100', 'INV/26/00099'],
} as const;

describe('invoice v2 arithmetic suitability', () => {
  it('reads the totals rows from the spec profile', () => {
    expect(invoiceV2TotalsProfile('INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE')).toMatchObject({
      subtotal: false, tax: false, discount: false, rounding: false, total: true,
    });
    expect(invoiceV2TotalsProfile('INVOICE_REPORT_FORMAT_17_INVOICE_JASPER')).toMatchObject({
      subtotal: true, tax: false, total: true,
    });
    expect(invoiceV2TotalsProfile('INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE')).toMatchObject({
      subtotal: true, tax: false, discount: false, total: true,
    });
  });

  it('marks INV/26/00094 when the printed subtotal cannot reach the total', () => {
    expect(invoiceV2Suitability('INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE', invoice00094).suitable).toBe(true);
    expect(invoiceV2ApplicabilityHint('INVOICE_REPORT_FORMAT_17_INVOICE_JASPER', invoice00094))
      .toBe('not suitable for this invoice: the tax is not printed');
    expect(invoiceV2ApplicabilityHint('INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE', invoice00094))
      .toBe('not suitable for this invoice: the tax is not printed');
  });

  it('reports which of the 10 real invoices Formats 10, 17 and 4 fit', () => {
    for (const [code, suitableNumbers] of Object.entries(formats)) {
      const suitable = realInvoices
        .filter((invoice) => invoiceV2Suitability(code, invoice).suitable)
        .map((invoice) => invoice.invoice_number);
      expect(suitable).toEqual([...suitableNumbers]);
    }
  });

  it('still opens a code that is not suitable', () => {
    expect(invoiceV2ApplicabilityHint('INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE', invoice00094)).toMatch(/^not suitable/);
  });

  it('notes unprinted tax without blocking a layout whose rows already add up', () => {
    const code = 'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE';
    expect(invoiceV2Suitability(code, invoice00094).suitable).toBe(true);
    expect(invoiceV2ListRank(code, invoice00094)).toBe(0);
    expect(invoiceV2ApplicabilityHint(code, invoice00094)).toBe('suitable for arithmetic, tax not shown');
    expect(invoiceV2ApplicabilityHint(code, realInvoices[0])).toBeNull();
  });
});
