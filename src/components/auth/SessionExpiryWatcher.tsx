import { useEffect, useRef } from 'react'
import { accessTokenExpiresAtMs } from '@/lib/tenantFromAuth'
import { useSuperAdminAuthStore } from '@/features/superadmin/store/superAdminAuthStore'
import {
  isSessionIdleExpired,
  SESSION_IDLE_MS,
  useAuthStore,
} from '@/store/authStore'

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

function isSuperAdminSurface(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/superadmin')
}

/**
 * Idle timeout is 60 minutes from last activity (not from login).
 * When idle expires, SessionExpiredModal offers Continue (no login) or Revoke.
 * ERP staff/tenant only — disabled on Super Admin surfaces.
 */
export function SessionExpiryWatcher() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const lastActiveAt = useAuthStore((s) => s.lastActiveAt)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sessionExpired = useAuthStore((s) => s.sessionExpired)
  const isSuperAdmin = useSuperAdminAuthStore((s) => s.isAuthenticated)
  const idleTimerRef = useRef<number | null>(null)
  const jwtTimerRef = useRef<number | null>(null)
  const activityThrottleRef = useRef(0)

  const erpIdleActive =
    isAuthenticated && !sessionExpired && !isSuperAdmin && !isSuperAdminSurface()

  useEffect(() => {
    if (!erpIdleActive) return

    const onActivity = () => {
      const now = Date.now()
      if (now - activityThrottleRef.current < 5_000) return
      activityThrottleRef.current = now
      useAuthStore.getState().touchSessionActivity()
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }
    return () => {
      for (const event of ACTIVITY_EVENTS) {
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

    if (isSessionIdleExpired(lastActiveAt)) {
      useAuthStore.getState().markSessionExpired()
      return clearTimers
    }

    if (lastActiveAt) {
      const remaining = Math.max(0, lastActiveAt + SESSION_IDLE_MS - Date.now())
      idleTimerRef.current = window.setTimeout(() => {
        useAuthStore.getState().markSessionExpired()
      }, remaining)
    }

    // Silent JWT refresh while still active (does not start a new idle clock by itself —
    // refreshAccessToken also touches lastActiveAt when successful).
    if (accessToken) {
      const expiresAt = accessTokenExpiresAtMs(accessToken)
      if (expiresAt != null) {
        const refreshSkewMs = 15_000
        const delay = Math.max(0, expiresAt - Date.now() - refreshSkewMs)
        jwtTimerRef.current = window.setTimeout(async () => {
          const state = useAuthStore.getState()
          if (state.sessionExpired || !state.isAuthenticated) return
          if (useSuperAdminAuthStore.getState().isAuthenticated || isSuperAdminSurface()) return
          if (isSessionIdleExpired(state.lastActiveAt)) {
            state.markSessionExpired()
            return
          }
          if (!state.refreshToken) {
            state.markSessionExpired()
            return
          }
          try {
            await state.refreshAccessToken()
          } catch {
            // markSessionExpired is called inside refreshAccessToken on failure
          }
        }, delay)
      }
    }

    return clearTimers
  }, [accessToken, lastActiveAt, erpIdleActive])

  return null
}
