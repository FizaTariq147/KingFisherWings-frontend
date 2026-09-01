import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '@/features/auth/services/auth.service'
import type {
  LoginDto,
  TenantLoginDto,
} from '@/features/auth/types/auth.api.types'
import {
  resolveSessionTenantIdFromAuth,
  sessionIdFromAccessToken,
} from '@/lib/tenantFromAuth'
import { withGatewayRetry } from '@/lib/wakeApi'
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore'
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore'
import { clearPortalQueryCache } from '@/features/portal-shared/clearPortalQueryCache'
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore'
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache'

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
  /** Staff users with a temporary password must set their own before using the app. */
  mustChangePassword?: boolean
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
        return 'Incorrect credentials. Staff / User: POST /auth/login needs slug + email + password. Tenant Admin: POST /auth/tenant-login needs slug + password only. SuperAdmin: /superadmin/login.'
      if (typeof msg === 'string' && (msg.toLowerCase().includes('outside') || msg.toLowerCase().includes('hours')))
        return 'Login is not permitted outside your configured office hours.'
      if (typeof msg === 'string' && msg.toLowerCase().includes('ip'))
        return 'Login from this IP address is not permitted.'
      if (typeof msg === 'string' && msg.toLowerCase().includes('mac'))
        return 'Login from this device is not permitted.'
      return 'Authentication failed. Please check your credentials.'
    }
    if (status === 403) {
      return 'You do not have permission to access this workspace.'
    }
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
  mustChangePassword?: boolean
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    product: 'KingFisher Tech Gold',
    tenantId: user.tenantId,
    companyId: user.companyId,
    mustChangePassword: Boolean(user.mustChangePassword),
  }
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  /** Current auth session id for POST /auth/sessions/{sessionId}/revoke */
  sessionId: string | null
  /** Epoch ms of last user activity — idle timeout is based on this, not login. */
  lastActiveAt: number | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  /** True when idle timeout or refresh failed — show SessionExpiredModal. */
  sessionExpired: boolean
  /** GET /auth/me blocked the tenant (e.g. subscription expired) — keep login session. */
  subscriptionBlocked: boolean
  subscriptionMessage: string | null
  /** Protected ERP APIs returned REQUIRES_2FA_SETUP after login. */
  erpAccessBlocked: boolean
  erpAccessMessage: string | null
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
  clearMustChangePassword: () => void
  touchSessionActivity: () => void
  markSessionExpired: () => void
  setSubscriptionBlocked: (message: string | null) => void
  setErpAccessBlocked: (message: string | null) => void
  /** Continue after idle expiry — refresh tokens, stay signed in (no login). */
  continueExpiredSession: () => Promise<void>
  /** POST /auth/sessions/{id}/revoke then clear and go to login. */
  revokeExpiredSessionAndLogin: () => Promise<void>
  /** Clear ERP staff/tenant session (e.g. when entering Super Admin). */
  clearSession: () => void
}

type AuthStore = AuthState & AuthActions

/** Idle timeout — inactivity only (not counted from login). */
export const SESSION_IDLE_MS = 60 * 60 * 1000

export function isSessionIdleExpired(lastActiveAt: number | null | undefined): boolean {
  if (!lastActiveAt || !Number.isFinite(lastActiveAt)) return false
  return Date.now() - lastActiveAt >= SESSION_IDLE_MS
}

