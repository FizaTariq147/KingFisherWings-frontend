import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { isApiOriginUrl } from '@/lib/safeHttpUrl';
import { useAuthStore } from '@/store/authStore';
import {
  isStoredFileUrl,
  toDurableFilesApiPath,
} from '@/features/files/utils/parseFilesApiUrl';
import { fetchOrganizationLogoBytes } from '@/features/organization/utils/embedOrganizationPdfLogo';
import { cacheOrganizationLogoFile } from '@/features/organization/utils/orgLogoCache';
import { DEFAULT_BRAND_LOGO_URL } from '../constants/brandLogo.constants';
import { resolveBrandLogoUrl } from '../utils/resolveBrandLogoUrl';

type Props = {
  logoUrl?: string | null;
  organizationLogoUrl?: string | null;
  tenantLogoUrl?: string | null;
  authLogoUrl?: string | null;
  alt?: string;
  className?: string;
  /**
   * Skip authenticated org/files logo fetch — use the bundled system mark only.
   * Use on login / Super Admin chrome (no tenant org branding).
   */
  systemOnly?: boolean;
};

/**
 * True when the logo must be loaded with the staff JWT (every device/session).
 * Private R2/S3 object URLs look like public https but expire / block <img> without auth.
 */
function needsAuthFetch(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed === DEFAULT_BRAND_LOGO_URL) return false;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return false;
  if (trimmed.startsWith('/')) return true;
  if (isStoredFileUrl(trimmed) || Boolean(toDurableFilesApiPath(trimmed))) return true;
  return isApiOriginUrl(trimmed);
}

/**
 * Brand mark with dynamic URL + hard fallback to the bundled King Fisher system logo.
 *
 * - Login / Super Admin (`systemOnly`): always system mark — never call /organization/logo.
 * - Authenticated staff: org logo_url + GET /organization/logo bytes (same source as invoices).
 */
export function BrandLogo({
  logoUrl,
  organizationLogoUrl,
  tenantLogoUrl,
  authLogoUrl,
  alt = 'Company logo',
  className,
  systemOnly = false,
}: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const resolved = systemOnly
    ? DEFAULT_BRAND_LOGO_URL
    : resolveBrandLogoUrl({
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
      if (systemOnly) {
        setSrc(DEFAULT_BRAND_LOGO_URL);
        return;
      }

      const preferred =
        resolved && resolved !== DEFAULT_BRAND_LOGO_URL ? resolved : null;
      const hasStaffSession = Boolean(accessToken);

      // Unauthenticated pages with no tenant logo: system mark only.
      // Do not probe /organization/logo (401 without staff JWT).
      if (!preferred && !hasStaffSession) {
        setSrc(DEFAULT_BRAND_LOGO_URL);
        return;
      }

      // Staff session: network-first (profile URL → /files → /organization/logo)
      // so Tenant Admin uploads appear in sidebar for every staff user/device.
      try {
        const bytes = await fetchOrganizationLogoBytes(preferred);
        if (cancelled) return;
        if (bytes && bytes.byteLength > 0) {
          const blob = new Blob([bytes]);
          void cacheOrganizationLogoFile(blob);
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
          return;
        }
      } catch {
        /* fall through */
      }

      if (cancelled) return;

      // Truly public CDN (not our private object store) — <img> is fine.
      if (preferred && !needsAuthFetch(preferred)) {
        setSrc(preferred);
        return;
      }

      setSrc(DEFAULT_BRAND_LOGO_URL);
    };

    void run();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resolved, systemOnly, accessToken]);

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
