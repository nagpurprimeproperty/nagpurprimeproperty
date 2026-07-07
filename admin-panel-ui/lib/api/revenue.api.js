import { apiClient } from "./client";
// ─── API functions ─────────────────────────────────────────────────────────────
export const revenueApi = {
    /** GET /api/v1/admin/revenue/stats */
    getStats: () => apiClient.get("/v1/admin/revenue/stats"),
    /** GET /api/v1/admin/revenue/monthly */
    getMonthlyRevenue: () => apiClient.get("/v1/admin/revenue/monthly"),
    /** GET /api/v1/admin/revenue/by-plan */
    getSubscriptionsByPlan: () => apiClient.get("/v1/admin/revenue/by-plan"),
    /** GET /api/v1/admin/revenue/plan-breakdown */
    getPlanBreakdown: () => apiClient.get("/v1/admin/revenue/plan-breakdown"),
    /** GET /api/v1/admin/revenue/transaction-stats */
    getTransactionStats: () => apiClient.get("/v1/admin/revenue/transaction-stats"),
    /** GET /api/v1/admin/revenue/transactions */
    getTransactions: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.search?.trim())
            qp.set("search", params.search.trim());
        if (params.status && params.status !== "all")
            qp.set("status", params.status);
        if (params.page)
            qp.set("page", String(params.page));
        if (params.limit)
            qp.set("limit", String(params.limit));
        const qs = qp.toString();
        return apiClient.get(`/v1/admin/revenue/transactions${qs ? `?${qs}` : ""}`);
    },
};
