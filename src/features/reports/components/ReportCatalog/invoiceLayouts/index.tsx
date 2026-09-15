import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';
import { getInvoiceFormatUiLayout } from '../../../data/invoiceFormatUiLayouts';
import { getAccountsFormatUiLayout } from '../../../data/accountsFormatUiLayouts';
import { mergeInvoiceFormatDemo } from '../../../utils/mergeInvoiceFormatDemo';
import { JsonInvoiceLayoutRenderer } from '../JsonInvoiceLayoutRenderer';

/** Render Invoice / Accounts format layouts from permanent JSON (+ optional live data). */
export function InvoiceFormatLayoutByKind({
  preview,
  data,
}: {
  preview: InvoiceFormatPreview;
  data?: InvoiceFormatPdfData;
}) {
  const base = getInvoiceFormatUiLayout(preview.code) ?? getAccountsFormatUiLayout(preview.code);
  if (!base) return null;
  const layout = data ? mergeInvoiceFormatDemo(base, data) : mergeInvoiceFormatDemo(base, {});
  return <JsonInvoiceLayoutRenderer layout={layout} />;
}
