import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';
import { resolveAnyFormatUiLayout } from '../../../data/resolveAnyFormatUiLayout';
import {
  applySharedLayoutChrome,
  SHARED_LAYOUT_CHROME,
  type SharedLayoutChrome,
} from '../../../utils/applySharedLayoutChrome';
import { mergeInvoiceFormatDemo } from '../../../utils/mergeInvoiceFormatDemo';
import { JsonInvoiceLayoutRenderer } from '../JsonInvoiceLayoutRenderer';

/** Render format layouts from permanent JSON stores (+ optional live data). */
export function InvoiceFormatLayoutByKind({
  preview,
  data,
  chrome,
}: {
  preview: InvoiceFormatPreview;
  data?: InvoiceFormatPdfData;
  /** Optional tenant chrome; defaults to shared KingFisher branding. */
  chrome?: SharedLayoutChrome;
}) {
  const base = resolveAnyFormatUiLayout(preview.code);
  if (!base) return null;
  const merged = mergeInvoiceFormatDemo(base, data ?? {});
  // One shared chrome for all formats — live companyName from data wins when present.
  const resolvedChrome: SharedLayoutChrome = chrome ?? {
    ...SHARED_LAYOUT_CHROME,
    company: data?.companyName?.trim() || SHARED_LAYOUT_CHROME.company,
    address: data?.companyAddress?.trim() || SHARED_LAYOUT_CHROME.address,
    web: data?.companyWeb?.trim() || SHARED_LAYOUT_CHROME.web,
    phone: data?.companyPhone?.trim() || SHARED_LAYOUT_CHROME.phone,
    email: data?.companyEmail?.trim() || SHARED_LAYOUT_CHROME.email,
  };
  const layout = applySharedLayoutChrome(merged, resolvedChrome);
  return <JsonInvoiceLayoutRenderer layout={layout} />;
}
