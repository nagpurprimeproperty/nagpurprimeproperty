/**
 * Static Pages API — /v1/pages/:slug (public) + /v1/admin/pages/:slug (admin)
 */
import { apiClient } from "./client";
export const staticPagesApi = {
    /** GET /api/v1/pages/:slug */
    getPage: (slug) => apiClient.get(`/v1/pages/${slug}`),
    /** GET /api/v1/pages */
    listPages: () => apiClient.get("/v1/pages"),
    /** PUT /api/v1/admin/pages/:slug */
    updatePage: (slug, payload) => apiClient.put(`/v1/admin/pages/${slug}`, payload),
};
