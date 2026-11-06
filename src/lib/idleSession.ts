/** Default idle timeout minutes (GET /auth/me fallback). */
export const DEFAULT_IDLE_TIMEOUT_MINUTES = 20;

/** Shared idle timeout for Admin, Customer portal, and Vendor portal. */
export const IDLE_SESSION_MS = DEFAULT_IDLE_TIMEOUT_MINUTES * 60 * 1000;

/** How often POST /auth/session/touch may fire while the tab has activity. */
export const IDLE_SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export const IDLE_ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

/** Throttle activity writes so high-frequency mousemove does not thrash state. */
export const IDLE_ACTIVITY_THROTTLE_MS = 5_000;

export function idleMinutesToMs(minutes: number | null | undefined): number {
  const n = typeof minutes === 'number' ? minutes : Number(minutes);
  if (!Number.isFinite(n) || n <= 0) return IDLE_SESSION_MS;
  return Math.round(n) * 60 * 1000;
}

export function isIdleSessionExpired(
  lastActiveAt: number | null | undefined,
  idleMs: number = IDLE_SESSION_MS,
): boolean {
  if (!lastActiveAt || !Number.isFinite(lastActiveAt)) return false;
  return Date.now() - lastActiveAt >= idleMs;
}
