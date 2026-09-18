import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';
import { resolveAnyFormatUiLayout } from '../../../data/resolveAnyFormatUiLayout';
import { mergeInvoiceFormatDemo } from '../../../utils/mergeInvoiceFormatDemo';
import { JsonInvoiceLayoutRenderer } from '../JsonInvoiceLayoutRenderer';

/** Render format layouts from permanent JSON stores (+ optional live data). */
export function InvoiceFormatLayoutByKind({
  preview,
  data,
}: {
  preview: InvoiceFormatPreview;
  data?: InvoiceFormatPdfData;
}) {
  const base = resolveAnyFormatUiLayout(preview.code);
  if (!base) return null;
  const layout = data ? mergeInvoiceFormatDemo(base, data) : mergeInvoiceFormatDemo(base, {});
  return <JsonInvoiceLayoutRenderer layout={layout} />;
}
