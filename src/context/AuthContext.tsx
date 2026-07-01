import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { axiosInstance } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser, PermissionKey } from '@/types/auth.types'

// ── Context shape ──────────────────────────────────────────────────────────
export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  /** Returns true if user has ALL of the given permissions */
  hasPermission: (...keys: PermissionKey[]) => boolean
  /** Returns true if user has ANY of the given permissions */
  hasAnyPermission: (...keys: PermissionKey[]) => boolean
  /** Returns true if user's role slug matches */
  hasRole: (roleSlug: string) => boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { accessToken, logout: storeLogout } = useAuthStore()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetchedRef = useRef(false)

  // Fetch /auth/me on mount (or when token changes) to get full user object
  // with tenantId, role, and permissions[] from the backend
  useEffect(() => {
    if (!accessToken) {
      setUser(null)
      setIsLoading(false)
      fetchedRef.current = false
      return
    }

    // Avoid double-fetch in React StrictMode
    if (fetchedRef.current) return
    fetchedRef.current = true

    setIsLoading(true)
    axiosInstance
      .get<AuthUser>('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        // Token invalid / expired — clear everything
        setUser(null)
        storeLogout()
      })
      .finally(() => setIsLoading(false))
  }, [accessToken, storeLogout])

  const hasPermission = useCallback(
    (...keys: PermissionKey[]) => {
      if (!user) return false
      return keys.every((k) => user.permissions.includes(k))
    },
    [user],
  )

  const hasAnyPermission = useCallback(
    (...keys: PermissionKey[]) => {
      if (!user) return false
      return keys.some((k) => user.permissions.includes(k))
    },
    [user],
  )

  const hasRole = useCallback(
    (roleSlug: string) => user?.role.slug === roleSlug,
    [user],
  )

  const logout = useCallback(async () => {
    await storeLogout()
    setUser(null)
  }, [storeLogout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      hasPermission,
      hasAnyPermission,
      hasRole,
      logout,
    }),
    [user, isLoading, hasPermission, hasAnyPermission, hasRole, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}