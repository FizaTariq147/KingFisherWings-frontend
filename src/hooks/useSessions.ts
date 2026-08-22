import { useCallback, useEffect, useState } from 'react'
import { authService } from '@/features/auth/services/auth.service'
import { normalizeActiveSessions } from '@/features/auth/utils/normalizeSessions'
import { accessTokenExpiresAtMs } from '@/lib/tenantFromAuth'
import { useAuthStore } from '@/store/authStore'
import type { ActiveSession } from '@/types/session.types'

interface UseSessionsReturn {
  sessions: ActiveSession[]
  isLoading: boolean
  error: string | null
  revoking: string | null
  refresh: () => void
  revokeById: (id: string) => Promise<void>
  logoutAll: () => Promise<void>
  loggingOutAll: boolean
}

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Request failed.'
  const axiosErr = error as {
    response?: { data?: { message?: string | string[] }; status?: number }
    message?: string
  }
  const status = axiosErr.response?.status
  const dataMessage = axiosErr.response?.data?.message
  if (Array.isArray(dataMessage) && dataMessage[0]) return String(dataMessage[0])
  if (typeof dataMessage === 'string' && dataMessage.trim()) return dataMessage
  if (status === 401) {
    return 'Your session expired. Sign in again, then retry revoke.'
  }
  if (typeof axiosErr.message === 'string' && axiosErr.message.trim()) {
    if (/status code 401/i.test(axiosErr.message)) {
      return 'Your session expired. Sign in again, then retry revoke.'
    }
    return axiosErr.message
  }
  return 'Request failed.'
}

async function ensureFreshAccessToken(): Promise<void> {
  const { accessToken, refreshToken, refreshAccessToken } = useAuthStore.getState()
  if (!refreshToken) return
  const expiresAt = accessToken ? accessTokenExpiresAtMs(accessToken) : null
  const needsRefresh =
    !accessToken || (expiresAt != null && expiresAt <= Date.now() + 15_000)
  if (!needsRefresh) return
  await refreshAccessToken()
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [loggingOutAll, setLoggingOutAll] = useState(false)
  const [tick, setTick] = useState(0)
  const storeLogoutAll = useAuthStore((s) => s.logoutAll)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    authService
      .listSessions()
      .then((data) => {
        if (cancelled) return
        const normalized = normalizeActiveSessions(data)
        setSessions(normalized)
        const current = normalized.find((session) => session.isCurrent)
        if (current?.id) {
          useAuthStore.setState({ sessionId: current.id })
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err) || 'Failed to load sessions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  const revokeById = useCallback(async (id: string) => {
    setRevoking(id)
    setError(null)
    const target = sessions.find((s) => s.id === id)
    const isCurrent = Boolean(target?.isCurrent)
    try {
      try {
        await ensureFreshAccessToken()
      } catch {
        // Interceptor may still refresh on the revoke call.
      }
      await authService.revokeSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (isCurrent) {
        await useAuthStore.getState().logout()
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (isCurrent && (status === 401 || status === 403)) {
        await useAuthStore.getState().logout()
        return
      }
      setError(getErrorMessage(err) || 'Failed to revoke session. Please try again.')
      throw err
    } finally {
      setRevoking(null)
    }
  }, [sessions])

  const logoutAll = useCallback(async () => {
    setLoggingOutAll(true)
    try {
      await storeLogoutAll()
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to log out of all devices.')
      setLoggingOutAll(false)
    }
  }, [storeLogoutAll])

  return {
    sessions,
    isLoading,
    error,
    revoking,
    refresh,
    revokeById,
    logoutAll,
    loggingOutAll,
  }
}
