import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'default' | 'theme-blue' | 'theme-red';

interface UIStore {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      activeModule: 'dashboard',
      setActiveModule: (module) => set({ activeModule: module }),
      theme: 'default',
      setTheme: (theme) => {
        // Remove all theme classes, apply new one
        document.documentElement.classList.remove('theme-blue', 'theme-red');
        if (theme !== 'default') {
          document.documentElement.classList.add(theme);
        }
        set({ theme });
      },
    }),
    { name: 'KingFisher Tech-ui' }
  )
);