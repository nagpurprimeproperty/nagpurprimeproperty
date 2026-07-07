/**
 * Permission Store (Zustand — NOT persisted)
 *
 * null  → user is a full admin → all operations allowed
 * {}    → user is a sub-admin  → check per module
 *
 * Populated right after login via auth-store → setPermissions(role, permissions)
 * Re-populated after page refresh when profile fetch re-runs (auth-store login).
 */
import { create } from 'zustand';
export const usePermissionStore = create()((set, get) => ({
    permissions: null,
    role: null,
    permissionsInitialized: false,
    setPermissions: (role, permissions) => set({ role: role, permissions, permissionsInitialized: true }),
    clearPermissions: () => set({ permissions: null, role: null, permissionsInitialized: false }),
    can: (module, action) => {
        const { permissions, role } = get();
        // Full admin → always allowed
        if (role === 'admin' || permissions === null)
            return true;
        const modulePerms = permissions[module];
        if (!modulePerms)
            return false;
        return modulePerms[action] === true;
    },
    canRead: (module) => get().can(module, 'read'),
    canWrite: (module) => get().can(module, 'write'),
    canDelete: (module) => get().can(module, 'delete'),
    isAdmin: () => get().role === 'admin' || get().permissions === null,
}));
