import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { shouldPreferOfficialSamplePdf } from '../utils/preferOfficialSamplePdf';
import { getArrivalNoticeFormatUiLayout } from '../data/arrivalNoticeFormatUiLayouts';
import {
  mapToDeliveryOrderViewModel,
  mapToLedgerViewModel,
  mapToPurchaseInvoiceViewModel,
  mapToVoucherViewModel,
} from '../mappings';
import { getReportEnrichment } from '../registry';
import { preferredHblHawbPackKeyHint } from '../utils/fresaPackGenerateParams';
import { getRegistryByCode } from '../data/fresaReportRegistry';
import {
  fixtureHawbBound,
  fixtureLedgerBoundEmptyBalances,
  fixturePurchaseInvoiceBound,
} from './fixtures/sanitizedCatalogPdfFixtures';
import { invoiceFormatToInvoicePdfModel } from '../utils/invoiceFormatToInvoicePdfModel';
import { getInvoiceFormatPreview } from '../data/invoiceFormatPreviews';
import { MawbTemplateDocument } from '../templates/mawb';
import { HawbTemplateDocument } from '../templates/hawb';
import { mapToHawbViewModel, mapToMawbViewModel } from '../mappings';

describe('Phase 6 defect regressions', () => {
  it('entity-bound Generate must not prefer CDN sample', () => {
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_1',
        format: 'PDF',
        entityBound: true,
      }),
    ).toBe(false);
  });

  it('unbound browse may still prefer CDN sample', () => {
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_1',
        format: 'PDF',
        entityBound: false,
      }),
    ).toBe(true);
  });

  it('Arrival Format-11+ resolves to Format-1 alias layout', () => {
    const layout = getArrivalNoticeFormatUiLayout('ARRIVAL_NOTICE_REPORT_FORMAT_11');
    expect(layout).toBeTruthy();
    expect(layout!.code.toUpperCase()).toBe('ARRIVAL_NOTICE_REPORT_FORMAT_11');
    // Alias source is Format-1 Jasper shell (shared structure; bare FORMAT_1 has no JSON row).
    const base = getArrivalNoticeFormatUiLayout(
      'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
    );
    expect(base).toBeTruthy();
    expect(layout!.paper).toBe(base!.paper);
    // Bare Format-1 also resolves via the same shell alias.
    const bare = getArrivalNoticeFormatUiLayout('ARRIVAL_NOTICE_REPORT_FORMAT_1');
    expect(bare).toBeTruthy();
    expect(bare!.paper).toBe(base!.paper);
  });

  it('does not invent ledger opening/closing from table cells', () => {
    const model = mapToLedgerViewModel(
      'STATEMENT_OF_ACCOUNTS_REPORT_FORMAT',
      fixtureLedgerBoundEmptyBalances,
    );
    expect(model.openingBalance).toBeUndefined();
    expect(model.closingBalance).toBeUndefined();
  });

  it('does not invent delivery instructions from commodity', () => {
    const model = mapToDeliveryOrderViewModel('DELIVERY_ORDER_REPORT_FORMAT_10', {
      entityBound: true,
      commodity: 'Should not become instructions',
      consigneeLines: ['Consignee'],
    });
    expect(model.deliveryInstructions).toBeUndefined();
  });

  it('does not invent VAT from layout vatRate when entityBound', () => {
    const preview = getInvoiceFormatPreview('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');
    if (!preview) return;
    const model = invoiceFormatToInvoicePdfModel(preview, {
      entityBound: true,
      subtotal: '100.00',
      // tax omitted on purpose
      total: '100.00',
      lines: [{ description: 'Line', amount: '100.00' }],
    });
    expect(model.vatAmount).toBe(0);
  });

  it('uses correct original/final pack hints', () => {
    expect(preferredHblHawbPackKeyHint('FG_HBL_ORIGINAL_FORMAT_87')).toBe('hbl_original');
    expect(preferredHblHawbPackKeyHint('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')).toBe(
      'hawb_final',
    );
    expect(getRegistryByCode('FG_HBL_ORIGINAL_FORMAT_87')?.suggestedPackKey).toBe(
      'sea.hbl_original',
    );
    expect(
      getRegistryByCode('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')?.suggestedPackKey,
    ).toBe('air.hawb_final');
  });

  it('purchase invoice enrichment uses purchase family / template type', () => {
    const e = getReportEnrichment('PURCHASE_INVOICE_REPORT_FORMAT_1');
    expect(e?.templateFamily).toBe('purchase_invoice');
    expect(e?.templateType).toBe('invoice.purchase');
    const model = mapToPurchaseInvoiceViewModel(
      'PURCHASE_INVOICE_REPORT_FORMAT_1',
      fixturePurchaseInvoiceBound,
    );
    expect(model.vendorName).toBe('Gulf Trucking LLC');
    expect(model.poReference).toBe('PO-2026-0099');
  });

  it('MAWB template is distinct from HAWB (data-report-template)', () => {
    const mawbHtml = renderToStaticMarkup(
      createElement(MawbTemplateDocument, {
        model: mapToMawbViewModel('MAWB_DRAFT_REPORT_FORMAT', fixtureHawbBound),
      }),
    );
    const hawbHtml = renderToStaticMarkup(
      createElement(HawbTemplateDocument, {
        model: mapToHawbViewModel('HAWB_DRAFT_REPORT_FORMAT_1', fixtureHawbBound),
      }),
    );
    expect(mawbHtml).toContain('data-report-template="mawb.standard"');
    expect(hawbHtml).toContain('data-report-template="hawb.');
    expect(mawbHtml).toContain('Master air waybill');
    expect(mawbHtml).toContain('House shipments on this master');
    expect(hawbHtml).not.toContain('House shipments on this master');
  });

  it('voucher kind resolves payment vs receipt', () => {
    expect(mapToVoucherViewModel('PAYMENT_VOUCHER_REPORT_FORMAT_1').voucherKind).toBe('payment');
    expect(mapToVoucherViewModel('RECEIPT_VOUCHER_REPORT_FORMAT_1').voucherKind).toBe('receipt');
  });
});
