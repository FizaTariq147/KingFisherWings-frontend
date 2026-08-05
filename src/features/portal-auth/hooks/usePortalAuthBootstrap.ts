import { useEffect, useState } from 'react';
import { usePortalAuthStore } from '../store/portalAuthStore';

/**
 * Waits for portal auth persistence to finish (including empty storage).
 */
export function usePortalAuthBootstrap() {
  const [ready, setReady] = useState(() => usePortalAuthStore.persist.hasHydrated());
  const accessToken = usePortalAuthStore((s) => s.accessToken);

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

  return { ready, accessToken };
}
