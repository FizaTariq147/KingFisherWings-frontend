import { useMemo } from 'react';
import { useOrganizationProfile } from '@/features/organization/hooks/useOrganizationProfile';
import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';
import { resolveAnyFormatUiLayout } from '../../../data/resolveAnyFormatUiLayout';
import {
  applySharedLayoutChrome,
  SHARED_LAYOUT_CHROME,
  type SharedLayoutChrome,
} from '../../../utils/applySharedLayoutChrome';
import { chromeFromOrganizationProfile } from '../../../utils/resolveReportOrgChrome';
import { mergeInvoiceFormatDemo } from '../../../utils/mergeInvoiceFormatDemo';
import { JsonInvoiceLayoutRenderer } from '../JsonInvoiceLayoutRenderer';

/**
 * Pure layout renderer — safe for off-screen PDF capture (no React Query).
 * Pass `chrome` from resolveReportOrgChrome for registered company name/logo.
 */
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
  const withPaper = {
    ...base,
    paper: preview.paper || base.paper,
    orientation: preview.orientation ?? base.orientation,
    appendCustomerTerms: preview.appendCustomerTerms ?? base.appendCustomerTerms,
  };
  const merged = mergeInvoiceFormatDemo(withPaper, data ?? {});
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

/** On-screen preview — injects registered org name/logo from organization profile. */
export function InvoiceFormatLayoutByKindLive({
  preview,
  data,
}: {
  preview: InvoiceFormatPreview;
  data?: InvoiceFormatPdfData;
}) {
  const { data: orgProfile } = useOrganizationProfile();
  const chrome = useMemo(
    () => chromeFromOrganizationProfile(orgProfile ?? null),
    [orgProfile],
  );
  return <InvoiceFormatLayoutByKind preview={preview} data={data} chrome={chrome} />;
}
