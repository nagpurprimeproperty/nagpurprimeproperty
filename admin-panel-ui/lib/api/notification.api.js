import { apiClient } from "@/lib/api/client";
export const notificationApi = {
    list: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.status)
            qp.set("status", params.status);
        if (params.type)
            qp.set("type", params.type);
        if (params.page)
            qp.set("page", String(params.page));
        if (params.limit)
            qp.set("limit", String(params.limit));
        if (params.unreadOnly)
            qp.set("unreadOnly", "true");
        const qs = qp.toString();
        return apiClient.get(`/v1/admin/notifications${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => apiClient.get(`/v1/admin/notifications/${id}`),
    create: (payload) => apiClient.post("/v1/admin/notifications", payload),
    update: (id, payload) => apiClient.patch(`/v1/admin/notifications/${id}`, payload),
    delete: (id) => apiClient.delete(`/v1/admin/notifications/${id}`),
    markAsRead: (id) => apiClient.patch(`/v1/admin/notifications/${id}/read`, {}),
    markAllAsRead: () => apiClient.patch("/v1/admin/notifications/read", { markAll: true }),
    getStats: () => apiClient.get("/v1/admin/notifications/stats"),
    sendPush: (payload) => apiClient.post("/v1/admin/notifications/send", payload),
    // ── User notifications ───────────────────────────────────────────
    userList: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.status)
            qp.set("status", params.status);
        if (params.type)
            qp.set("type", params.type);
        if (params.page)
            qp.set("page", String(params.page));
        if (params.limit)
            qp.set("limit", String(params.limit));
        const qs = qp.toString();
        return apiClient.get(`/v1/user/notifications${qs ? `?${qs}` : ""}`);
    },
    userMarkAsRead: (payload) => apiClient.patch("/v1/user/notifications/read", payload),
    userGetStats: () => apiClient.get("/v1/user/notifications/stats"),
};
