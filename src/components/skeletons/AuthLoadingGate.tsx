import { useEffect, useRef, useState, type ReactNode, useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useAuthStore } from '@/store/authStore'
import { FullPageSpinner } from './SkeletonPrimitives'
import { AppMotionStyles } from '@/components/motion'

interface AuthLoadingGateProps {
  children: ReactNode
}

function isSuperAdminSurface(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/superadmin')
}

/**
 * Restores ERP session on boot (refresh token → access token → /auth/me),
 * and blocks the router until that finishes when a prior session exists.
 * Super Admin routes bypass ERP boot entirely — platform login is a separate auth flow.
 */
export function AuthLoadingGate({ children }: AuthLoadingGateProps) {
  const authCtx = useContext(AuthContext)
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const refreshAccessToken = useAuthStore((s) => s.refreshAccessToken)
  const clearSession = useAuthStore((s) => s.clearSession)
  const restoringRef = useRef(false)
  const [restoring, setRestoring] = useState(false)
  const superAdminSurface = isSuperAdminSurface()

  useEffect(() => {
    if (superAdminSurface) {
      if (isAuthenticated || refreshToken) clearSession()
      return
    }

    if (restoringRef.current) return
    if (accessToken) return
    if (!isAuthenticated && !refreshToken) return

    restoringRef.current = true
    setRestoring(true)
    void refreshAccessToken().finally(() => {
      setRestoring(false)
    })
  }, [
    superAdminSurface,
    isAuthenticated,
    accessToken,
    refreshToken,
    refreshAccessToken,
    clearSession,
  ])

  if (superAdminSurface) {
    return <>{children}</>
  }

  const waitingForMe = !!accessToken && !!authCtx?.isLoading
  if (restoring || waitingForMe) {
    return (
      <>
        <AppMotionStyles />
        <FullPageSpinner message="Restoring session…" />
      </>
    )
  }

  return <>{children}</>
}
