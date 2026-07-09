import { useCallback, useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'
import type { ActiveSession, SessionListResponse } from '@/types/session.types'

interface UseSessionsReturn {
  sessions:    ActiveSession[]
  isLoading:   boolean
  error:       string | null
  revoking:    string | null   // session id currently being revoked
  refresh:     () => void
  revokeById:  (id: string) => Promise<void>
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions]   = useState<ActiveSession[]>([])
  const [isLoading, setLoading]   = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [revoking, setRevoking]   = useState<string | null>(null)
  const [tick, setTick]           = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    axiosInstance
      .get<SessionListResponse>('/api/auth/sessions')
      .then(({ data }) => {
        if (!cancelled) setSessions(data.sessions)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load sessions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  const revokeById = useCallback(async (id: string) => {
    setRevoking(id)
    try {
      await axiosInstance.delete(`/api/auth/sessions/${id}`)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError('Failed to revoke session. Please try again.')
    } finally {
      setRevoking(null)
    }
  }, [])

  return { sessions, isLoading, error, revoking, refresh, revokeById }
}