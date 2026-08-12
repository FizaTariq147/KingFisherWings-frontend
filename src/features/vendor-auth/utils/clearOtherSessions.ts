import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { clearPortalQueryCache } from '@/features/portal-shared/clearPortalQueryCache';
import { useAuthStore } from '@/store/authStore';

/** Clear staff + customer portal sessions without triggering their logout redirects. */
export function clearOtherAuthSessions() {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    error: null,
  });
  usePortalAuthStore.getState().logout();
  clearPortalQueryCache();
}
