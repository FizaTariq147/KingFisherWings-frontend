/** Shared idle timeout for Admin, Customer portal, and Vendor portal. */
export const IDLE_SESSION_MS = 20 * 60 * 1000;

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

export function isIdleSessionExpired(
  lastActiveAt: number | null | undefined,
  idleMs: number = IDLE_SESSION_MS,
): boolean {
  if (!lastActiveAt || !Number.isFinite(lastActiveAt)) return false;
  return Date.now() - lastActiveAt >= idleMs;
}
