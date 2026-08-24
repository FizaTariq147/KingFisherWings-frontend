import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { VendorUser } from '../types/vendorAuth.types';

interface VendorAuthState {
  user: VendorUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: VendorUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: VendorUser) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useVendorAuthStore = create<VendorAuthState>()(
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
      name: 'kfg-vendor-auth',
      // sessionStorage: tokens do not survive browser restart (better than localStorage).
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) return;
          const { accessToken, isAuthenticated } = useVendorAuthStore.getState();
          if (isAuthenticated && !accessToken) {
            useVendorAuthStore.getState().logout();
          }
        };
      },
    },
  ),
);
