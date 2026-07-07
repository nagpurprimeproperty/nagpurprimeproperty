import { create } from "zustand";
const DEFAULT_PAGINATION = {
    total: 0, page: 1, limit: 10, totalPages: 1,
};
export const useUserStore = create()((set) => ({
    togglingIds: new Set(),
    pagination: DEFAULT_PAGINATION,
    setToggling: (id, value) => set((s) => {
        const next = new Set(s.togglingIds);
        value ? next.add(id) : next.delete(id);
        return { togglingIds: next };
    }),
    setPagination: (meta) => set({ pagination: meta }),
}));
