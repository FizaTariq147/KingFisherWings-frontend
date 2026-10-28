/**
 * Capture invitation tokens from the query string into sessionStorage, then
 * strip them from the URL. Survives refresh on the activation page without
 * leaving the token in browser history / Referer.
 */

const KEYS = {
  portal: 'kf.portal.inviteToken',
  vendor: 'kf.vendor.inviteToken',
  staff: 'kf.staff.inviteToken',
} as const;

export type InviteTokenAudience = keyof typeof KEYS;

function storageKey(audience: InviteTokenAudience): string {
  return KEYS[audience];
}

export function readInviteTokenFromSearch(
  search: string,
  audience: InviteTokenAudience,
): string {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const fromQuery = (params.get('token') || params.get('invite') || '').trim();
  if (fromQuery) {
    try {
      sessionStorage.setItem(storageKey(audience), fromQuery);
    } catch {
      /* private mode / quota — still return query token for this load */
    }
    return fromQuery;
  }
  try {
    return (sessionStorage.getItem(storageKey(audience)) || '').trim();
  } catch {
    return '';
  }
}

export function clearInviteTokenSession(audience: InviteTokenAudience): void {
  try {
    sessionStorage.removeItem(storageKey(audience));
  } catch {
    /* ignore */
  }
}
