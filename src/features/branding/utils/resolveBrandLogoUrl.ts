import { DEFAULT_BRAND_LOGO_URL } from '../constants/brandLogo.constants';

function firstHttpUrl(...candidates: Array<string | null | undefined>): string | undefined {
  for (const raw of candidates) {
    const url = String(raw ?? '').trim();
    if (!url) continue;
    if (/^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('data:')) {
      return url;
    }
  }
  return undefined;
}

/**
 * Resolve brand logo for chrome / login / reports.
 * Prefer tenant/org/auth URL; never throw — always fall back to assets/logo.png.
 */
export function resolveBrandLogoUrl(opts?: {
  logoUrl?: string | null;
  tenantLogoUrl?: string | null;
  organizationLogoUrl?: string | null;
  authLogoUrl?: string | null;
}): string {
  return (
    firstHttpUrl(
      opts?.logoUrl,
      opts?.organizationLogoUrl,
      opts?.tenantLogoUrl,
      opts?.authLogoUrl,
    ) || DEFAULT_BRAND_LOGO_URL
  );
}
