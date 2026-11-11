import { describe, expect, it } from 'vitest';
import {
  mapToInvoiceDocViewModel,
  mapToLedgerViewModel,
  mapToPurchaseInvoiceViewModel,
  mapToVoucherViewModel,
} from '../mappings';
import {
  fixtureCommercialInvoiceBound,
  fixtureLedgerBoundEmptyBalances,
  fixturePaymentVoucherBound,
  fixturePurchaseInvoiceBound,
  fixtureReceiptVoucherBound,
} from './fixtures/sanitizedCatalogPdfFixtures';
import { invoiceFormatToInvoicePdfModel } from '../utils/invoiceFormatToInvoicePdfModel';
import { getInvoiceFormatPreview } from '../data/invoiceFormatPreviews';

describe('Phase 7 financial integrity (fixture pass-through)', () => {
  it('commercial invoice totals match fixture backend-shaped values', () => {
    const model = mapToInvoiceDocViewModel(
      'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
      fixtureCommercialInvoiceBound,
    );
    expect(model.subtotal).toBe('1350.00');
    expect(model.tax).toBe('67.50');
    expect(model.total).toBe('1417.50');
    expect(model.currencyCode).toBe('AED');
    expect(model.discount).toBe('0.00');
  });

  it('purchase invoice preserves vendor totals without recomputation', () => {
    const model = mapToPurchaseInvoiceViewModel(
      'PURCHASE_INVOICE_REPORT_FORMAT_1',
      fixturePurchaseInvoiceBound,
    );
    expect(model.subtotal).toBe('800.00');
    expect(model.tax).toBe('40.00');
    expect(model.total).toBe('840.00');
  });

  it('payment/receipt vouchers expose Dr/Cr rows from fixture tables', () => {
    const pay = mapToVoucherViewModel(
      'PAYMENT_VOUCHER_REPORT_FORMAT_1',
      fixturePaymentVoucherBound,
    );
    const rec = mapToVoucherViewModel(
      'RECEIPT_VOUCHER_REPORT_FORMAT_1',
      fixtureReceiptVoucherBound,
    );
    expect(pay.entryRows?.[0]).toEqual(['2100', 'Accounts payable', '840.00', '']);
    expect(pay.entryRows?.[1]?.[3]).toBe('840.00');
    expect(rec.currencyCode).toBe('USD');
    expect(rec.total).toBe('500.00');
  });

  it('ledger does not invent opening/closing when fixture omits them', () => {
    const model = mapToLedgerViewModel(
      'STATEMENT_OF_ACCOUNTS_REPORT_FORMAT',
      fixtureLedgerBoundEmptyBalances,
    );
    expect(model.openingBalance).toBeUndefined();
    expect(model.closingBalance).toBeUndefined();
    expect(model.tableRows?.length).toBe(2);
  });

  it('entity-bound invoice PDF model does not invent VAT when tax missing', () => {
    const preview = getInvoiceFormatPreview('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');
    expect(preview).toBeTruthy();
    const pdfModel = invoiceFormatToInvoicePdfModel(preview!, {
      entityBound: true,
      subtotal: '200.00',
      total: '200.00',
      lines: [{ description: 'Service', amount: '200.00' }],
    });
    expect(pdfModel.vatAmount).toBe(0);
    expect(pdfModel.grandTotal).toBe(200);
  });
});