async function applyLoginSuccess(
  set: (partial: Partial<AuthState>) => void,
  result: Awaited<ReturnType<typeof authService.loginTenant>>,
) {
  useSuperAdminAuthStore.getState().logout()
  usePortalAuthStore.getState().logout()
  clearPortalQueryCache()
  useVendorAuthStore.getState().logout()
  clearVendorQueryCache()
  const tenantId =
    result.user.tenantId ||
    resolveSessionTenantIdFromAuth({
      accessToken: result.accessToken,
      user: result.user,
    }) ||
    undefined
  const sessionId =
    result.sessionId || sessionIdFromAccessToken(result.accessToken) || null
  set({
    user: toStoreUser({ ...result.user, tenantId }),
    accessToken: result.accessToken,
    refreshToken: result.refreshToken || null,
    sessionId,
    lastActiveAt: Date.now(),
    isAuthenticated: true,
    isLoading: false,
    error: null,
    sessionExpired: false,
    subscriptionBlocked: false,
    subscriptionMessage: null,
    erpAccessBlocked: false,
    erpAccessMessage: null,
  })

  // Best-effort: bind real sessions-table id for POST /auth/sessions/{id}/revoke
  void authService.resolveCurrentSessionId().then((resolved) => {
    if (resolved) useAuthStore.setState({ sessionId: resolved })
  })
}

