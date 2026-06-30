import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'green' | 'blue' | 'red'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'green',
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'fresa-theme' },
  ),
)