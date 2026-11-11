import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getReportEnrichment } from '../registry';
import {
  mapToHawbViewModel,
  mapToInvoiceDocViewModel,
  mapToMawbViewModel,
  mapToPurchaseInvoiceViewModel,
  mapToQuotationDocViewModel,
  mapToVoucherViewModel,
} from '../mappings';
import { HawbTemplateDocument } from '../templates/hawb';
import { MawbTemplateDocument } from '../templates/mawb';
import { InvoiceTemplateDocument } from '../templates/invoice/InvoiceTemplateDocument';
import { PurchaseInvoiceTemplateDocument } from '../templates/invoice/PurchaseInvoiceTemplateDocument';
import { QuotationTemplateDocument } from '../templates/quotation/QuotationTemplateDocument';
import { VoucherTemplateDocument } from '../templates/voucher/VoucherTemplateDocument';
import { ArrivalNoticeTemplateDocument } from '../templates/arrivalNotice/ArrivalNoticeTemplateDocument';
import { DeliveryOrderTemplateDocument } from '../templates/deliveryOrder/DeliveryOrderTemplateDocument';
import { ManifestTemplateDocument } from '../templates/manifest/ManifestTemplateDocument';
import { OpsListTemplateDocument } from '../templates/opsList/OpsListTemplateDocument';
import { LedgerTemplateDocument } from '../templates/ledger/LedgerTemplateDocument';
import { FinancialStatementTemplateDocument } from '../templates/financialStatement/FinancialStatementTemplateDocument';
import { HblTemplateDocument } from '../templates/hbl';
import {
  mapToArrivalNoticeViewModel,
  mapToDeliveryOrderViewModel,
  mapToHblViewModel,
  mapToLedgerViewModel,
  mapToManifestViewModel,
  mapToOpsListViewModel,
} from '../mappings';
import { FIXTURE_BY_REPORT } from './fixtures/sanitizedCatalogPdfFixtures';
import { buildArrivalNoticePrintHtml } from '../engines/pdf/printCssPilot';
import { supportsTemplateV2 } from '../engines/preview/renderTemplateV2Pdf';

function markupFor(code: string): string {
  const data = FIXTURE_BY_REPORT[code];
  expect(data, `fixture for ${code}`).toBeTruthy();
  const family = getReportEnrichment(code)?.templateFamily;
  expect(family, `enrichment for ${code}`).toBeTruthy();
  expect(supportsTemplateV2(code)).toBe(true);

  switch (family) {
    case 'hbl':
      return renderToStaticMarkup(
        createElement(HblTemplateDocument, { model: mapToHblViewModel(code, data) }),
      );
    case 'hawb':
      return renderToStaticMarkup(
        createElement(HawbTemplateDocument, { model: mapToHawbViewModel(code, data) }),
      );
    case 'mawb':
      return renderToStaticMarkup(
        createElement(MawbTemplateDocument, { model: mapToMawbViewModel(code, data) }),
      );
    case 'invoice':
      return renderToStaticMarkup(
        createElement(InvoiceTemplateDocument, {
          model: mapToInvoiceDocViewModel(code, data),
        }),
      );
    case 'purchase_invoice':
      return renderToStaticMarkup(
        createElement(PurchaseInvoiceTemplateDocument, {
          model: mapToPurchaseInvoiceViewModel(code, data),
        }),
      );
    case 'quotation':
      return renderToStaticMarkup(
        createElement(QuotationTemplateDocument, {
          model: mapToQuotationDocViewModel(code, data),
        }),
      );
    case 'arrival_notice':
      return renderToStaticMarkup(
        createElement(ArrivalNoticeTemplateDocument, {
          model: mapToArrivalNoticeViewModel(code, data),
        }),
      );
    case 'delivery_order':
      return renderToStaticMarkup(
        createElement(DeliveryOrderTemplateDocument, {
          model: mapToDeliveryOrderViewModel(code, data),
        }),
      );
    case 'cargo_manifest':
      return renderToStaticMarkup(
        createElement(ManifestTemplateDocument, {
          model: mapToManifestViewModel(code, data),
        }),
      );
    case 'voucher':
      return renderToStaticMarkup(
        createElement(VoucherTemplateDocument, {
          model: mapToVoucherViewModel(code, data),
        }),
      );
    case 'ledger':
      return renderToStaticMarkup(
        createElement(LedgerTemplateDocument, {
          model: mapToLedgerViewModel(code, data),
        }),
      );
    case 'financial_statement':
      return renderToStaticMarkup(
        createElement(FinancialStatementTemplateDocument, {
          model: mapToLedgerViewModel(code, data),
        }),
      );
    case 'ops_list':
      return renderToStaticMarkup(
        createElement(OpsListTemplateDocument, {
          model: mapToOpsListViewModel(code, data),
        }),
      );
    default:
      throw new Error(`Unhandled family ${family} for ${code}`);
  }
}

