import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SuperAdminUser {
  id: string;
  email: string;
  firstName: string; // JWT payload is camelCase per backend convention
  lastName: string;
}

interface SuperAdminAuthState {
  user: SuperAdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: SuperAdminUser, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useSuperAdminAuthStore = create<SuperAdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'kfg-superadmin-auth' },
  ),
);