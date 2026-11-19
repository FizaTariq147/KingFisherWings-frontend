import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { isApiOriginUrl } from '@/lib/safeHttpUrl';
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
 * Brand mark with dynamic URL + hard fallback to assets/logo.png.
 * Always prefers authenticated byte fetch so sidebar matches PDFs on every device.
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
      const preferred =
        resolved && resolved !== DEFAULT_BRAND_LOGO_URL ? resolved : null;

      // Network-first (profile → /files → /organization/logo) so all sessions stay in sync.
      // Do not rely on this browser’s localStorage as the source of truth.
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
