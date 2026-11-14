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
  /** Registered org logo URL only — empty when unavailable. */
  logoUrl?: string;
};

/**
 * Empty chrome — used when organization profile is unavailable.
 * Do not invent company name, address, phone, email, or logo.
 */
export const SHARED_LAYOUT_CHROME: SharedLayoutChrome = {
  company: '',
  address: '',
  web: '',
  phone: '',
  email: '',
  footerLine: '',
  logoUrl: undefined,
};

/**
 * Runtime override: registered company name / logo from organization profile.
 * Restores Fresa sample theme colors (layout/colors stay Fresa-parity).
 * Header/footer chrome is tenant-branded when profile data exists — never Fresa identity,
 * and never fabricated KingFisher contact details when the profile is empty.
 */
export function applySharedLayoutChrome(
  layout: InvoiceFormatUiLayout,
  chrome: SharedLayoutChrome = SHARED_LAYOUT_CHROME,
): InvoiceFormatUiLayout {
  const withParity = applyPriorityFresaParity(layout);
  const company = (chrome.company || '').trim();
  const address = (chrome.address || '').trim();
  const web = (chrome.web || '').trim();
  const phone = (chrome.phone || '').trim() || undefined;
  const email = (chrome.email || '').trim() || undefined;
  const logoUrl = chrome.logoUrl?.trim() || undefined;

  return {
    ...withParity,
    branding: {
      company,
      address,
      web,
      phone,
      email,
      logo: REPORT_BRANDING.layoutLogoToken,
      logoUrl,
    },
  };
}
