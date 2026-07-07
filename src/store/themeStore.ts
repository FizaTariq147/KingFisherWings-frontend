import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'default' | 'green' | 'blue' | 'red'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: 'KingFisher Tech-theme',

      migrate: (persisted) => {
        const state = persisted as ThemeState
        if (!state?.theme) return { theme: 'default' }
        return state
      },
      version: 1,
    },
  ),
)