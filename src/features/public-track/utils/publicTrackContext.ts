/** Host + tenant domain headers required by Public Track & Trace APIs. */
export function getPublicTrackHost(): string {
  if (typeof window === 'undefined') return '';
  return window.location.host;
}

/** Tenant custom domain hint — defaults to current host unless overridden. */
export function getPublicTrackTenantDomain(): string {
  const fromEnv = import.meta.env.VITE_TENANT_DOMAIN;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  return getPublicTrackHost();
}

export function buildPublicTrackHeaders(): Record<string, string> {
  const host = getPublicTrackHost();
  const tenantDomain = getPublicTrackTenantDomain();
  return {
    host,
    'x-tenant-domain': tenantDomain,
  };
}

/** Resolve tenant slug from `?tenant=` / `?tenant_slug=` or first subdomain label. */
export function resolveTenantSlugFromLocation(search = ''): string {
  const params = new URLSearchParams(search);
  for (const key of ['tenant', 'tenant_slug', 'workspace'] as const) {
    const value = params.get(key);
    if (value?.trim()) return value.trim().toLowerCase();
  }

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
