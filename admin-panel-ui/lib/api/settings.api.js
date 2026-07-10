/**
 * Settings API — /v1/admin/settings
 */
import { apiClient } from "./client";

export const settingsApi = {
    /** GET /api/v1/admin/settings */
    getSettings: () => apiClient.get("/v1/admin/settings"),
    /** PUT /api/v1/admin/settings */
    updateSettings: (payload) => apiClient.put("/v1/admin/settings", payload),
};
