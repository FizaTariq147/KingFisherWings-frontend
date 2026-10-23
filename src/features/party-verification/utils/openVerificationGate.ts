import {
  useVerificationGateStore,
  type VerificationAudience,
} from '../store/verificationGateStore';
import { getVerificationGateMessage } from './normalizePartyVerification';

/**
 * If `error` is a party-verification gate (403 docs / pending approval), open the
 * custom modal and return true so callers can skip Retry / generic error UI.
 */
export function openVerificationGateIfNeeded(
  error: unknown,
  audience: VerificationAudience,
): boolean {
  const message = getVerificationGateMessage(error);
  if (!message) return false;
  useVerificationGateStore.getState().openGate({ audience, message });
  return true;
}
