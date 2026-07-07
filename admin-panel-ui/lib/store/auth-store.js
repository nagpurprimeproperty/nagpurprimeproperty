/**
 * Auth Store (Zustand + persist)
 *
 * Responsibilities:
 *  - Store / clear JWT token (persisted)
 *  - Login → receive { token, role, permissions } from backend
 *             → hydrate permission store immediately
 *  - Logout → clear token + permissions
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/api/client';
import { usePermissionStore } from '@/lib/store/permission-store';
export const useAuthStore = create()(persist((set) => ({
    token: null,
    isLoading: false,
    login: async (payload) => {
        set({ isLoading: true });
        try {
            const res = await authApi.login(payload);
            const { token, role, permissions } = res.data;
            set({ token });
            // Immediately populate permission store — no extra fetch needed
            usePermissionStore.getState().setPermissions(role, permissions);
            return { success: true };
        }
        catch (err) {
            const message = err instanceof ApiError ? err.message : 'Network error. Check your connection.';
            return { success: false, error: message };
        }
        finally {
            set({ isLoading: false });
        }
    },
    logout: () => {
        set({ token: null });
        usePermissionStore.getState().clearPermissions();
    },
    forgotPassword: async (payload) => {
        set({ isLoading: true });
        try {
            await authApi.forgotPassword(payload);
            return { success: true };
        }
        catch (err) {
            const message = err instanceof ApiError ? err.message : 'Network error. Check your connection.';
            return { success: false, error: message };
        }
        finally {
            set({ isLoading: false });
        }
    },
    resetPassword: async (payload) => {
        set({ isLoading: true });
        try {
            await authApi.resetPassword(payload);
            return { success: true };
        }
        catch (err) {
            const message = err instanceof ApiError ? err.message : 'Network error. Check your connection.';
            return { success: false, error: message };
        }
        finally {
            set({ isLoading: false });
        }
    },
}), {
    name: 'auth-store',
    partialize: (state) => ({ token: state.token }),
}));
export const useToken = () => useAuthStore((s) => s.token);
export const useIsAuthenticated = () => useAuthStore((s) => !!s.token);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
