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
  clearMustChangePassword: () => void;
  /** Mark session as requiring a new password (temporary-password login fallback). */
  markMustChangePassword: () => void;
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
      clearMustChangePassword: () =>
        set((state) => {
          if (!state.user?.mustChangePassword) return state;
          return { user: { ...state.user, mustChangePassword: false } };
        }),
      markMustChangePassword: () =>
        set((state) => {
          if (!state.user) return state;
          if (state.user.mustChangePassword) return state;
          return { user: { ...state.user, mustChangePassword: true } };
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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: Boolean(state.refreshToken),
      }),
    },
  ),
);
