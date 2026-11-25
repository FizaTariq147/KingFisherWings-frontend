import type { InvoiceFormatUiBranding } from '../../../types/invoiceFormatUiLayout.types';
import {
  resolveCommercialPdfLogoUrl,
  resolveReportLogoUrl,
} from '../../../constants/reportBranding.constants';

/**
 * Logo URL for report headers.
 * Prefer registered org logo; fall back to bundled commercial logo so every
 * JSON/html2canvas report still paints a Fresa-left header mark.
 */
export function brandLogoSrc(branding: InvoiceFormatUiBranding): string {
  const fromOrg = resolveReportLogoUrl(branding.logoUrl) || branding.logoUrl?.trim() || '';
  if (fromOrg) return absolutizeLogoUrl(fromOrg);
  const fallback = resolveCommercialPdfLogoUrl() || '';
  return fallback ? absolutizeLogoUrl(fallback) : '';
}

/** html2canvas / <img> need an absolute URL for same-origin assets and /files/*. */
function absolutizeLogoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(data:|blob:|https?:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/') && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${trimmed}`;
  }
  return trimmed;
}
