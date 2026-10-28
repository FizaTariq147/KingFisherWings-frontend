import { PortalApiError } from '@/lib/portalApiClient';
import { withAuthThrottleMessage } from '@/features/auth/utils/authThrottleMessage';

/**
 * Map portal accept-invite failures to safe customer-facing copy.
 * Never forward raw Nest/DB messages that could leak internals.
 */
export function portalInviteErrorMessage(error: unknown): string {
  const throttled = withAuthThrottleMessage(error, '');
  if (throttled) return throttled;

  const status = error instanceof PortalApiError ? error.status : undefined;
  const raw =
    error instanceof PortalApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : '';
  const lower = raw.toLowerCase();

  if (
    status === 410 ||
    lower.includes('expired') ||
    lower.includes('expiry') ||
    lower.includes('expire')
  ) {
    return 'This invitation has expired. Ask your forwarder to send a new invite.';
  }

  if (
    lower.includes('already used') ||
    lower.includes('already accepted') ||
    lower.includes('already activated') ||
    lower.includes('previously used') ||
    (lower.includes('used') && lower.includes('invite'))
  ) {
    return 'This invitation was already used. Sign in with your password instead.';
  }

  if (
    status === 404 ||
    status === 400 ||
    lower.includes('invalid') ||
    lower.includes('not found') ||
    lower.includes('revoked') ||
    lower.includes('cancelled') ||
    lower.includes('canceled')
  ) {
    return 'This invitation link is invalid or no longer available.';
  }

  if (status === 401 || status === 403) {
    return 'This invitation link is invalid or no longer available.';
  }

  return 'Could not activate your account. Check the link or ask your forwarder for a new invite.';
}
