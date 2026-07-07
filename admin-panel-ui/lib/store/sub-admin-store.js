/**
 * Sub-Admin Store (Zustand)
 *
 * Responsibilities:
 *  - Track which sub-admin IDs are currently being toggled (loading indicator)
 *  - Cache the last pagination meta from the API
 *
 * All list/detail data lives in TanStack Query cache — Zustand is not
 * used as a data cache here to avoid duplication and stale-data bugs.
 */
import { create } from "zustand";
const DEFAULT_PAGINATION = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
};
export const useSubAdminStore = create()((set) => ({
    togglingIds: new Set(),
    pagination: DEFAULT_PAGINATION,
    setToggling: (id, value) => set((s) => {
        const next = new Set(s.togglingIds);
        value ? next.add(id) : next.delete(id);
        return { togglingIds: next };
    }),
    setPagination: (meta) => set({ pagination: meta }),
}));
