import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { isApiOriginUrl } from '@/lib/safeHttpUrl';
import { fetchOrganizationLogoBytes } from '@/features/organization/utils/embedOrganizationPdfLogo';
import { cacheOrganizationLogoFile } from '@/features/organization/utils/orgLogoCache';
import { BRAND_LOGO_API } from '../api/brandLogo.api';
import { DEFAULT_BRAND_LOGO_URL } from '../constants/brandLogo.constants';
import { resolveBrandLogoUrl } from '../utils/resolveBrandLogoUrl';

type Props = {
  logoUrl?: string | null;
  organizationLogoUrl?: string | null;
  tenantLogoUrl?: string | null;
  authLogoUrl?: string | null;
  alt?: string;
  className?: string;
};

function needsAuthFetch(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed === DEFAULT_BRAND_LOGO_URL) return false;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return false;
  if (trimmed.startsWith('/')) return true;
  return isApiOriginUrl(trimmed);
}

/**
 * Brand mark with dynamic URL + hard fallback to assets/logo.png.
 * Auth-fetches org `/files/...` and `/organization/logo` so previews match PDFs.
 */
export function BrandLogo({
  logoUrl,
  organizationLogoUrl,
  tenantLogoUrl,
  authLogoUrl,
  alt = 'Company logo',
  className,
}: Props) {
  const resolved = resolveBrandLogoUrl({
    logoUrl,
    organizationLogoUrl,
    tenantLogoUrl,
    authLogoUrl,
  });
  const [src, setSrc] = useState(resolved || DEFAULT_BRAND_LOGO_URL);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const run = async () => {
      const target =
        resolved && resolved !== DEFAULT_BRAND_LOGO_URL
          ? resolved
          : BRAND_LOGO_API.organizationLogo;

      if (!needsAuthFetch(target) && resolved && resolved !== DEFAULT_BRAND_LOGO_URL) {
        if (!cancelled) setSrc(resolved);
        return;
      }

      try {
        const bytes = await fetchOrganizationLogoBytes(
          resolved && resolved !== DEFAULT_BRAND_LOGO_URL ? resolved : null,
        );
        if (cancelled) return;
        if (!bytes || bytes.byteLength === 0) {
          setSrc(resolved || DEFAULT_BRAND_LOGO_URL);
          return;
        }
        const blob = new Blob([bytes]);
        // Warm PDF logo cache whenever branding preview loads successfully.
        void cacheOrganizationLogoFile(blob);
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc(resolved || DEFAULT_BRAND_LOGO_URL);
      }
    };

    void run();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resolved]);

  return (
    <img
      src={src || DEFAULT_BRAND_LOGO_URL}
      alt={alt}
      className={cn(className)}
      onError={() => {
        if (src !== DEFAULT_BRAND_LOGO_URL) setSrc(DEFAULT_BRAND_LOGO_URL);
      }}
    />
  );
}
