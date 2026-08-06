import { queryClient } from '@/lib/queryClient';

/** Prefix for all customer-portal React Query caches. */
export const PORTAL_QUERY_ROOT = ['portal'] as const;

/** Drop cached portal data so the next login cannot see another user's results. */
export function clearPortalQueryCache(): void {
  queryClient.removeQueries({ queryKey: PORTAL_QUERY_ROOT });
}
