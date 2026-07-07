"use client"

/**
 * PermissionGate
 *
 * Declarative wrapper that shows/hides children based on permissions.
 *
 * Examples:
 *
 *   // Guard entire page
 *   <PermissionGate module="brokers" action="read" fallback={<Unauthorized />}>
 *     <BrokersPage />
 *   </PermissionGate>
 *
 *   // Hide a button
 *   <PermissionGate module="brokers" action="write">
 *     <Button>Add Broker</Button>
 *   </PermissionGate>
 */
import React from "react";
import { usePermissionStore } from "@/lib/store/permission-store";
import { ShieldX } from "lucide-react";
export function PermissionGate({ module, action = "read", fallback = null, children, }) {
    const can = usePermissionStore((s) => s.can);
    if (!can(module, action)) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
}
/**
 * Unauthorized — shown when canRead is false for a whole page.
 */
export function Unauthorized() {
    return (<div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="h-8 w-8 text-destructive"/>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Access Denied</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You don&apos;t have permission to view this page.
          <br />
          Contact your administrator to request access.
        </p>
      </div>
    </div>);
}
