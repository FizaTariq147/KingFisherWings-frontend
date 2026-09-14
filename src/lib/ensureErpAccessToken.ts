import { accessTokenExpiresAtMs } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';

/** In-flight refresh so concurrent 401s / request hooks share one POST /auth/refresh. */
let refreshFlight: Promise<string | null> | null = null;

/**
 * Ensure ERP access token is present and not near expiry.
 * Uses a single-flight refresh — safe from axios interceptors and session APIs.
 */
export async function ensureErpAccessToken(
  skewMs = 20_000,
  options?: { force?: boolean },
): Promise<string | null> {
  const state = useAuthStore.getState();
  const refreshToken = state.refreshToken;
  if (!refreshToken) return state.accessToken;

  const accessToken = state.accessToken;
  const expiresAt = accessToken ? accessTokenExpiresAtMs(accessToken) : null;
  const needsRefresh =
    options?.force === true ||
    !accessToken ||
    (expiresAt != null && expiresAt <= Date.now() + skewMs);

  if (!needsRefresh) return accessToken;

  if (!refreshFlight) {
    refreshFlight = (async () => {
      try {
        await useAuthStore.getState().refreshAccessToken();
        return useAuthStore.getState().accessToken;
      } catch {
        return null;
      } finally {
        refreshFlight = null;
      }
    })();
  }

  return refreshFlight;
}

/** Wait until zustand auth persist has rehydrated (avoids 401 before refreshToken loads). */
export function waitForErpAuthHydration(): Promise<void> {
  const api = useAuthStore.persist;
  if (api.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = api.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
