import logo from '@/assets/logo.png';
import { REPORT_BRANDING } from '../../../constants/reportBranding.constants';
import type { InvoiceFormatUiBranding } from '../../../types/invoiceFormatUiLayout.types';

/** Registered org logo when present; otherwise KF default asset. */
export function brandLogoSrc(branding: InvoiceFormatUiBranding): string {
  const fromOrg = branding.logoUrl?.trim();
  if (fromOrg) return fromOrg;
  if (typeof logo === 'string' && logo.trim()) return logo;
  return REPORT_BRANDING.defaultLogoUrl || '/kingfisher-logo.png';
}
