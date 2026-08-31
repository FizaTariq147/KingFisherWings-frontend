import type { SetURLSearchParams } from 'react-router-dom';

/**
 * Removes sensitive query params (tokens, invites) from the URL after reading them
 * so they are not kept in browser history or Referer headers.
 */
export function stripSensitiveSearchParams(
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
  keys: string[] = ['token', 'invite'],
): void {
  const next = new URLSearchParams(searchParams);
  let changed = false;

  for (const key of keys) {
    if (next.has(key)) {
      next.delete(key);
      changed = true;
    }
  }

  if (changed) {
    setSearchParams(next, { replace: true });
  }
}
