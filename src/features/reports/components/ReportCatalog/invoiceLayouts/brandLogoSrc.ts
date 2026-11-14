import type { InvoiceFormatUiBranding } from '../../../types/invoiceFormatUiLayout.types';

/**
 * Registered organization logo URL only.
 * Empty string when unavailable — callers must omit <img> rather than invent a logo.
 */
export function brandLogoSrc(branding: InvoiceFormatUiBranding): string {
  return branding.logoUrl?.trim() || '';
}
