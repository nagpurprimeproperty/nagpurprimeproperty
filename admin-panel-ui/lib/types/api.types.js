/**
 * Shared API response types
 */
// ─── Permissions ──────────────────────────────────────────────────────────────
/**
 * All modules the system recognises.
 * NOTE: "sub-admin" is intentionally excluded from assignable permissions
 *       because sub-admin management routes are protected by role middleware
 *       (admin only) — granting read/write/delete on this module to a sub-admin
 *       would have no effect and could be confusing.
 */
export const ALL_MODULES = [
    'dashboard',
    'users',
    'leads',
    'properties',
    'revenue',
    'analytics',
    'plans',
    'notifications',
    'settings',
    'areas',
    'keywords',
    'blogs',
];
/** The full list including internal-only modules */
export const ALL_MODULES_WITH_INTERNAL = [
    ...ALL_MODULES,
    'sub-admin',
];
