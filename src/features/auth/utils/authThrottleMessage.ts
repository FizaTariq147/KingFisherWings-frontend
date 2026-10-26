/**
 * Mirrors backend AUTH_THROTTLE ({ limit: 3, ttl: 60_000 }) for user-facing copy.
 * Applied on login / forgot / reset / change-password / accept-invite across staff, portal, vendor.
 */
export const AUTH_THROTTLE = { limit: 3, ttlMs: 60_000 } as const;

export const AUTH_THROTTLE_USER_MESSAGE =
  'Too many attempts. Please wait about a minute before trying again.';

/** Nest 429 (or Axios “status code 429”) → throttle copy; otherwise null. */
export function authThrottleMessageFromError(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const status =
    'status' in error && typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : (error as { response?: { status?: number } }).response?.status;

  if (status === 429) return AUTH_THROTTLE_USER_MESSAGE;

  const msg =
    error instanceof Error
      ? error.message
      : typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : '';

  if (/status code\s*429/i.test(msg) || /too many requests/i.test(msg)) {
    return AUTH_THROTTLE_USER_MESSAGE;
  }

  return null;
}

/** Prefer throttle copy, then caller fallback. */
export function withAuthThrottleMessage(error: unknown, fallback: string): string {
  return authThrottleMessageFromError(error) ?? fallback;
}
