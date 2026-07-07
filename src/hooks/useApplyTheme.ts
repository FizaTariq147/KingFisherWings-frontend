import { useEffect } from 'react'
import { useThemeStore, type Theme } from '../store/themeStore'

const THEME_CLASSES: Record<Theme, string | null> = {
  default: null, // base :root — no class needed
  green: 'theme-green',
  blue: 'theme-blue',
  red: 'theme-red',
}

export function useApplyTheme() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    Object.values(THEME_CLASSES).forEach((cls) => {
      if (cls) root.classList.remove(cls)
    })
    const cls = THEME_CLASSES[theme]
    if (cls) root.classList.add(cls)
    root.dataset.theme = theme
  }, [theme])
}