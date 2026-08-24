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
      // sessionStorage: tokens do not survive browser restart (better than localStorage).
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) return;
          const { accessToken, isAuthenticated } = usePortalAuthStore.getState();
          if (isAuthenticated && !accessToken) {
            usePortalAuthStore.getState().logout();
          }
        };
      },
    },
  ),
);
