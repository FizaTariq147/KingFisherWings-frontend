import { organizationService } from '@/features/organization/services/organization.service';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import { REPORT_BRANDING, resolveReportLogoUrl } from '../constants/reportBranding.constants';
import {
  SHARED_LAYOUT_CHROME,
  type SharedLayoutChrome,
} from './applySharedLayoutChrome';

/**
 * Org chrome for catalogue / pack reports.
 * Company identity comes from GET /organization/profile only.
 * Missing fields stay empty — never invent address/phone/email/logo.
 */
export type ReportOrgChrome = SharedLayoutChrome & {
  logoUrl: string;
  /** True when GET /organization/profile succeeded. */
  profileLoaded: boolean;
  /** Raw profile fields for backend pack injection. */
  packFields: Partial<Record<(typeof REPORT_BRANDING.orgFields)[number], string>>;
};

function buildAddress(profile: OrganizationProfile): string {
  const parts = [profile.address?.trim(), profile.city?.trim(), profile.country_code?.trim()].filter(
    Boolean,
  );
  return parts.join(', ');
}

function profileToChrome(profile: OrganizationProfile): ReportOrgChrome {
  const company = profile.display_name?.trim() || profile.name?.trim() || '';
  const logoUrl = resolveReportLogoUrl(profile.logo_url) || '';
  const website = profile.website?.trim() || '';
  const web = website ? website.replace(/^https?:\/\//i, '').replace(/\/$/, '') : '';

  return {
    company,
    address: buildAddress(profile),
    web,
    phone: profile.phone?.trim() || '',
    email: profile.email?.trim() || '',
    footerLine: company ? `${company}` : '',
    logoUrl,
    profileLoaded: true,
    packFields: {
      legal_name: profile.name?.trim() || company || undefined,
      trade_name: profile.display_name?.trim() || company || undefined,
      address: buildAddress(profile) || undefined,
      phone: profile.phone?.trim() || undefined,
      email: profile.email?.trim() || undefined,
      web: website || undefined,
      tax_id: profile.vat_number?.trim() || undefined,
      vat_number: profile.vat_number?.trim() || undefined,
      logo_url: profile.logo_url?.trim() || undefined,
    },
  };
}

export function chromeFromOrganizationProfile(
  profile: OrganizationProfile | null | undefined,
): ReportOrgChrome {
  if (!profile) {
    return {
      ...SHARED_LAYOUT_CHROME,
      logoUrl: '',
      profileLoaded: false,
      packFields: {},
    };
  }
  return profileToChrome(profile);
}

/**
 * Async resolve for off-screen PDF capture / pack generate (no React Query).
 * Falls back to empty chrome when org profile is unavailable (documented gap).
 */
export async function resolveReportOrgChrome(): Promise<ReportOrgChrome> {
  try {
    const profile = await organizationService.getProfile();
    return chromeFromOrganizationProfile(profile);
  } catch {
    return chromeFromOrganizationProfile(null);
  }
}

/** Flatten org fields into generate `parameters` for backend Puppeteer packs. */
export function orgChromeToPackParameters(chrome: ReportOrgChrome): Record<string, unknown> {
  const organization: Record<string, string> = {};
  for (const [key, value] of Object.entries(chrome.packFields)) {
    if (value != null && String(value).trim()) organization[key] = String(value).trim();
  }
  if (chrome.logoUrl) organization.logo_url = organization.logo_url || chrome.logoUrl;
  return {
    organization,
    branding: {
      company: chrome.company,
      address: chrome.address,
      web: chrome.web,
      phone: chrome.phone,
      email: chrome.email,
      logo_url: chrome.logoUrl || undefined,
    },
  };
}
