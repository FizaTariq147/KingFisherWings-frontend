import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';

/**
 * Stable React Query scope for portal data.
 * Prefer party id (backend scopes by party); always include user id so two
 * users never share a cache entry even if party is missing from /me.
 */
export function usePortalQueryScope(): string {
  return usePortalAuthStore((s) => {
    const userId = s.user?.id?.trim() || '';
    const partyId = s.user?.party?.id?.trim() || '';
    if (!userId && !partyId) return 'anon';
    return `${userId || 'user'}:${partyId || 'party'}`;
  });
}
