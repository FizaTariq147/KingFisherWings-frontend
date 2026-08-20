/** Normalize an Axios `config.url` (relative or absolute) to a pathname without query. */
export function requestPathname(url?: string): string {
  if (!url) return '';
  const withoutQuery = url.split('?')[0] ?? '';
  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(withoutQuery)) {
      return new URL(withoutQuery).pathname.replace(/\/+$/, '') || '/';
    }
  } catch {
    /* fall through */
  }
  const path = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  return path.replace(/\/+$/, '') || '/';
}

/** True when `url` is exactly `path` (or ends with it, e.g. `/backend/auth/login`). */
export function matchesApiPath(url: string | undefined, path: string): boolean {
  const pathname = requestPathname(url);
  const normalized = path.replace(/\/+$/, '') || '/';
  return pathname === normalized || pathname.endsWith(normalized);
}

export function matchesAnyApiPath(url: string | undefined, paths: readonly string[]): boolean {
  return paths.some((path) => matchesApiPath(url, path));
}
