/**
 * WordPress PORTALS → software login (link mode).
 * Read ?tenant_slug= / ?tenantSlug= to prefill + lock the workspace field.
 */

const MIN_LEN = 2;
const MAX_LEN = 100;

function fromRaw(raw: string | null | undefined): string | null {
  const slug = String(raw ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  if (slug.length < MIN_LEN || slug.length > MAX_LEN) return null;
  // Basic safety — no spaces / query injection chars.
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(slug)) return null;
  return slug;
}

/** Prefer `tenant_slug`, then `tenantSlug`. */
export function readTenantSlugFromSearch(
  search: string | URLSearchParams | null | undefined,
): string | null {
  if (!search) return null;
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  return fromRaw(params.get('tenant_slug') ?? params.get('tenantSlug'));
}

/** Append or replace tenant_slug on a path (keeps other query keys). */
export function withTenantSlugQuery(
  pathWithOptionalQuery: string,
  slug: string | null | undefined,
): string {
  const [pathPart, queryPart = ''] = pathWithOptionalQuery.split('?');
  const params = new URLSearchParams(queryPart);
  params.delete('tenantSlug');
  const cleaned = fromRaw(slug);
  if (cleaned) params.set('tenant_slug', cleaned);
  else {
    params.delete('tenant_slug');
  }
  const q = params.toString();
  return q ? `${pathPart}?${q}` : pathPart;
}
