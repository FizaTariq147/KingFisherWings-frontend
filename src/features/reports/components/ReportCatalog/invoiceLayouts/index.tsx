import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';
import { getInvoiceFormatUiLayout } from '../../../data/invoiceFormatUiLayouts';
import { getAccountsFormatUiLayout } from '../../../data/accountsFormatUiLayouts';
import { getWmsFormatUiLayout } from '../../../data/wmsFormatUiLayouts';
import { getArrivalNoticeFormatUiLayout } from '../../../data/arrivalNoticeFormatUiLayouts';
import { getDeliveryOrderFormatUiLayout } from '../../../data/deliveryOrderFormatUiLayouts';
import { getHawbFormatUiLayout } from '../../../data/hawbFormatUiLayouts';
import { getHblFormatUiLayout } from '../../../data/hblFormatUiLayouts';
import { getOtherReportsFormatUiLayout } from '../../../data/otherReportsFormatUiLayouts';
import { mergeInvoiceFormatDemo } from '../../../utils/mergeInvoiceFormatDemo';
import { JsonInvoiceLayoutRenderer } from '../JsonInvoiceLayoutRenderer';

/** Render Invoice / Accounts / WMS / Arrival / Delivery Order / Other layouts from permanent JSON (+ optional live data). */
export function InvoiceFormatLayoutByKind({
  preview,
  data,
}: {
  preview: InvoiceFormatPreview;
  data?: InvoiceFormatPdfData;
}) {
  const base =
    getInvoiceFormatUiLayout(preview.code) ??
    getAccountsFormatUiLayout(preview.code) ??
    getWmsFormatUiLayout(preview.code) ??
    getArrivalNoticeFormatUiLayout(preview.code) ??
    getDeliveryOrderFormatUiLayout(preview.code) ??
    getHawbFormatUiLayout(preview.code) ??
    getHblFormatUiLayout(preview.code) ??
    getOtherReportsFormatUiLayout(preview.code);
  if (!base) return null;
  const layout = data ? mergeInvoiceFormatDemo(base, data) : mergeInvoiceFormatDemo(base, {});
  return <JsonInvoiceLayoutRenderer layout={layout} />;
}
