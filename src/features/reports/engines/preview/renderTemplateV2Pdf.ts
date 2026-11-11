import { createElement } from 'react';
import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import { getReportEnrichment } from '../../registry';
import {
  mapToArrivalNoticeViewModel,
  mapToDeliveryOrderViewModel,
  mapToHawbViewModel,
  mapToHblViewModel,
  mapToInvoiceDocViewModel,
  mapToLedgerViewModel,
  mapToManifestViewModel,
  mapToMawbViewModel,
  mapToOpsListViewModel,
  mapToPurchaseInvoiceViewModel,
  mapToQuotationDocViewModel,
  mapToVoucherViewModel,
} from '../../mappings';
import { HblTemplateDocument } from '../../templates/hbl';
import { HawbTemplateDocument } from '../../templates/hawb';
import { MawbTemplateDocument } from '../../templates/mawb';
import { InvoiceTemplateDocument } from '../../templates/invoice/InvoiceTemplateDocument';
import { PurchaseInvoiceTemplateDocument } from '../../templates/invoice/PurchaseInvoiceTemplateDocument';
import { ArrivalNoticeTemplateDocument } from '../../templates/arrivalNotice/ArrivalNoticeTemplateDocument';
import { DeliveryOrderTemplateDocument } from '../../templates/deliveryOrder/DeliveryOrderTemplateDocument';
import { ManifestTemplateDocument } from '../../templates/manifest/ManifestTemplateDocument';
import { VoucherTemplateDocument } from '../../templates/voucher/VoucherTemplateDocument';
import { LedgerTemplateDocument } from '../../templates/ledger/LedgerTemplateDocument';
import { FinancialStatementTemplateDocument } from '../../templates/financialStatement/FinancialStatementTemplateDocument';
import { OpsListTemplateDocument } from '../../templates/opsList/OpsListTemplateDocument';
import { QuotationTemplateDocument } from '../../templates/quotation/QuotationTemplateDocument';
import { captureReactDocumentPdf } from '../pdf/captureReactDocumentPdf';

export function supportsTemplateV2(code: string): boolean {
  const family = getReportEnrichment(code)?.templateFamily;
  if (!family) return false;
  return (
    family === 'hbl' ||
    family === 'hawb' ||
    family === 'mawb' ||
    family === 'invoice' ||
    family === 'purchase_invoice' ||
    family === 'arrival_notice' ||
    family === 'delivery_order' ||
    family === 'cargo_manifest' ||
    family === 'voucher' ||
    family === 'ledger' ||
    family === 'financial_statement' ||
    family === 'ops_list' ||
    family === 'quotation'
  );
}

/**
 * Render specialized template-v2 React document to PDF.
 * Returns null when family is unsupported (caller falls back to legacy JSON).
 */
export async function renderTemplateV2Pdf(
  code: string,
  data: InvoiceFormatPdfData = {},
  options: { logoUrl?: string; formatName?: string } = {},
): Promise<Blob | null> {
  const enrichment = getReportEnrichment(code);
  if (!enrichment) return null;
  const logoUrl = options.logoUrl;
  const formatName = options.formatName;

  switch (enrichment.templateFamily) {
    case 'hbl': {
      const model = mapToHblViewModel(code, data, logoUrl);
      return captureReactDocumentPdf(createElement(HblTemplateDocument, { model }));
    }
    case 'hawb': {
      const model = mapToHawbViewModel(code, data, logoUrl);
      return captureReactDocumentPdf(createElement(HawbTemplateDocument, { model }));
    }
    case 'mawb': {
      const model = mapToMawbViewModel(code, data, logoUrl);
      return captureReactDocumentPdf(createElement(MawbTemplateDocument, { model }));
    }
    case 'invoice': {
      const model = mapToInvoiceDocViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(createElement(InvoiceTemplateDocument, { model }));
    }
    case 'purchase_invoice': {
      const model = mapToPurchaseInvoiceViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(createElement(PurchaseInvoiceTemplateDocument, { model }));
    }
    case 'arrival_notice': {
      const model = mapToArrivalNoticeViewModel(code, data, logoUrl);
      return captureReactDocumentPdf(createElement(ArrivalNoticeTemplateDocument, { model }));
    }
    case 'delivery_order': {
      const model = mapToDeliveryOrderViewModel(code, data, logoUrl);
      return captureReactDocumentPdf(createElement(DeliveryOrderTemplateDocument, { model }));
    }
    case 'cargo_manifest': {
      const model = mapToManifestViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(createElement(ManifestTemplateDocument, { model }), {
        landscape: true,
      });
    }
    case 'voucher': {
      const model = mapToVoucherViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(createElement(VoucherTemplateDocument, { model }));
    }
    case 'ledger': {
      const model = mapToLedgerViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(createElement(LedgerTemplateDocument, { model }));
    }
    case 'financial_statement': {
      const model = mapToLedgerViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(
        createElement(FinancialStatementTemplateDocument, { model }),
      );
    }
    case 'ops_list': {
      const model = mapToOpsListViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(createElement(OpsListTemplateDocument, { model }), {
        landscape: true,
      });
    }
    case 'quotation': {
      const model = mapToQuotationDocViewModel(code, data, logoUrl, formatName);
      return captureReactDocumentPdf(createElement(QuotationTemplateDocument, { model }));
    }
    default:
      return null;
  }
}
