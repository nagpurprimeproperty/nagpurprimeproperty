/**
 * Admin Profile API — all endpoints under /v1/admin/profile/
 */
import { apiClient } from "./client";
export const adminProfileApi = {
    /**
     * GET /api/v1/admin/profile
     * Returns current admin's profile
     */
    getProfile: () => apiClient.get("/v1/admin/profile"),
    /**
     * PUT /api/v1/admin/profile
     * Updates profile fields + optional avatar file (multipart/form-data)
     */
    updateProfile: (payload, avatarFile) => {
        if (avatarFile) {
            const form = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    form.append(key, value);
                }
            });
            form.append("avatar", avatarFile);
            return apiClient.put("/v1/admin/profile", form);
        }
        return apiClient.put("/v1/admin/profile", payload);
    },
    /**
     * PATCH /api/v1/admin/profile/password-update
     * Updates admin password
     */
    updatePassword: (payload) => apiClient.patch("/v1/admin/profile/password-update", payload),
};
