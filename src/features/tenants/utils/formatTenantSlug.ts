/** Renders tenant workspace slug for display (login uses the bare slug only). */
export function formatTenantSlug(slug: string): string {
  if (!slug) return '—';
  const normalized = slug.replace(/^\/|\/$/g, '').trim();
  if (!normalized) return '—';
  // Never append a fake domain — users copy this into Tenant Admin login.
  return normalized;
}

/** Optional workspace host hint for UI (not used as login slug). */
export function formatTenantWorkspaceHost(slug: string): string {
  const bare = formatTenantSlug(slug);
  if (bare === '—') return bare;
  return `${bare}.fresagold.app`;
}
