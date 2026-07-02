import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { axiosInstance } from '@/lib/axios'

export type Product = 'KingFisher Tech Global' | 'KingFisher Tech Gold' | 'KingFisher Tech App' | 'KingFisher Tech Analytics'

export interface AuthUser {
  id:      string
  name:    string
  email:   string
  role:    string
  product: Product
}

// ── Backend error response shape from NestJS ──────────────────────────────
interface BackendError {
  message:    string | string[]
  error?:     string
  statusCode: number
}

function extractErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'An unexpected error occurred.'

  // Axios error with response body
  const axiosErr = err as { response?: { data?: BackendError; status?: number } }
  const data     = axiosErr.response?.data
  const status   = axiosErr.response?.status

  if (data?.message) {
    const msg = Array.isArray(data.message) ? data.message[0] : data.message

    // Map known backend codes to user-facing messages
    if (status === 401) {
      if (msg.toLowerCase().includes('locked'))
        return 'Your account has been locked due to too many failed attempts. Please contact your administrator.'
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials'))
        return 'Incorrect email or password. Please try again.'
      if (msg.toLowerCase().includes('outside') || msg.toLowerCase().includes('hours'))
        return 'Login is not permitted outside your configured office hours.'
      if (msg.toLowerCase().includes('ip'))
        return 'Login from this IP address is not permitted.'
      if (msg.toLowerCase().includes('mac'))
        return 'Login from this device is not permitted.'
      return 'Authentication failed. Please check your credentials.'
    }
    if (status === 403)
      return 'You do not have permission to access this product.'
    if (status === 429)
      return 'Too many login attempts. Please wait a moment before trying again.'
    if (status === 503 || status === 0)
      return 'Unable to reach the server. Please check your connection.'

    return msg
  }

  // Network error (no response)
  const netErr = err as { code?: string; message?: string }
  if (netErr.code === 'ERR_NETWORK' || netErr.code === 'ECONNREFUSED')
    return 'Unable to reach the server. Please check your connection.'

  return 'An unexpected error occurred. Please try again.'
}

interface AuthState {
  user:            AuthUser | null
  accessToken:     string | null
  isAuthenticated: boolean
  isLoading:       boolean
  error:           string | null
}

interface AuthActions {
  login:              (email: string, password: string, product: Product) => Promise<void>
  logout:             () => Promise<void>
  refreshAccessToken: () => Promise<void>
  clearError:         () => void
  setAccessToken:     (token: string) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      login: async (email, password, product) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await axiosInstance.post<{
            user:        AuthUser
            accessToken: string
          }>('/api/auth/login', { email, password, product })

          // refreshToken set as httpOnly cookie by NestJS — not stored here
          set({
            user:            data.user,
            accessToken:     data.accessToken,
            isAuthenticated: true,
            isLoading:       false,
            error:           null,
          })
        } catch (err) {
          set({
            isLoading:       false,
            error:           extractErrorMessage(err),
            isAuthenticated: false,
          })
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post('/api/auth/logout')
        } catch {
          // Always clear local state regardless of server response
        } finally {
          set({
            user:            null,
            accessToken:     null,
            isAuthenticated: false,
            error:           null,
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

      clearError:     () => set({ error: null }),
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name:    'KingFisher Tech-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Never persist accessToken — security
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)