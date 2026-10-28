import logoAsset from '@/assets/logo.png';
import { organizationService } from '@/features/organization/services/organization.service';

export type CustomerTermsBranding = {
  /** Same asset Page 1 report layouts use (`@/assets/logo.png`). */
  logoUrl: string;
  /** Company name for the T&C footer — from organization profile when available. */
  companyName: string;
};

const FALLBACK_COMPANY = 'KingFisher Wings Group';

function page1LogoUrl(): string {
  if (typeof logoAsset === 'string' && logoAsset.trim()) return logoAsset;
  return '/kingfisher-logo.png';
}

/**
 * Branding for appended Terms & Conditions pages only.
 * Logo matches Page 1; company name comes from GET /organization/profile.
 */
export async function resolveCustomerTermsBranding(): Promise<CustomerTermsBranding> {
  let companyName = FALLBACK_COMPANY;
  try {
    const profile = await organizationService.getProfile();
    const fromBackend =
      profile.display_name?.trim() ||
      profile.name?.trim() ||
      '';
    if (fromBackend) companyName = fromBackend;
  } catch {
    /* keep fallback — preview must still work offline */
  }

  return {
    logoUrl: page1LogoUrl(),
    companyName,
  };
}
