import { DEFAULT_PDF_BRANDING } from '../constants/invoicePreviewBranding';
import { REPORT_BRANDING } from '../constants/reportBranding.constants';
import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { applyPriorityFresaParity } from './applyPriorityFresaParity';

export type SharedLayoutChrome = {
  company: string;
  address: string;
  web: string;
  phone?: string;
  email?: string;
  footerLine?: string;
  /** Registered org logo URL; falls back to KF default asset in the renderer. */
  logoUrl?: string;
};

/** Default KingFisher chrome — same across all catalogue formats. */
export const SHARED_LAYOUT_CHROME: SharedLayoutChrome = {
  company: DEFAULT_PDF_BRANDING.companyName,
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'inquiry@kingfishertec.com',
  footerLine: DEFAULT_PDF_BRANDING.footerLine,
  logoUrl: REPORT_BRANDING.defaultLogoUrl || undefined,
};

/**
 * Runtime override: registered company name / logo (or KF defaults).
 * Restores Fresa sample theme colors (same navy/orange/red/cyan as Fresa PDFs).
 * Body blocks + demo/dummy field data stay as in the Fresa sample JSON.
 * Header/footer chrome is always tenant/KF-branded — never Fresa company identity.
 */
export function applySharedLayoutChrome(
  layout: InvoiceFormatUiLayout,
  chrome: SharedLayoutChrome = SHARED_LAYOUT_CHROME,
): InvoiceFormatUiLayout {
  const withParity = applyPriorityFresaParity(layout);
  return {
    ...withParity,
    branding: {
      company: chrome.company || SHARED_LAYOUT_CHROME.company,
      address: chrome.address || SHARED_LAYOUT_CHROME.address,
      web: chrome.web || SHARED_LAYOUT_CHROME.web,
      phone: chrome.phone || SHARED_LAYOUT_CHROME.phone,
      email: chrome.email || SHARED_LAYOUT_CHROME.email,
      logo: REPORT_BRANDING.layoutLogoToken,
      logoUrl: chrome.logoUrl?.trim() || SHARED_LAYOUT_CHROME.logoUrl,
    },
  };
}
