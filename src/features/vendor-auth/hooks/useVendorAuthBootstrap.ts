import { useEffect, useState } from 'react';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export function useVendorAuthBootstrap() {
  const [ready, setReady] = useState(() => useVendorAuthStore.persist.hasHydrated());
  const accessToken = useVendorAuthStore((s) => s.accessToken);

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

  return { ready, accessToken };
}
