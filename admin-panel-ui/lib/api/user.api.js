import { apiClient } from "./client";
export const userApi = {
    list: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.search?.trim())
            qp.set("search", params.search.trim());
        if (params.isActive && params.isActive !== "all")
            qp.set("isActive", params.isActive);
        if (params.page)
            qp.set("page", String(params.page));
        if (params.limit)
            qp.set("limit", String(params.limit));
        const qs = qp.toString();
        return apiClient.get(`/v1/admin/users${qs ? `?${qs}` : ""}`);
    },
    getStats: () => apiClient.get("/v1/admin/users/stats"),
    getOne: (id) => apiClient.get(`/v1/admin/users/${id}`),
    create: (payload) => apiClient.post("/v1/admin/users", payload),
    update: (id, payload) => apiClient.put(`/v1/admin/users/${id}`, payload),
    toggleStatus: (id) => apiClient.patch(`/v1/admin/users/${id}/status`),
    delete: (id) => apiClient.delete(`/v1/admin/users/${id}`),
    propLeadPlanQueryStats: (userId) => apiClient.get(`/v1/admin/users/${userId}/prop-lead-plan-query-stats`),
    getUserQueries: (userId, page = 1, limit = 10) => apiClient.get(`/v1/admin/users/${userId}/queries?page=${page}&limit=${limit}`),
    getUserLeads: (userId, page = 1, limit = 10) => apiClient.get(`/v1/admin/users/${userId}/leads?page=${page}&limit=${limit}`),
};
