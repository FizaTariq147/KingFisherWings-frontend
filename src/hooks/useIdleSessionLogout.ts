import { useEffect, useRef } from 'react';
import {
  IDLE_ACTIVITY_EVENTS,
  IDLE_ACTIVITY_THROTTLE_MS,
  IDLE_SESSION_MS,
  isIdleSessionExpired,
} from '@/lib/idleSession';

type UseIdleSessionLogoutOptions = {
  /** When false, listeners and timers are cleared. */
  enabled: boolean;
  /** Called once when idle window expires. */
  onIdle: () => void;
  idleMs?: number;
};

/**
 * Logs the user out after `idleMs` with no pointer/keyboard/scroll activity.
 * Used by Admin (via SessionExpiryWatcher), Customer portal, and Vendor portal.
 */
export function useIdleSessionLogout({
  enabled,
  onIdle,
  idleMs = IDLE_SESSION_MS,
}: UseIdleSessionLogoutOptions): void {
  const lastActiveAtRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<number | null>(null);
  const activityThrottleRef = useRef(0);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      firedRef.current = false;
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    firedRef.current = false;
    lastActiveAtRef.current = Date.now();

    const schedule = () => {
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      const remaining = Math.max(0, lastActiveAtRef.current + idleMs - Date.now());
      idleTimerRef.current = window.setTimeout(() => {
        if (firedRef.current) return;
        if (isIdleSessionExpired(lastActiveAtRef.current, idleMs)) {
          firedRef.current = true;
          onIdleRef.current();
        }
      }, remaining);
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - activityThrottleRef.current < IDLE_ACTIVITY_THROTTLE_MS) return;
      activityThrottleRef.current = now;
      lastActiveAtRef.current = now;
      firedRef.current = false;
      schedule();
    };

    for (const event of IDLE_ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }
    schedule();

    return () => {
      for (const event of IDLE_ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [enabled, idleMs]);
}
