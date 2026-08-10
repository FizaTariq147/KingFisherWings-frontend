import { useEffect, useRef, useState, type ReactNode, useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useAuthStore } from '@/store/authStore'
import { FullPageSpinner } from './SkeletonPrimitives'
import { AppMotionStyles } from '@/components/motion'

interface AuthLoadingGateProps {
  children: ReactNode
}

/**
 * Restores ERP session on boot (refresh token → access token → /auth/me),
 * and blocks the router until that finishes when a prior session exists.
 */
export function AuthLoadingGate({ children }: AuthLoadingGateProps) {
  const authCtx = useContext(AuthContext)
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const refreshAccessToken = useAuthStore((s) => s.refreshAccessToken)
  const restoringRef = useRef(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    if (restoringRef.current) return
    if (accessToken) return
    if (!isAuthenticated && !refreshToken) return

    restoringRef.current = true
    setRestoring(true)
    void refreshAccessToken().finally(() => {
      setRestoring(false)
    })
  }, [isAuthenticated, accessToken, refreshToken, refreshAccessToken])

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
