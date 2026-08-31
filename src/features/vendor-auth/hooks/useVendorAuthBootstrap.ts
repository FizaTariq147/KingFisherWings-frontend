import { useEffect, useState } from 'react';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export function useVendorAuthBootstrap() {
  const [ready, setReady] = useState(() => useVendorAuthStore.persist.hasHydrated());
  const [restoring, setRestoring] = useState(false);
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const refreshToken = useVendorAuthStore((s) => s.refreshToken);
  const setTokens = useVendorAuthStore((s) => s.setTokens);
  const logout = useVendorAuthStore((s) => s.logout);

  useEffect(() => {
    if (useVendorAuthStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    const unsub = useVendorAuthStore.persist.onFinishHydration(markReady);
    const maybePromise = useVendorAuthStore.persist.rehydrate();
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
        const pair = await vendorAuthService.refresh(refreshToken);
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
