import { create } from "zustand";
const DEFAULT_PAGINATION = {
    total: 0, page: 1, limit: 10, totalPages: 1,
};
export const useLeadStore = create()((set) => ({
    updatingIds: new Set(),
    pagination: DEFAULT_PAGINATION,
    setUpdating: (id, value) => set((s) => {
        const next = new Set(s.updatingIds);
        value ? next.add(id) : next.delete(id);
        return { updatingIds: next };
    }),
    setPagination: (meta) => set({ pagination: meta }),
}));
