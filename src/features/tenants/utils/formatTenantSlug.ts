/** Renders tenant workspace slug for display (path-style or legacy short slug). */
export function formatTenantSlug(slug: string): string {
  if (!slug) return '—';
  if (slug.startsWith('/')) return slug;
  return `${slug}.fresagold.app`;
}
