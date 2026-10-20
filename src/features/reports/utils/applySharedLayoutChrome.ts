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
 * Restores Fresa sample theme colors when JSON themes were remapped to T&C navy.
 * Body blocks / field schemas stay as in the Fresa sample JSON.
 */
export function applySharedLayoutChrome(
  layout: InvoiceFormatUiLayout,
  chrome: SharedLayoutChrome = SHARED_LAYOUT_CHROME,
): InvoiceFormatUiLayout {
  return {
    ...layout,
    theme: normalizeFresaThemeColors(layout.theme),
    branding: {
      company: chrome.company,
      address: chrome.address,
      web: chrome.web,
      phone: chrome.phone,
      email: chrome.email,
      logo: 'kingfisher',
    },
  };
}
