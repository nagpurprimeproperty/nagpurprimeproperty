import { apiClient } from "@/lib/api/client";
export const plansApi = {
    list: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.isActive && params.isActive !== "all")
            qp.set("isActive", params.isActive);
        if (params.page)
            qp.set("page", String(params.page));
        if (params.limit)
            qp.set("limit", String(params.limit));
        const qs = qp.toString();
        return apiClient.get(`/v1/admin/plans${qs ? `?${qs}` : ""}`);
    },
    getStats: () => apiClient.get("/v1/admin/plans/stats"),
    getOne: (id) => apiClient.get(`/v1/admin/plans/${id}`),
    create: (payload) => apiClient.post("/v1/admin/plans", payload),
    update: (id, payload) => apiClient.put(`/v1/admin/plans/${id}`, payload),
    toggleStatus: (id) => apiClient.patch(`/v1/admin/plans/${id}/status`),
    delete: (id) => apiClient.delete(`/v1/admin/plans/${id}`),
};
