import { useCallback, useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'
import {
  DEFAULT_OFFICE_HOURS,
  type LoginSecurityConfig,
  type LoginSecurityPayload,
  type LoginSecurityResponse,
} from '@/types/loginSecurity.types'

interface UseLoginSecurityReturn {
  config:    LoginSecurityConfig | null
  isLoading: boolean
  isSaving:  boolean
  error:     string | null
  saved:     boolean
  save:      (payload: LoginSecurityPayload) => Promise<void>
}

export function useLoginSecurity(userId: string): UseLoginSecurityReturn {
  const [config, setConfig]     = useState<LoginSecurityConfig | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [isSaving, setSaving]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    axiosInstance
      .get<LoginSecurityResponse>(`/api/users/${userId}/login-security`)
      .then(({ data }) => {
        if (!cancelled) setConfig(data.config)
      })
      .catch(() => {
        if (!cancelled) {
          // No existing config — use defaults
          setConfig({
            userId,
            ipRestrictionEnabled:  false,
            allowedIpRanges:       [],
            macRestrictionEnabled: false,
            allowedMacAddresses:   [],
            officeHoursEnabled:    false,
            officeHours:           DEFAULT_OFFICE_HOURS,
            timezone:              'Asia/Dubai',
            multiLoginAllowed:     true,
          })
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [userId])

  const save = useCallback(async (payload: LoginSecurityPayload) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const { data } = await axiosInstance.patch<LoginSecurityResponse>(
        `/api/users/${userId}/login-security`,
        payload,
      )
      setConfig(data.config)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save login security settings.')
    } finally {
      setSaving(false)
    }
  }, [userId])

  return { config, isLoading, isSaving, error, saved, save }
}