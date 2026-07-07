"use client"

/**
 * usePermission(module)
 *
 * Returns { canRead, canWrite, canDelete, isAdmin } for the given module.
 *
 * Usage:
 *   const { canRead, canWrite, canDelete } = usePermission('brokers')
 *   if (!canRead) return <Unauthorized />
 *   {canWrite && <Button>Add Broker</Button>}
 *   {canDelete && <DropdownMenuItem>Delete</DropdownMenuItem>}
 */
import { usePermissionStore } from "@/lib/store/permission-store";
export function usePermission(module) {
    const can = usePermissionStore((s) => s.can);
    const isAdmin = usePermissionStore((s) => s.isAdmin);
    return {
        canRead: can(module, "read"),
        canWrite: can(module, "write"),
        canDelete: can(module, "delete"),
        isAdmin: isAdmin(),
    };
}