function clearAuthState(): Partial<AuthState> {
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    sessionId: null,
    lastActiveAt: null,
    isAuthenticated: false,
    error: null,
    sessionExpired: false,
    subscriptionBlocked: false,
    subscriptionMessage: null,
    erpAccessBlocked: false,
    erpAccessMessage: null,
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      lastActiveAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpired: false,
      subscriptionBlocked: false,
      subscriptionMessage: null,
      erpAccessBlocked: false,
      erpAccessMessage: null,

      loginTenant: async (dto) => {
        set({
          isLoading: true,
          error: null,
          sessionExpired: false,
          subscriptionBlocked: false,
          subscriptionMessage: null,
          erpAccessBlocked: false,
          erpAccessMessage: null,
        })
        set({
          accessToken: null,
          refreshToken: null,
          sessionId: null,
          lastActiveAt: null,
          isAuthenticated: false,
          user: null,
        })
        try {
          // AuthController_tenantLogin — slug + password only (Swagger TenantLoginDto)
          const result = await withGatewayRetry(() =>
            authService.loginTenant({
              tenant_slug: dto.tenant_slug,
              password: dto.password,
              remember_me: dto.remember_me,
              device_name: dto.device_name,
            }),
          )
          await applyLoginSuccess(set, result)
        } catch (err) {
          const slugHint = dto.tenant_slug?.trim()
            ? ` (Tenant Admin — tried slug "${dto.tenant_slug.trim().toLowerCase()}")`
            : ''
          set({
            isLoading: false,
            error: `${extractErrorMessage(err)}${slugHint}`,
            isAuthenticated: false,
          })
        }
      },

      loginStaff: async (dto) => {
        set({
          isLoading: true,
          error: null,
          sessionExpired: false,
          subscriptionBlocked: false,
          subscriptionMessage: null,
          erpAccessBlocked: false,
          erpAccessMessage: null,
        })
        set({
          accessToken: null,
          refreshToken: null,
          sessionId: null,
          lastActiveAt: null,
          isAuthenticated: false,
          user: null,
        })
        try {
          // AuthController_login — slug + email + password (Swagger LoginDto)
          const result = await withGatewayRetry(() =>
            authService.loginStaff({
              tenant_slug: dto.tenant_slug,
              email: dto.email,
              password: dto.password,
              remember_me: dto.remember_me,
              device_name: dto.device_name,
              mac_address: dto.mac_address,
            }),
          )
          await applyLoginSuccess(set, result)
        } catch (err) {
          const slug = dto.tenant_slug?.trim().toLowerCase() || ''
          const email = dto.email?.trim().toLowerCase() || ''
          const hint =
            slug || email
              ? ` (Staff / User — tried slug "${slug}"` +
                (email ? `, email "${email}"` : '') +
                ')'
              : ' (Staff / User)'
          set({
            isLoading: false,
            error: `${extractErrorMessage(err)}${hint}`,
            isAuthenticated: false,
          })
        }
      },

      logout: async () => {
        const accessToken = get().accessToken
        try {
          if (accessToken) {
            await authService.logout()
          }
        } catch {
          // Always clear local state regardless of server response
        } finally {
          set(clearAuthState())
          window.location.href = '/login'
        }
      },

      logoutAll: async () => {
        const accessToken = get().accessToken
        try {
          if (accessToken) {
            await authService.logoutAll()
          }
        } catch {
          // fall through to local clear
        } finally {
          set(clearAuthState())
          window.location.href = '/login'
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) {
          get().markSessionExpired()
          throw new Error('Session expired. Please sign in again.')
        }
        try {
          const pair = await authService.refresh({ refresh_token: refreshToken })
          const sessionId =
            pair.sessionId ||
            sessionIdFromAccessToken(pair.accessToken) ||
            get().sessionId
          set({
            accessToken: pair.accessToken,
            refreshToken: pair.refreshToken || refreshToken,
            sessionId,
            sessionExpired: false,
          })
        } catch (err) {
          if (get().sessionExpired) throw err
          get().markSessionExpired()
          throw new Error('Session expired. Please sign in again.')
        }
      },

      clearError: () => set({ error: null }),
      setAccessToken: (token) =>
        set({
          accessToken: token,
          sessionId: sessionIdFromAccessToken(token) || get().sessionId,
        }),
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          ...(refreshToken !== undefined ? { refreshToken: refreshToken || null } : {}),
          sessionId: sessionIdFromAccessToken(accessToken) || get().sessionId,
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
              mustChangePassword: Boolean(partial.mustChangePassword),
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

      clearMustChangePassword: () => {
        const current = get().user
        if (!current?.mustChangePassword) return
        set({ user: { ...current, mustChangePassword: false } })
      },

      touchSessionActivity: () => {
        if (!get().isAuthenticated || get().sessionExpired) return
        set({ lastActiveAt: Date.now() })
      },

      markSessionExpired: () => {
        if (get().sessionExpired) return
        set({
          sessionExpired: true,
          // Keep tokens/sessionId so Continue / Revoke can run without login.
        })
      },

      setSubscriptionBlocked: (message) => {
        set({
          subscriptionBlocked: Boolean(message),
          subscriptionMessage: message,
        })
      },

      setErpAccessBlocked: (message) => {
        set({
          erpAccessBlocked: Boolean(message),
          erpAccessMessage: message,
        })
      },

      continueExpiredSession: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) {
          throw new Error('Session cannot be continued. Sign in again.')
        }
        const pair = await authService.refresh({ refresh_token: refreshToken })
        let sessionId =
          pair.sessionId ||
          sessionIdFromAccessToken(pair.accessToken) ||
          get().sessionId
        set({
          accessToken: pair.accessToken,
          refreshToken: pair.refreshToken || refreshToken,
          sessionId,
          lastActiveAt: Date.now(),
          sessionExpired: false,
          isAuthenticated: true,
        })
        try {
          const resolved = await authService.resolveCurrentSessionId()
          if (resolved) set({ sessionId: resolved })
        } catch {
          // Keep JWT/login session id.
        }
      },

      revokeExpiredSessionAndLogin: async () => {
        const { sessionId, refreshToken } = get()
        try {
          // Always refresh first — idle modal often still has an expired access token in memory.
          if (refreshToken) {
            try {
              const pair = await authService.refresh({ refresh_token: refreshToken })
              set({
                accessToken: pair.accessToken,
                refreshToken: pair.refreshToken || refreshToken,
                sessionId:
                  pair.sessionId ||
                  sessionIdFromAccessToken(pair.accessToken) ||
                  sessionId,
              })
            } catch {
              // Continue with best-effort revoke / local sign-out.
            }
          }

          try {
            await authService.revokeCurrentSession(get().sessionId)
          } catch {
            // Best-effort: user chose to leave; clear local session even if API rejects.
          }
        } finally {
          set(clearAuthState())
          window.location.href = '/login'
        }
      },

      clearSession: () => {
        set(clearAuthState())
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
        sessionId: state.sessionId,
        lastActiveAt: state.lastActiveAt,
        sessionExpired: state.sessionExpired,
      }),
    },
  ),
)

/** @deprecated Use loginTenant / loginStaff — kept for any stray imports during migration */
export type TenantLoginDtoAlias = TenantLoginDto
