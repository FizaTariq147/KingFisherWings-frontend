import { useCallback, useEffect, useState } from 'react'
import { authService } from '@/features/auth/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import type { ActiveSession, SessionListResponse } from '@/types/session.types'

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

function normalizeSessions(raw: unknown): ActiveSession[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as ActiveSession[]
  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    if (Array.isArray(record.sessions)) return record.sessions as ActiveSession[]
    if (Array.isArray(record.data)) return record.data as ActiveSession[]
    if (record.data && typeof record.data === 'object') {
      const nested = record.data as SessionListResponse
      if (Array.isArray(nested.sessions)) return nested.sessions
    }
  }
  return []
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
        if (!cancelled) setSessions(normalizeSessions(data))
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load sessions.')
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
    try {
      await authService.revokeSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError('Failed to revoke session. Please try again.')
    } finally {
      setRevoking(null)
    }
  }, [])

  const logoutAll = useCallback(async () => {
    setLoggingOutAll(true)
    try {
      await storeLogoutAll()
    } catch {
      setError('Failed to log out of all devices.')
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
