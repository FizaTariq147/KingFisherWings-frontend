import { organizationService } from '@/features/organization/services/organization.service';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import { REPORT_BRANDING, resolveReportLogoUrl } from '../constants/reportBranding.constants';
import {
  SHARED_LAYOUT_CHROME,
  type SharedLayoutChrome,
} from './applySharedLayoutChrome';

/**
 * Org chrome for catalogue / pack reports.
 * Company identity comes from GET /organization/profile; layout/colors stay Fresa-parity.
 */
export type ReportOrgChrome = SharedLayoutChrome & {
  logoUrl: string;
  /** Raw profile fields for backend pack injection. */
  packFields: Partial<Record<(typeof REPORT_BRANDING.orgFields)[number], string>>;
};

function defaultLogoUrl(): string {
  return REPORT_BRANDING.defaultLogoUrl || '/kingfisher-logo.png';
}

function buildAddress(profile: OrganizationProfile): string {
  const parts = [profile.address?.trim(), profile.city?.trim(), profile.country_code?.trim()].filter(
    Boolean,
  );
  if (parts.length) return parts.join(', ');
  return SHARED_LAYOUT_CHROME.address;
}

function profileToChrome(profile: OrganizationProfile): ReportOrgChrome {
  const company =
    profile.display_name?.trim() || profile.name?.trim() || SHARED_LAYOUT_CHROME.company;
  const logoUrl = resolveReportLogoUrl(profile.logo_url) || defaultLogoUrl();
  const website = profile.website?.trim();
  const web = website
    ? website.replace(/^https?:\/\//i, '').replace(/\/$/, '')
    : SHARED_LAYOUT_CHROME.web;

  return {
    company,
    address: buildAddress(profile),
    web,
    phone: profile.phone?.trim() || SHARED_LAYOUT_CHROME.phone,
    email: profile.email?.trim() || SHARED_LAYOUT_CHROME.email,
    footerLine: SHARED_LAYOUT_CHROME.footerLine,
    logoUrl,
    packFields: {
      legal_name: profile.name?.trim() || company,
      trade_name: profile.display_name?.trim() || company,
      address: buildAddress(profile),
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
      logoUrl: defaultLogoUrl(),
      packFields: {
        legal_name: SHARED_LAYOUT_CHROME.company,
        trade_name: SHARED_LAYOUT_CHROME.company,
        address: SHARED_LAYOUT_CHROME.address,
        phone: SHARED_LAYOUT_CHROME.phone,
        email: SHARED_LAYOUT_CHROME.email,
        web: SHARED_LAYOUT_CHROME.web,
      },
    };
  }
  return profileToChrome(profile);
}

/**
 * Async resolve for off-screen PDF capture / pack generate (no React Query).
 * Falls back to KingFisher defaults when org profile is unavailable.
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
      logo_url: chrome.logoUrl,
    },
  };
}
