import { apiClient } from "./client";
export { PROPERTY_TYPES } from "./property.api";
export const LEAD_STATUSES = ["New", "Contacted", "Closed"];
// ─── API ──────────────────────────────────────────────────────────────────────
export const leadApi = {
    list: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.search?.trim())
            qp.set("search", params.search.trim());
        if (params.status && params.status !== "all")
            qp.set("status", params.status);
        if (params.area && params.area !== "all")
            qp.set("area", params.area);
        if (params.propertyType && params.propertyType !== "all")
            qp.set("propertyType", params.propertyType);
        if (params.dateFrom)
            qp.set("dateFrom", params.dateFrom);
        if (params.dateTo)
            qp.set("dateTo", params.dateTo);
        if (params.page)
            qp.set("page", String(params.page));
        if (params.limit)
            qp.set("limit", String(params.limit));
        const qs = qp.toString();
        return apiClient.get(`/v1/admin/leads${qs ? `?${qs}` : ""}`);
    },
    getStats: () => apiClient.get("/v1/admin/leads/stats"),
    getFilterOptions: () => apiClient.get("/v1/admin/leads/filter-options"),
    getOne: (id) => apiClient.get(`/v1/admin/leads/${id}`),
    update: (id, payload) => apiClient.put(`/v1/admin/leads/${id}`, payload),
    updateStatus: (id, status) => apiClient.patch(`/v1/admin/leads/${id}/status`, { status }),
    delete: (id) => apiClient.delete(`/v1/admin/leads/${id}`),
};
