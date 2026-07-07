import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUIStore = create()(persist((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}), {
    name: 'ui-store',
}));
