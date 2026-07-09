// PASTE THIS AT: src/features/superadmin/store/superAdminUiStore.ts
// UI-only state for this feature — session/auth still lives in your real
// auth store, this is just things like sidebar collapse state.

import { create } from 'zustand';

interface SuperAdminUiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useSuperAdminUiStore = create<SuperAdminUiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
