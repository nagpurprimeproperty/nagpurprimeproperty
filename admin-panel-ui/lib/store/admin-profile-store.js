/**
 * Admin Profile Store (Zustand)
 *
 * Manages:
 *  - Fetched AdminProfile data
 *  - updateProfile / updatePassword actions
 *
 * NOT persisted — profile is re-fetched on every authenticated session
 * so we never serve stale data from localStorage.
 */
import { create } from "zustand";
import { adminProfileApi } from "@/lib/api/admin-profile.api";
import { ApiError } from "@/lib/api/client";
export const useAdminProfileStore = create()((set) => ({
    profile: null,
    isLoading: false,
    isSaving: false,
    error: null,
    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await adminProfileApi.getProfile();
            set({ profile: res.data });
        }
        catch (err) {
            const message = err instanceof ApiError ? err.message : "Failed to load profile";
            set({ error: message });
        }
        finally {
            set({ isLoading: false });
        }
    },
    updateProfile: async (payload, avatarFile) => {
        set({ isSaving: true });
        try {
            const res = await adminProfileApi.updateProfile(payload, avatarFile);
            set({ profile: res.data });
            return { success: true };
        }
        catch (err) {
            const message = err instanceof ApiError ? err.message : "Failed to update profile";
            return { success: false, error: message };
        }
        finally {
            set({ isSaving: false });
        }
    },
    updatePassword: async (payload) => {
        set({ isSaving: true });
        try {
            await adminProfileApi.updatePassword(payload);
            return { success: true };
        }
        catch (err) {
            const message = err instanceof ApiError ? err.message : "Failed to update password";
            return { success: false, error: message };
        }
        finally {
            set({ isSaving: false });
        }
    },
    clearProfile: () => set({ profile: null, error: null }),
}));
// ─── Selector hooks ────────────────────────────────────────────────────────────
export const useAdminProfile = () => useAdminProfileStore((s) => s.profile);
export const useProfileLoading = () => useAdminProfileStore((s) => s.isLoading);
export const useProfileSaving = () => useAdminProfileStore((s) => s.isSaving);
