import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { isStoredFileUrl } from '@/features/files/utils/parseFilesApiUrl';
import { fetchOrganizationLogoBytes } from '@/features/organization/utils/embedOrganizationPdfLogo';
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
  return isStoredFileUrl(trimmed) || trimmed.startsWith('/files/') || trimmed.startsWith('/backend/');
}

/**
 * Brand mark with dynamic URL + hard fallback to assets/logo.png
 * (also recovers if a remote URL 404s). Auth-fetches `/files/...` logos.
 */
export function BrandLogo({
  logoUrl,
  organizationLogoUrl,
  tenantLogoUrl,
  authLogoUrl,
  alt = 'KingFisher Wings',
  className,
}: Props) {
  const resolved = resolveBrandLogoUrl({
    logoUrl,
    organizationLogoUrl,
    tenantLogoUrl,
    authLogoUrl,
  });
  const [src, setSrc] = useState(resolved);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const run = async () => {
      if (!resolved || resolved === DEFAULT_BRAND_LOGO_URL || !needsAuthFetch(resolved)) {
        if (!cancelled) setSrc(resolved || DEFAULT_BRAND_LOGO_URL);
        return;
      }
      try {
        const bytes = await fetchOrganizationLogoBytes(resolved);
        if (cancelled) return;
        if (!bytes || bytes.byteLength === 0) {
          setSrc(DEFAULT_BRAND_LOGO_URL);
          return;
        }
        objectUrl = URL.createObjectURL(new Blob([bytes]));
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc(DEFAULT_BRAND_LOGO_URL);
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
