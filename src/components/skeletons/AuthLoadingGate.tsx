import { type ReactNode } from 'react'
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useAuthStore } from '@/store/authStore'
import { FullPageSpinner } from './SkeletonPrimitives'

interface AuthLoadingGateProps {
  children: ReactNode
}

/**
 * Wraps the root of the app.
 * Shows a full-page spinner during the initial /auth/me check so the
 * user never sees a flash of the login page while a valid session exists.
 *
 * Usage: wrap <RouterProvider /> with this inside main.tsx
 *   <AuthLoadingGate>
 *     <RouterProvider router={router} />
 *   </AuthLoadingGate>
 */
export function AuthLoadingGate({ children }: AuthLoadingGateProps) {
  const authCtx       = useContext(AuthContext)
  const hasToken      = !!useAuthStore.getState().accessToken

  // Only block render if:
  // 1. There's a token (returning user) AND
  // 2. AuthContext hasn't finished the /auth/me call yet
  // Without a token we can render immediately (new visitor → login page)
  if (hasToken && authCtx?.isLoading) {
    return <FullPageSpinner message="Restoring session…" />
  }

  return <>{children}</>
}