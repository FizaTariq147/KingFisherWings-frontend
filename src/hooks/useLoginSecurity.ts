import { useCallback, useEffect, useState } from 'react'
import { userService } from '@/features/users/services/user.service'
import { getErrorMessage } from '@/features/users/utils/getErrorMessage'
import type { User } from '@/features/users/types/user.types'
import {
  DEFAULT_OFFICE_HOURS,
  type LoginSecurityConfig,
  type LoginSecurityPayload,
} from '@/types/loginSecurity.types'

interface UseLoginSecurityReturn {
  config:    LoginSecurityConfig | null
  isLoading: boolean
  isSaving:  boolean
  error:     string | null
  saved:     boolean
  save:      (payload: LoginSecurityPayload) => Promise<void>
}

function configFromUser(user: User): LoginSecurityConfig {
  const ips = user.allowed_ips ?? []
  const macs = user.allowed_mac_addresses ?? []
  const start = user.office_hours_start?.trim() || ''
  const end = user.office_hours_end?.trim() || ''
  const hoursEnabled = Boolean(start && end)
  return {
    userId: user.id,
    ipRestrictionEnabled: ips.length > 0,
    allowedIpRanges: ips,
    macRestrictionEnabled: macs.length > 0,
    allowedMacAddresses: macs,
    officeHoursEnabled: hoursEnabled,
    officeHours: DEFAULT_OFFICE_HOURS.map((day) => ({
      ...day,
      start: start || day.start,
      end: end || day.end,
      enabled: hoursEnabled ? !['SAT', 'SUN'].includes(day.day) : day.enabled,
    })),
    timezone: user.office_hours_timezone || 'Asia/Dubai',
    multiLoginAllowed:
      user.single_device_login === true ? false : (user.max_concurrent_sessions ?? 3) > 1,
  }
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

    userService
      .getById('', userId)
      .then((user) => {
        if (!cancelled) setConfig(configFromUser(user))
      })
      .catch(() => {
        if (!cancelled) {
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
      const enabledDay = payload.officeHours.find((day) => day.enabled)
      const user = await userService.update('', userId, {
        allowed_ips: payload.ipRestrictionEnabled ? payload.allowedIpRanges : [],
        allowed_mac_addresses: payload.macRestrictionEnabled ? payload.allowedMacAddresses : [],
        office_hours_start: payload.officeHoursEnabled
          ? (enabledDay?.start || '09:00')
          : '',
        office_hours_end: payload.officeHoursEnabled
          ? (enabledDay?.end || '18:00')
          : '',
        office_hours_timezone: payload.timezone,
        max_concurrent_sessions: payload.multiLoginAllowed ? 3 : 1,
        single_device_login: !payload.multiLoginAllowed,
      })
      setConfig(configFromUser(user))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to save login security settings.')
    } finally {
      setSaving(false)
    }
  }, [userId])

  return { config, isLoading, isSaving, error, saved, save }
}
