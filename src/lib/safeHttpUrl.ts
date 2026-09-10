/** True for http(s) URLs only — blocks javascript:, data:, and other dangerous schemes. */
export function isSafeHttpUrl(url: string): boolean {
  const value = url.trim();
  if (!value) return false;
  // Protocol-relative URLs (`//evil.com`) resolve to http(s) against the page — reject.
  if (value.startsWith('//')) return false;
  try {
    const parsed = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'https://local.invalid');
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Configured API base (may be absolute https://… or relative `/backend`). */
export function getConfiguredApiBase(): string {
  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as Record<string, unknown>)
      : {};
  return String(env.VITE_API_BASE_URL || env.VITE_API_URL || '/backend').replace(/\/$/, '');
}

/**
 * True when `url` targets the configured API origin, same browser origin via `/backend`,
 * or a relative API path (e.g. `/files/...`, `/backend/...`).
 * Blocks absolute third-party hosts so Bearer tokens are not sent there.
 */
export function isApiOriginUrl(url: string): boolean {
  const value = url.trim();
  if (!value) return false;

  // Relative app/API paths — axios baseURL will resolve them.
  if (value.startsWith('/') && !value.startsWith('//')) {
    return true;
  }

  if (!isSafeHttpUrl(value)) return false;

  try {
    const pageOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'https://local.invalid';
    const parsed = new URL(value, pageOrigin);
    const apiBase = getConfiguredApiBase();

    if (apiBase.startsWith('/')) {
      // Relative API proxy (e.g. /backend) — only allow same page origin.
      return parsed.origin === pageOrigin;
    }

    const apiOrigin = new URL(apiBase, pageOrigin).origin;
    return parsed.origin === apiOrigin || parsed.origin === pageOrigin;
  } catch {
    return false;
  }
}

/** Open only http(s) URLs; returns null if scheme is unsafe. */
export function openSafeHttpUrl(url: string, target = '_blank'): Window | null {
  if (!isSafeHttpUrl(url)) return null;
  return window.open(url, target, 'noopener,noreferrer');
}

/**
 * Open only API-origin (or relative) http(s) URLs.
 * Prefer this for API-supplied download_url / pdf_url fields.
 */
export function openSafeApiOriginUrl(url: string, target = '_blank'): Window | null {
  if (!isApiOriginUrl(url) || !isSafeHttpUrl(url)) return null;
  return window.open(url, target, 'noopener,noreferrer');
}
