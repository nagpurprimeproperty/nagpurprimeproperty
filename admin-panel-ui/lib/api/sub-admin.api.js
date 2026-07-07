/**
 * Sub-Admin API
 * All endpoints under /v1/admin/sub-admins/
 */
import { apiClient } from "./client";
// ─── API functions ─────────────────────────────────────────────────────────────
export const subAdminApi = {
    /**
     * GET /api/v1/admin/sub-admins?search=&status=&page=&limit=
     * Returns paginated response with `pagination` meta on the root object.
     */
    list: (params = {}) => {
        const qp = new URLSearchParams();
        if (params.search && params.search.trim())
            qp.set('search', params.search.trim());
        if (params.status && params.status !== 'all')
            qp.set('status', params.status);
        if (params.page)
            qp.set('page', String(params.page));
        if (params.limit)
            qp.set('limit', String(params.limit));
        const qs = qp.toString();
        return apiClient.get(`/v1/admin/sub-admins${qs ? `?${qs}` : ''}`);
    },
    /**
     * GET /api/v1/admin/sub-admins/stats
     * Returns: { total, active, inactive }
     */
    getStats: () => apiClient.get('/v1/admin/sub-admins/stats'),
    /**
     * POST /api/v1/admin/sub-admins
     */
    create: (payload) => apiClient.post('/v1/admin/sub-admins', payload),
    /**
     * GET /api/v1/admin/sub-admins/:id
     */
    getOne: (id) => apiClient.get(`/v1/admin/sub-admins/${id}`),
    /**
     * PUT /api/v1/admin/sub-admins/:id/permissions
     */
    updatePermissions: (id, payload) => apiClient.put(`/v1/admin/sub-admins/${id}/permissions`, payload),
    /**
     * PATCH /api/v1/admin/sub-admins/:id/status
     */
    toggleStatus: (id) => apiClient.patch(`/v1/admin/sub-admins/${id}/status`),
    /**
     * DELETE /api/v1/admin/sub-admins/:id
     */
    delete: (id) => apiClient.delete(`/v1/admin/sub-admins/${id}`),
};
