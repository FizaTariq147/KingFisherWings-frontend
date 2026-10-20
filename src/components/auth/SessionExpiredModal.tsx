/**
 * @deprecated Idle timeout now auto-logs out via SessionExpiryWatcher +
 * authStore.markSessionExpired (hardSignOutToLogin). Kept as a no-op so any
 * leftover imports do not show Continue / Revoke.
 */
export function SessionExpiredModal() {
  return null
}
