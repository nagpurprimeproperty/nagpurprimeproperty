// lib/api/user-plans.api.ts
import { apiClient } from "./client";
export const userPlanApi = {
    list: (userId) => apiClient.get(`/v1/admin/users/${userId}/plans`),
    create: (userId, payload) => apiClient.post(`/v1/admin/users/${userId}/plans`, payload),
    update: (userId, planId, payload) => apiClient.put(`/v1/admin/users/${userId}/plans/${planId}`, payload),
    delete: (userId, planId) => apiClient.delete(`/v1/admin/users/${userId}/plans/${planId}`),
};
