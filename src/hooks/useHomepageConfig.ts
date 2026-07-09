import { useCallback, useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_HOMEPAGE_CONFIG } from '@/components/dashboard/defaultConfig'
import type {
  HomepageConfig,
  HomepageConfigPayload,
  HomepageConfigResponse,
  WidgetConfig,
} from '@/types/homepage.types'

interface UseHomepageConfigReturn {
  config:        HomepageConfig | null
  isLoading:     boolean
  error:         string | null
  saveConfig:    (payload: HomepageConfigPayload) => Promise<void>
  toggleWidget:  (widgetId: WidgetConfig['id'], visible: boolean) => Promise<void>
  setColumns:    (columns: HomepageConfig['columns']) => Promise<void>
}

export function useHomepageConfig(): UseHomepageConfigReturn {
  const { user } = useAuth()
  const [config, setConfig]     = useState<HomepageConfig | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  // ── Fetch on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    setError(null)

    axiosInstance
      .get<HomepageConfigResponse>(`/api/users/${user.id}/homepage-config`)
      .then(({ data }) => {
        if (data.config) {
          setConfig(data.config)
        } else {
          // Backend has no saved config — apply defaults with this user's id
          setConfig({ ...DEFAULT_HOMEPAGE_CONFIG, userId: user.id })
        }
      })
      .catch(() => {
        setError('Failed to load dashboard config. Using defaults.')
        setConfig({ ...DEFAULT_HOMEPAGE_CONFIG, userId: user.id })
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  // ── Persist to backend ────────────────────────────────────────────────
  const saveConfig = useCallback(
    async (payload: HomepageConfigPayload) => {
      if (!user?.id || !config) return

      // Optimistic update
      const prev = config
      setConfig((c) => c ? { ...c, ...payload } : c)

      try {
        const { data } = await axiosInstance.patch<{ config: HomepageConfig }>(
          `/api/users/${user.id}/homepage-config`,
          payload,
        )
        setConfig(data.config)
      } catch {
        // Revert on failure
        setConfig(prev)
        setError('Failed to save layout. Changes reverted.')
      }
    },
    [user?.id, config],
  )

  // ── Helper: toggle a single widget's visibility ────────────────────────
  const toggleWidget = useCallback(
    async (widgetId: WidgetConfig['id'], visible: boolean) => {
      if (!config) return
      const updatedWidgets = config.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible } : w,
      )
      await saveConfig({ widgets: updatedWidgets })
    },
    [config, saveConfig],
  )

  // ── Helper: change column count ────────────────────────────────────────
  const setColumns = useCallback(
    async (columns: HomepageConfig['columns']) => {
      await saveConfig({ columns })
    },
    [saveConfig],
  )

  return { config, isLoading, error, saveConfig, toggleWidget, setColumns }
}