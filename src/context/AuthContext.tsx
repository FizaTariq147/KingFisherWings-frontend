import {
  createContext, useCallback, useEffect,
  useMemo, useRef, useState, type ReactNode,
} from 'react'
import { axiosInstance } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser, PermissionKey } from '@/types/auth.types'

export interface AuthContextValue {
  user:             AuthUser | null
  isAuthenticated:  boolean
  isLoading:        boolean
  hasPermission:    (...keys: PermissionKey[]) => boolean
  hasAnyPermission: (...keys: PermissionKey[]) => boolean
  hasRole:          (roleSlug: string) => boolean
  logout:           () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

// ── DEV-ONLY bypass — mirrors the flag in ProtectedRoute.tsx ───────────────
const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true'

const MOCK_USER: AuthUser = {
  id:          'dev-user-1',
  name:        'Dev User',
  email:       'dev@kingfisherwings.com',
  role:        { slug: 'admin' } as AuthUser['role'],
  permissions: [] as PermissionKey[], // add specific keys here if you need to test gated menus
} as AuthUser

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, logout: storeLogout } = useAuthStore()
  const [user, setUser]       = useState<AuthUser | null>(DEV_BYPASS_AUTH ? MOCK_USER : null)
  const [isLoading, setLoading] = useState(!DEV_BYPASS_AUTH)
  const fetchedRef            = useRef(false)

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return // skip the real /auth/me fetch entirely

    if (!accessToken) {
      setUser(null)
      setLoading(false)
      fetchedRef.current = false
      return
    }
    if (fetchedRef.current) return
    fetchedRef.current = true

    setLoading(true)
    axiosInstance
      .get<AuthUser>('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        setUser(null)
        storeLogout()
      })
      .finally(() => setLoading(false))
  }, [accessToken, storeLogout])

  const hasPermission    = useCallback((...keys: PermissionKey[]) =>
    DEV_BYPASS_AUTH ? true : (!!user && keys.every((k) => user.permissions.includes(k))), [user])

  const hasAnyPermission = useCallback((...keys: PermissionKey[]) =>
    DEV_BYPASS_AUTH ? true : (!!user && keys.some((k) => user.permissions.includes(k))), [user])

  const hasRole = useCallback((slug: string) =>
    DEV_BYPASS_AUTH ? true : user?.role.slug === slug, [user])

  const logout = useCallback(async () => {
    await storeLogout()
    setUser(null)
  }, [storeLogout])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: DEV_BYPASS_AUTH ? true : !!user,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasRole,
    logout,
  }), [user, isLoading, hasPermission, hasAnyPermission, hasRole, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}