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

/** Human label for confirm dialogs / titles when display_name may be missing. */
export function formatTenantLabel(tenant: {
  display_name?: string | null;
  name?: string | null;
  company_name?: string | null;
  code?: string | null;
  slug?: string | null;
}): string {
  const candidates = [
    tenant.display_name,
    tenant.name,
    tenant.company_name,
    tenant.code,
    tenant.slug,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return 'This tenant';
}
