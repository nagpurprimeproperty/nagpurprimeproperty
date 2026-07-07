/**
 * Auth API — all endpoints under /v1/admin/auth/
 */
import { apiClient } from "./client";
export const authApi = {
    /**
     * POST /api/v1/admin/auth/login
     * Returns { token, role, permissions, admin }
     */
    login: (payload) => apiClient.post("/v1/admin/auth/login", payload),
    /**
     * POST /api/v1/admin/auth/forgot-password
     * Sends a reset link to the admin's email
     */
    forgotPassword: (payload) => apiClient.post("/v1/admin/auth/forgot-password", payload),
    /**
     * POST /api/v1/admin/auth/reset-password
     * Resets password using the token from the email link
     */
    resetPassword: (payload) => apiClient.post("/v1/admin/auth/reset-password", payload),
};
