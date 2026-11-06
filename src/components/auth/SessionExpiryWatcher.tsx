import { useEffect, useRef } from 'react'
import { authService } from '@/features/auth/services/auth.service'
import {
  IDLE_ACTIVITY_EVENTS,
  IDLE_ACTIVITY_THROTTLE_MS,
  IDLE_SESSION_TOUCH_INTERVAL_MS,
} from '@/lib/idleSession'
import { accessTokenExpiresAtMs } from '@/lib/tenantFromAuth'
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore'
import {
  getSessionIdleMs,
  isSessionIdleExpired,
  useAuthStore,
} from '@/store/authStore'

function isSuperAdminSurface(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/superadmin')
}

/**
 * Idle timeout from GET /auth/me `idle_timeout_minutes` (fallback 20).
 * Based on last user activity (keydown/mousemove/click/…), not login wall-clock.
 * Token refresh alone does not reset idle. While active, POST /auth/session/touch
 * at most every ~5 minutes. Idle expiry soft-navigates to login (no hard reload).
 * ERP staff/tenant only — disabled on Super Admin surfaces.
 * Customer/Vendor portals use the same default idle via useIdleSessionLogout.
 */
export function SessionExpiryWatcher() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const lastActiveAt = useAuthStore((s) => s.lastActiveAt)
  const idleTimeoutMinutes = useAuthStore((s) => s.idleTimeoutMinutes)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isSuperAdmin = useSuperAdminAuthStore((s) => s.isAuthenticated)
  const idleTimerRef = useRef<number | null>(null)
  const jwtTimerRef = useRef<number | null>(null)
  const activityThrottleRef = useRef(0)
  const lastTouchPostRef = useRef(0)

  const erpIdleActive =
    isAuthenticated && !isSuperAdmin && !isSuperAdminSurface()

  useEffect(() => {
    if (!erpIdleActive) return

    const onActivity = () => {
      const now = Date.now()
      if (now - activityThrottleRef.current < IDLE_ACTIVITY_THROTTLE_MS) return
      activityThrottleRef.current = now
      useAuthStore.getState().touchSessionActivity()

      // Server idle clock — at most every ~5 minutes while the tab has activity.
      if (now - lastTouchPostRef.current >= IDLE_SESSION_TOUCH_INTERVAL_MS) {
        lastTouchPostRef.current = now
        void authService.touchSession().catch(() => {
          // 401 IDLE_TIMEOUT is handled by the axios interceptor.
        })
      }
    }

    for (const event of IDLE_ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }
    return () => {
      for (const event of IDLE_ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity)
      }
    }
  }, [erpIdleActive])

  useEffect(() => {
    const clearTimers = () => {
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
      if (jwtTimerRef.current != null) {
        window.clearTimeout(jwtTimerRef.current)
        jwtTimerRef.current = null
      }
    }

    clearTimers()

    if (!erpIdleActive) return clearTimers

    const idleMs = getSessionIdleMs()

    if (isSessionIdleExpired(lastActiveAt)) {
      useAuthStore.getState().markSessionExpired()
      return clearTimers
    }

    if (lastActiveAt) {
      const remaining = Math.max(0, lastActiveAt + idleMs - Date.now())
      idleTimerRef.current = window.setTimeout(() => {
        useAuthStore.getState().markSessionExpired()
      }, remaining)
    }

    // Silent JWT refresh while still active — does not reset idle activity.
    if (accessToken) {
      const expiresAt = accessTokenExpiresAtMs(accessToken)
      if (expiresAt != null) {
        const refreshSkewMs = 15_000
        const delay = Math.max(0, expiresAt - Date.now() - refreshSkewMs)
        jwtTimerRef.current = window.setTimeout(async () => {
          const state = useAuthStore.getState()
          if (!state.isAuthenticated) return
          if (useSuperAdminAuthStore.getState().isAuthenticated || isSuperAdminSurface()) return
          if (isSessionIdleExpired(state.lastActiveAt)) {
            state.markSessionExpired()
            return
          }
          if (!state.refreshToken) {
            state.softLogoutToLogin()
            return
          }
          try {
            await state.refreshAccessToken()
          } catch {
            // softLogoutToLogin / forceLogoutDueToInactivity handled inside refreshAccessToken
          }
        }, delay)
      }
    }

    return clearTimers
  }, [accessToken, lastActiveAt, idleTimeoutMinutes, erpIdleActive])

  return null
}
