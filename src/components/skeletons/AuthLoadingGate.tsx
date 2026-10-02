import { useEffect, useRef, useState, type ReactNode, useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { FullPageSpinner } from './SkeletonPrimitives'
import { AppMotionStyles } from '@/components/motion'
import { hasErpSignOutFlag, useAuthStore } from '@/store/authStore'


interface AuthLoadingGateProps {
  children: ReactNode
}

function isSuperAdminSurface(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/superadmin')
}

function isExternalPortalSurface(): boolean {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname
  return path.startsWith('/portal') || path.startsWith('/vendor')
}

/**
 * Restores ERP session on boot (refresh token → access token → /auth/me),
 * and blocks the router until that finishes when a prior session exists.
 * Super Admin / customer portal / vendor portal bypass ERP boot — separate auth flows.
 */
export function AuthLoadingGate({ children }: AuthLoadingGateProps) {
  const authCtx = useContext(AuthContext)
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const storeAuthenticated = isAuthenticated && Boolean(accessToken)
  const refreshAccessToken = useAuthStore((s) => s.refreshAccessToken)
  const clearSession = useAuthStore((s) => s.clearSession)
  const restoringRef = useRef(false)
  const [restoring, setRestoring] = useState(false)
  const bypassErpBoot = isSuperAdminSurface() || isExternalPortalSurface()

  useEffect(() => {
    if (bypassErpBoot) {
      if (isAuthenticated || refreshToken) clearSession()
      return
    }

    // Revoke / logout set a flag before redirect so a late persist write cannot
    // rehydrate and restore the session on the login page. Keep the flag until
    // persist onRehydrateStorage consumes it (merge discards the blob first).
    if (hasErpSignOutFlag()) {
      clearSession()
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
    bypassErpBoot,
    isAuthenticated,
    accessToken,
    refreshToken,
    refreshAccessToken,
    clearSession,
  ])

  if (bypassErpBoot) {
    return <>{children}</>
  }

  const waitingForMe =
    Boolean(accessToken) && (!authCtx?.user || Boolean(authCtx?.isLoading))
  const waitingForStoreSession = storeAuthenticated && !accessToken

  if (restoring || waitingForMe || waitingForStoreSession) {
    return (
      <>
        <AppMotionStyles />
        <FullPageSpinner message="Restoring session…" />
      </>
    )
  }

  return <>{children}</>
}
