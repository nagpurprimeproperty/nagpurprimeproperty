/**
 * Permission Store (Zustand + persist)
 *
 * role: 'admin' | 'sub-admin' | null
 * permissions:
 *   null  → user is a full admin (or permissions not loaded)
 *   {}    → map of module permissions for sub-admin: { properties: { read: true, write: false, delete: false }, ... }
 *
 * Populated right after login via auth-store → setPermissions(role, permissions)
 * Re-populated after page refresh when profile fetch re-runs (admin-profile-store).
 * Persisted in localStorage so initial render after refresh retains sub-admin restrictions.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePermissionStore = create()(
    persist(
        (set, get) => ({
            permissions: null,
            role: null,
            permissionsInitialized: false,
            setPermissions: (role, permissions) =>
                set({ role: role, permissions: permissions ?? null, permissionsInitialized: true }),
            clearPermissions: () =>
                set({ permissions: null, role: null, permissionsInitialized: false }),
            can: (module, action) => {
                const { permissions, role } = get();
                // Full admin → always allowed
                if (role === 'admin') return true;
                // Sub-admin → check module permissions
                if (role === 'sub-admin') {
                    if (!permissions) return false;
                    const modulePerms = permissions[module];
                    if (!modulePerms) return false;
                    return modulePerms[action] === true;
                }
                // Fallback for null / uninitialized role
                return false;
            },
            canRead: (module) => get().can(module, 'read'),
            canWrite: (module) => get().can(module, 'write'),
            canDelete: (module) => get().can(module, 'delete'),
            isAdmin: () => get().role === 'admin',
        }),
        {
            name: 'permission-store',
        }
    )
);

