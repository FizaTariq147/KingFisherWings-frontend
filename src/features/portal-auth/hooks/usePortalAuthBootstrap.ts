import { useEffect, useState } from 'react';
import { portalAuthService } from '../services/portalAuth.service';
import { usePortalAuthStore } from '../store/portalAuthStore';

/**
 * Waits for portal auth persistence to finish, then restores access token via refresh.
 */
export function usePortalAuthBootstrap() {
  const [ready, setReady] = useState(() => usePortalAuthStore.persist.hasHydrated());
  const [restoring, setRestoring] = useState(false);
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const refreshToken = usePortalAuthStore((s) => s.refreshToken);
  const setTokens = usePortalAuthStore((s) => s.setTokens);
  const logout = usePortalAuthStore((s) => s.logout);

  useEffect(() => {
    if (usePortalAuthStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    const unsub = usePortalAuthStore.persist.onFinishHydration(markReady);
    const maybePromise = usePortalAuthStore.persist.rehydrate();
    if (maybePromise instanceof Promise) {
      void maybePromise.then(markReady).catch(markReady);
    }

    const timer = window.setTimeout(markReady, 50);

    return () => {
      cancelled = true;
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!refreshToken || accessToken) {
      setRestoring(false);
      return;
    }

    let cancelled = false;
    setRestoring(true);

    void (async () => {
      try {
        const pair = await portalAuthService.refresh(refreshToken);
        if (cancelled) return;
        setTokens(pair.accessToken, pair.refreshToken);
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, refreshToken, accessToken, setTokens, logout]);

  return { ready: ready && !restoring, accessToken };
}
