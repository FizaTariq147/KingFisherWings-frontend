import { useCallback, useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'
import type { AuditLogFilters, AuditLogPage } from '@/types/audit.types'

const PAGE_SIZE = 50

interface UseAuditLogsReturn {
  data:       AuditLogPage | null
  isLoading:  boolean
  error:      string | null
  page:       number
  filters:    AuditLogFilters
  setPage:    (p: number) => void
  setFilters: (f: AuditLogFilters) => void
  refetch:    () => void
}

export function useAuditLogs(): UseAuditLogsReturn {
  const [data, setData]         = useState<AuditLogPage | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [page, setPage]         = useState(1)
  const [filters, setFiltersRaw] = useState<AuditLogFilters>({})
  const [tick, setTick]         = useState(0)

  const setFilters = useCallback((f: AuditLogFilters) => {
    setFiltersRaw(f)
    setPage(1)
  }, [])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      page:     String(page),
      pageSize: String(PAGE_SIZE),
      ...(filters.userId   && { userId:   filters.userId }),
      ...(filters.action   && { action:   filters.action }),
      ...(filters.entity   && { entity:   filters.entity }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo   && { dateTo:   filters.dateTo }),
      ...(filters.search   && { search:   filters.search }),
    })

    axiosInstance
      .get<AuditLogPage>(`/api/audit-logs?${params}`)
      .then(({ data }) => { if (!cancelled) setData(data) })
      .catch(() => { if (!cancelled) setError('Failed to load audit logs.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [page, filters, tick])

  return { data, isLoading, error, page, filters, setPage, setFilters, refetch }
}