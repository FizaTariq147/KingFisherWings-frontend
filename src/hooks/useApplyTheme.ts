import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export function useApplyTheme() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}