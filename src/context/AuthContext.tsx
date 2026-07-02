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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, logout: storeLogout } = useAuthStore()
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [isLoading, setLoading] = useState(true)
  const fetchedRef            = useRef(false)

  useEffect(() => {
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
        // /auth/me failed — token invalid or expired
        // refreshAccessToken already tried via interceptor, still failed
        setUser(null)
        storeLogout()
      })
      .finally(() => setLoading(false))
  }, [accessToken, storeLogout])

  const hasPermission    = useCallback((...keys: PermissionKey[]) =>
    !!user && keys.every((k) => user.permissions.includes(k)), [user])

  const hasAnyPermission = useCallback((...keys: PermissionKey[]) =>
    !!user && keys.some((k) => user.permissions.includes(k)), [user])

  const hasRole = useCallback((slug: string) =>
    user?.role.slug === slug, [user])

  const logout = useCallback(async () => {
    await storeLogout()
    setUser(null)
  }, [storeLogout])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasRole,
    logout,
  }), [user, isLoading, hasPermission, hasAnyPermission, hasRole, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}