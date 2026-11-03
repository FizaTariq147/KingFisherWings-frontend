import { DEFAULT_PDF_BRANDING } from '../constants/invoicePreviewBranding';
import { normalizeFresaThemeColors } from '../constants/fresaInvoiceColors';
import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

export type SharedLayoutChrome = {
  company: string;
  address: string;
  web: string;
  phone?: string;
  email?: string;
  footerLine?: string;
};

/** Default KingFisher chrome — same across all catalogue formats. */
export const SHARED_LAYOUT_CHROME: SharedLayoutChrome = {
  company: DEFAULT_PDF_BRANDING.companyName,
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'inquiry@kingfishertec.com',
  footerLine: DEFAULT_PDF_BRANDING.footerLine,
};

/**
 * Runtime override: KingFisher logo / company text only.
 * Restores Fresa sample theme colors (same navy/orange/red/cyan as Fresa PDFs).
 * Body blocks + demo/dummy field data stay as in the Fresa sample JSON.
 * Header/footer chrome is always KF-branded — never Fresa company identity.
 */
export function applySharedLayoutChrome(
  layout: InvoiceFormatUiLayout,
  chrome: SharedLayoutChrome = SHARED_LAYOUT_CHROME,
): InvoiceFormatUiLayout {
  return {
    ...layout,
    theme: normalizeFresaThemeColors(layout.theme),
    branding: {
      company: chrome.company || SHARED_LAYOUT_CHROME.company,
      address: chrome.address || SHARED_LAYOUT_CHROME.address,
      web: chrome.web || SHARED_LAYOUT_CHROME.web,
      phone: chrome.phone || SHARED_LAYOUT_CHROME.phone,
      email: chrome.email || SHARED_LAYOUT_CHROME.email,
      logo: 'kingfisher',
    },
  };
}
