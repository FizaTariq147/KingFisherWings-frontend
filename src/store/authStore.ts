import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '@/features/auth/services/auth.service'
import type {
  LoginDto,
  TenantLoginDto,
} from '@/features/auth/types/auth.api.types'
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth'
import { withGatewayRetry } from '@/lib/wakeApi'
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore'

export type Product =
  | 'KingFisher Tech Global'
  | 'KingFisher Tech Gold'
  | 'KingFisher Tech App'
  | 'KingFisher Tech Analytics'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  product: Product
  tenantId?: string
  companyId?: string
}

// ── Backend error response shape from NestJS ──────────────────────────────
interface BackendError {
  message: string | string[]
  error?: string
  statusCode: number
}

function extractErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'An unexpected error occurred.'

  // Prefer our own diagnostic Error messages (include slug/email tried).
  if (err instanceof Error && err.message.startsWith('Incorrect credentials for slug')) {
    return err.message
  }

  const axiosErr = err as { response?: { data?: BackendError | string; status?: number }; code?: string; message?: string }
  const status = axiosErr.response?.status
  const data = axiosErr.response?.data

  if (status === 502 || status === 504) {
    return 'The API gateway timed out (502). The Render backend may still be waking — wait ~30 seconds and try again (login will auto-retry).'
  }

  if (data && typeof data === 'object' && 'message' in data && data.message) {
    const msg = Array.isArray(data.message) ? data.message[0] : data.message

    if (status === 401) {
      if (typeof msg === 'string' && msg.toLowerCase().includes('locked'))
        return 'Your account has been locked due to too many failed attempts. Please contact your administrator.'
      if (typeof msg === 'string' && (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')))
        return 'Incorrect credentials. Use the Create Tenant workspace slug + temporary password (Tenant Admin tab). If you lost the password, create a new tenant — it is only shown once. Alternate: Staff / User tab with slug + admin email + same password. SuperAdmin: /superadmin/login.'
      if (typeof msg === 'string' && (msg.toLowerCase().includes('outside') || msg.toLowerCase().includes('hours')))
        return 'Login is not permitted outside your configured office hours.'
      if (typeof msg === 'string' && msg.toLowerCase().includes('ip'))
        return 'Login from this IP address is not permitted.'
      if (typeof msg === 'string' && msg.toLowerCase().includes('mac'))
        return 'Login from this device is not permitted.'
      return 'Authentication failed. Please check your credentials.'
    }
    if (status === 403) return 'You do not have permission to access this workspace.'
    if (status === 429) return 'Too many login attempts. Please wait a moment before trying again.'
    if (status === 503 || status === 0)
      return 'Unable to reach the server. Please check your connection.'

    return typeof msg === 'string' ? msg : 'Request failed.'
  }

  if (axiosErr.code === 'ERR_NETWORK' || axiosErr.code === 'ECONNREFUSED' || axiosErr.code === 'ECONNABORTED')
    return 'Unable to reach the server. Please check your connection, or wait if the API is cold-starting.'

  if (err instanceof Error && err.message) {
    if (/status code 502/i.test(err.message)) {
      return 'The API gateway timed out (502). The Render backend may be waking up — wait ~30 seconds and try again.'
    }
    return err.message
  }

  return 'An unexpected error occurred. Please try again.'
}

function toStoreUser(user: {
  id: string
  name: string
  email: string
  role: string
  tenantId?: string
  companyId?: string
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    product: 'KingFisher Tech Gold',
    tenantId: user.tenantId,
    companyId: user.companyId,
  }
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  loginTenant: (dto: TenantLoginDto) => Promise<void>
  loginStaff: (dto: LoginDto) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  clearError: () => void
  setAccessToken: (token: string) => void
  setTokens: (accessToken: string, refreshToken?: string | null) => void
  patchSessionUser: (partial: Partial<AuthUser>) => void
}

type AuthStore = AuthState & AuthActions

async function applyLoginSuccess(
  set: (partial: Partial<AuthState>) => void,
  result: Awaited<ReturnType<typeof authService.loginTenant>>,
) {
  useSuperAdminAuthStore.getState().logout()
  const tenantId =
    result.user.tenantId ||
    resolveSessionTenantIdFromAuth({
      accessToken: result.accessToken,
      user: result.user,
    }) ||
    undefined
  set({
    user: toStoreUser({ ...result.user, tenantId }),
    accessToken: result.accessToken,
    refreshToken: result.refreshToken || null,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      loginTenant: async (dto) => {
        set({ isLoading: true, error: null })
        // Drop any stale ERP session before credential login.
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: null,
        })
        try {
          // Prefer tenant-login; if optional email is present and that 401s, fall back to staff login.
          // Retry on Render 502 cold-starts.
          const result = await withGatewayRetry(() =>
            dto.email?.trim()
              ? authService.loginTenantAdmin({
                  tenant_slug: dto.tenant_slug,
                  email: dto.email,
                  password: dto.password,
                  remember_me: dto.remember_me,
                  device_name: dto.device_name,
                })
              : authService.loginTenant({
                  tenant_slug: dto.tenant_slug,
                  password: dto.password,
                  remember_me: dto.remember_me,
                  device_name: dto.device_name,
                }),
          )
          await applyLoginSuccess(set, result)
        } catch (err) {
          const slugHint = dto.tenant_slug?.trim()
            ? ` (tried slug "${dto.tenant_slug.trim().toLowerCase()}")`
            : ''
          set({
            isLoading: false,
            error: `${extractErrorMessage(err)}${slugHint}`,
            isAuthenticated: false,
          })
        }
      },

      loginStaff: async (dto) => {
        set({ isLoading: true, error: null })
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: null,
        })
        try {
          const result = await withGatewayRetry(() => authService.loginStaff(dto))
          await applyLoginSuccess(set, result)
        } catch (err) {
          set({
            isLoading: false,
            error: extractErrorMessage(err),
            isAuthenticated: false,
          })
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch {
          // Always clear local state regardless of server response
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
          window.location.href = '/login'
        }
      },

      logoutAll: async () => {
        try {
          await authService.logoutAll()
        } catch {
          // fall through to local clear
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
          window.location.href = '/login'
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) {
          await get().logout()
          return
        }
        try {
          const pair = await authService.refresh({ refresh_token: refreshToken })
          set({
            accessToken: pair.accessToken,
            refreshToken: pair.refreshToken || refreshToken,
          })
        } catch {
          await get().logout()
        }
      },

      clearError: () => set({ error: null }),
      setAccessToken: (token) => set({ accessToken: token }),
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          ...(refreshToken !== undefined ? { refreshToken: refreshToken || null } : {}),
        }),
      patchSessionUser: (partial) => {
        const current = get().user
        if (!current) {
          if (!partial.id || !partial.email) return
          set({
            user: {
              id: partial.id,
              name: partial.name || partial.email,
              email: partial.email,
              role: partial.role || 'TENANT_ADMIN',
              product: partial.product || 'KingFisher Tech Gold',
              tenantId: partial.tenantId,
              companyId: partial.companyId,
            },
          })
          return
        }
        set({
          user: {
            ...current,
            ...partial,
            product: partial.product || current.product,
          },
        })
      },
    }),
    {
      name: 'KingFisher Tech-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Persist refresh token for Swagger body refresh; never persist accessToken
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)

/** @deprecated Use loginTenant / loginStaff — kept for any stray imports during migration */
export type TenantLoginDtoAlias = TenantLoginDto
