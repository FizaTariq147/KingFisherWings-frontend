/**
 * Normalize tenant slug for auth requests.
 * Users often paste the display host (`slug.fresagold.app`) from the tenants UI.
 */
export function normalizeTenantSlugInput(raw: string): string {
  let value = raw.trim().toLowerCase();
  if (!value) return '';

  value = value.replace(/^https?:\/\//, '');
  value = value.replace(/\/.*$/, ''); // drop path
  value = value.replace(/\.fresagold\.app$/i, '');
  value = value.replace(/^\/|\/$/g, '');

  return value;
}