describe('Phase 7 document fidelity (static markup)', () => {
  it('keeps MAWB structurally distinct from HAWB', () => {
    const mawb = markupFor('MAWB_DRAFT_REPORT_FORMAT');
    const hawb = markupFor('HAWB_DRAFT_REPORT_FORMAT_1');
    expect(mawb).toContain('data-report-template="mawb.standard"');
    expect(hawb).toMatch(/data-report-template="hawb\./);
    expect(mawb).toContain('MAWB NUMBER');
    expect(mawb).toContain('Issuing carrier');
    expect(hawb).toContain('AIR WAYBILL NO');
  });

  it('purchase invoice is AP vendor face, not commercial bill-to', () => {
    const purchase = markupFor('PURCHASE_INVOICE_REPORT_FORMAT_1');
    const commercial = markupFor('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');
    expect(purchase).toContain('data-report-template="purchase_invoice.ap"');
    expect(purchase).toContain('Vendor (bill from)');
    expect(purchase).toContain('ACCOUNTS PAYABLE');
    expect(commercial).toContain('data-report-template="invoice.commercial"');
    expect(commercial).toContain('Bill to');
    expect(purchase).not.toContain('Bill to');
  });

  it('quotation uses offer / validity chrome', () => {
    const html = markupFor('QUOTATION_REPORT_FORMAT_1');
    expect(html).toContain('data-report-template="quotation.offer"');
    expect(html).toContain('VALID UNTIL');
    expect(html).toContain('Quoted charges (indicative)');
    expect(html).toContain('not a tax invoice');
  });

  it('payment and receipt vouchers use Dr/Cr entry faces', () => {
    const pay = markupFor('PAYMENT_VOUCHER_REPORT_FORMAT_1');
    const rec = markupFor('RECEIPT_VOUCHER_REPORT_FORMAT_1');
    expect(pay).toContain('data-report-template="voucher.payment"');
    expect(rec).toContain('data-report-template="voucher.receipt"');
    expect(pay).toContain('PAYMENT VOUCHER');
    expect(rec).toContain('RECEIPT VOUCHER');
    expect(pay).toContain('Accounting entries');
    expect(pay).toContain('Debit');
  });

  it('renders remaining fixture families with expected template markers', () => {
    expect(markupFor('HBL_DRAFT_REPORT_FORMAT_11')).toContain('data-report-template="hbl.');
    expect(markupFor('ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER')).toContain(
      'data-report-template="arrival_notice.standard"',
    );
    expect(markupFor('DELIVERY_ORDER_REPORT_FORMAT_10')).toContain(
      'AUTHORIZATION TO RELEASE CARGO',
    );
    expect(markupFor('CARGO_MANIFEST_REPORT_FORMAT')).toContain(
      'data-report-template="cargo_manifest.dense"',
    );
    expect(markupFor('STATEMENT_OF_ACCOUNTS_REPORT_FORMAT')).toContain('Account ledger');
    expect(markupFor('PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE')).toContain(
      'Financial statement',
    );
    expect(markupFor('DAILY_STATUS_REPORT_FORMAT_1')).toContain(
      'data-report-template="ops_list.dense"',
    );
  });

  it('Arrival Notice print-CSS pilot HTML includes A4 page + repeating thead', () => {
    const model = mapToArrivalNoticeViewModel(
      'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
      FIXTURE_BY_REPORT.ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER,
    );
    const html = buildArrivalNoticePrintHtml(model);
    expect(html).toContain('@page { size: A4 portrait');
    expect(html).toContain('thead { display: table-header-group; }');
    expect(html).toContain('an-pilot-footer');
  });
});
