import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PortalUser } from '../types/portalAuth.types';

interface PortalAuthState {
  user: PortalUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: PortalUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: PortalUser) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const usePortalAuthStore = create<PortalAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: Boolean(accessToken),
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'kfg-portal-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Never persist access tokens — refresh on bootstrap (align with ERP / Super Admin).
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: Boolean(state.refreshToken),
      }),
    },
  ),
);
