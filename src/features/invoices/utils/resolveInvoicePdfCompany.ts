import { BRAND_LOGO_API } from '@/features/branding/api/brandLogo.api';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import { organizationService } from '@/features/organization/services/organization.service';
import {
  toApiRelativeLogoUrl,
} from '@/features/organization/utils/embedOrganizationPdfLogo';
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
  // Rewrite API /files/… URLs for local proxy; keep absolute CDN URLs intact.
  const profileLogo =
    profile?.logo_url ||
    (profile as { logoUrl?: string } | null | undefined)?.logoUrl ||
    '';
  const logoRaw =
    toApiRelativeLogoUrl(profileLogo) || String(profileLogo).trim();

  const street = profile?.address?.trim() || '';
  const cityCountry = [profile?.city?.trim(), profile?.country_code?.trim()]
    .filter(Boolean)
    .join(', ');
  const addressLines = [street, cityCountry].filter(Boolean);

  return {
    name: name || undefined,
    addressLines: addressLines.length ? addressLines : undefined,
    phone: profile?.phone?.trim() || undefined,
    email: profile?.email?.trim() || undefined,
    website: web || undefined,
    // Prefer profile.logo_url; fall back to GET /organization/logo binary path.
    logoUrl:
      resolveReportLogoUrl(logoRaw) || BRAND_LOGO_API.organizationLogo,
    tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
  };
}

/**
 * Prefer a fresh GET /organization/profile so PDF logo/name match Settings → Organization.
 * Falls back to the cached React Query profile when the request fails.
 */
export async function resolveInvoicePdfCompanyAsync(opts: {
  profile?: OrganizationProfile | null;
  companyName?: string | null;
}): Promise<InvoicePdfCompany> {
  let profile = opts.profile ?? null;
  try {
    profile = await organizationService.getProfile();
  } catch {
    /* keep cached */
  }
  return resolveInvoicePdfCompany({
    profile,
    companyName: opts.companyName,
  });
}
