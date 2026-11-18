import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import { resolveReportLogoUrl } from '@/features/reports/constants/reportBranding.constants';
import type { InvoicePdfCompany } from './generateInvoicePdf';

/**
 * Map organization profile (+ optional company name override) into the classic
 * tax-invoice PDF company chrome — dynamic logo / name / phone / email / web.
 */
export function resolveInvoicePdfCompany(opts: {
  profile?: OrganizationProfile | null;
  /** Invoice.company_id match or tenant company display name. */
  companyName?: string | null;
}): InvoicePdfCompany {
  const profile = opts.profile;
  const name =
    String(opts.companyName ?? '').trim() ||
    profile?.display_name?.trim() ||
    profile?.name?.trim() ||
    '';
  const website = profile?.website?.trim() || '';
  const web = website
    ? website.replace(/^https?:\/\//i, '').replace(/\/$/, '')
    : '';

  return {
    name: name || undefined,
    phone: profile?.phone?.trim() || undefined,
    email: profile?.email?.trim() || undefined,
    website: web || undefined,
    logoUrl: resolveReportLogoUrl(profile?.logo_url) || undefined,
    tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
  };
}
