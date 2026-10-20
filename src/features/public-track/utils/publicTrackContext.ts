/** Host + tenant domain helpers for Public Track & Trace APIs. */

function isLoopbackHost(host: string): boolean {
  const hostname = host.trim().toLowerCase().split(':')[0] ?? '';
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost')
  );
}

export function getPublicTrackHost(): string {
  if (typeof window === 'undefined') return '';
  return window.location.host;
}

/**
 * Tenant custom-domain hint for `x-tenant-domain`.
 * Never send localhost — the Vite proxy uses changeOrigin, so the API Host is
 * the backend host; tenant resolution must use `tenant_slug` and/or a real domain.
 */
export function getPublicTrackTenantDomain(): string {
  const fromEnv = import.meta.env.VITE_TENANT_DOMAIN;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();

  const api = String(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '',
  ).trim();
  if (/^https?:\/\//i.test(api)) {
    try {
      const host = new URL(api).host;
      if (host && !isLoopbackHost(host)) return host;
    } catch {
      /* ignore */
    }
  }

  const host = getPublicTrackHost();
  if (host && !isLoopbackHost(host)) return host;
  return '';
}

/**
 * Headers for GET /track*. Do not set `Host` — browsers forbid it; the UA sets
 * the real Host (via proxy → backend origin when changeOrigin is on).
 */
export function buildPublicTrackHeaders(): Record<string, string> {
  const tenantDomain = getPublicTrackTenantDomain();
  if (!tenantDomain) return {};
  return { 'x-tenant-domain': tenantDomain };
}

const LAST_TENANT_SLUG_KEY = 'kf_public_track_tenant_slug';

/** Remember tenant slug from staff/tenant login for public Track & Trace on localhost. */
export function rememberPublicTrackTenantSlug(slug?: string | null): void {
  const value = slug?.trim().toLowerCase();
  if (!value || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(LAST_TENANT_SLUG_KEY, value);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readRememberedPublicTrackTenantSlug(): string {
  if (typeof sessionStorage === 'undefined') return '';
  try {
    return sessionStorage.getItem(LAST_TENANT_SLUG_KEY)?.trim().toLowerCase() || '';
  } catch {
    return '';
  }
}

/** Resolve tenant slug from `?tenant=` / `?tenant_slug=` / remembered login / subdomain. */
export function resolveTenantSlugFromLocation(search = ''): string {
  const params = new URLSearchParams(search);
  for (const key of ['tenant', 'tenant_slug', 'workspace'] as const) {
    const value = params.get(key);
    if (value?.trim()) return value.trim().toLowerCase();
  }

  const remembered = readRememberedPublicTrackTenantSlug();
  if (remembered) return remembered;

  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  const parts = host.split('.').filter(Boolean);
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0].toLowerCase();
  }
  return '';
}

export function resolveRefFromLocation(search = ''): string {
  const params = new URLSearchParams(search);
  for (const key of ['ref', 'reference', 'job', 'job_no'] as const) {
    const value = params.get(key);
    if (value?.trim()) return value.trim();
  }
  return '';
}
