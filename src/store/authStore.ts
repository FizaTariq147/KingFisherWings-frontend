import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { axiosInstance } from '@/lib/axios'

export type Product = 'Fresa Global' | 'Fresa Gold' | 'Fresa App' | 'Fresa Analytics'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  product: Product
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string, product: Product) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  clearError: () => void
  setAccessToken: (token: string) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Actions ───────────────────────────────────────────
      login: async (email, password, product) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await axiosInstance.post<{
            user: AuthUser
            accessToken: string
          }>('/api/auth/login', { email, password, product })

          // refreshToken is set as httpOnly cookie by server — not stored here
          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : 'Incorrect email or password. Please try again.'
          set({ isLoading: false, error: message, isAuthenticated: false })
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post('/api/auth/logout')
        } catch {
          // Swallow — we always clear local state regardless
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          })
          window.location.href = '/login'
        }
      },

      refreshAccessToken: async () => {
        try {
          const { data } = await axiosInstance.post<{ accessToken: string }>(
            '/api/auth/refresh',
            {},
            { withCredentials: true },
          )
          set({ accessToken: data.accessToken })
        } catch {
          await get().logout()
        }
      },

      clearError: () => set({ error: null }),

      setAccessToken: (token: string) => set({ accessToken: token }),
    }),
    {
      name: 'fresa-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist user identity — never the access token
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)