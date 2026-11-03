import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
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
 * Brand mark with dynamic URL + hard fallback to assets/logo.png
 * (also recovers if a remote URL 404s).
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
    setSrc(resolved);
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
