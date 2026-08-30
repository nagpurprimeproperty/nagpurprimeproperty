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

export const MODULE_ROUTES = [
    { module: 'dashboard', href: '/admin' },
    { module: 'sub-admin', href: '/admin/sub-admin' },
    { module: 'users', href: '/admin/users' },
    { module: 'leads', href: '/admin/leads' },
    { module: 'properties', href: '/admin/properties' },
    { module: 'areas', href: '/admin/areas' },
    { module: 'blogs', href: '/admin/blogs' },
    { module: 'keywords', href: '/admin/keywords' },
    { module: 'revenue', href: '/admin/revenue' },
    { module: 'analytics', href: '/admin/analytics' },
    { module: 'plans', href: '/admin/plans' },
    { module: 'notifications', href: '/admin/notifications' },
    { module: 'settings', href: '/admin/settings' },
];

export function getDefaultRouteForUser(role, permissions) {
    if (role === 'admin') return '/admin';
    if (role === 'sub-admin') {
        if (!permissions) return '/admin/profile';
        for (const item of MODULE_ROUTES) {
            if (permissions[item.module]?.read === true) {
                return item.href;
            }
        }
        return '/admin/profile';
    }
    return '/admin';
}

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
            getDefaultRoute: () => {
                const { role, permissions } = get();
                return getDefaultRouteForUser(role, permissions);
            },
        }),
        {
            name: 'permission-store',
        }
    )
);

