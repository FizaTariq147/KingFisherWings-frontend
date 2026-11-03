import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationProfile } from '@/features/organization/hooks/useOrganizationProfile';
import { resolveBrandLogoUrl } from '../utils/resolveBrandLogoUrl';

/**
 * Authenticated chrome: org profile logo → auth user logo → default asset.
 */
export function useBrandLogoUrl(override?: string | null): string {
  const accessToken = useAuthStore((s) => s.accessToken);
  const authLogoUrl = useAuthStore((s) => (s.user as { logoUrl?: string } | null)?.logoUrl);
  const profile = useOrganizationProfile();
  const orgLogo = accessToken ? profile.data?.logo_url : undefined;

  return useMemo(
    () =>
      resolveBrandLogoUrl({
        logoUrl: override,
        organizationLogoUrl: orgLogo,
        authLogoUrl,
      }),
    [override, orgLogo, authLogoUrl],
  );
}
