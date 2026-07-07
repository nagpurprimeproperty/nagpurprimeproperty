import { apiClient } from "./client";
// ─── API ──────────────────────────────────────────────────────────────────────
export const analyticsApi = {
    getOverview: () => apiClient.get("/v1/admin/analytics/overview"),
    getUserActivity: (period) => apiClient.get(`/v1/admin/analytics/user-activity?period=${period}`),
    getSubscriptionPlanDistribution: () => apiClient.get("/v1/admin/analytics/subscription-plan-distribution"),
    getMonthlyGrowth: () => apiClient.get("/v1/admin/analytics/monthly-growth"),
    getTopBrokers: (limit = 5) => apiClient.get(`/v1/admin/analytics/top-brokers?limit=${limit}`),
    getPropertiesByLocation: () => apiClient.get("/v1/admin/analytics/properties-by-location"),
    getPropertyTypeDistribution: () => apiClient.get("/v1/admin/analytics/property-type-distribution"),
};
