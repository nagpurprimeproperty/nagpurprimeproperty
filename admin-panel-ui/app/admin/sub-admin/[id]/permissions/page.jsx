"use client"

/**
 * /admin/sub-admin/[id]/permissions
 *
 * Manage module permissions for a single sub-admin.
 *
 * Data fetching:  useSubAdminDetail   (TanStack Query)
 * Mutation:       useUpdatePermissions (TanStack Query)
 * Local UI state: permissionsMap (React useState — derived from query data)
 *
 * Notes:
 *  - "sub-admin" module is excluded from the assignable list because the
 *    backend route is protected by roleMiddleware(['admin']) — granting
 *    read/write on that module to a sub-admin has no effect and could mislead.
 *  - Dashboard, Revenue, Analytics are read-only (write/delete have no backend routes).
 */
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubAdminDetail, useUpdatePermissions } from "@/hooks/use-sub-admin-queries";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
// ─── Module definitions (sub-admin excluded) ──────────────────────────────────
const MODULES = [
    { id: "dashboard", name: "Dashboard", description: "View platform overview & stats" },
    { id: "users", name: "Users", description: "Manage user accounts" },
    { id: "leads", name: "Leads", description: "View and manage property leads" },
    { id: "properties", name: "Properties", description: "Manage property listings" },
    { id: "revenue", name: "Revenue", description: "View revenue & transactions" },
    { id: "analytics", name: "Analytics", description: "View platform analytics" },
    { id: "plans", name: "Plans", description: "Manage subscription plans" },
    { id: "notifications", name: "Notifications", description: "Send push notifications" },
];
// Modules that only support read access (backend has no write/delete routes for them)
const READ_ONLY_MODULES = ["dashboard", "revenue", "analytics"];
const PERMISSIONS = [
    { id: "read", label: "View" },
    { id: "write", label: "Create/Edit" },
    { id: "delete", label: "Delete" },
];
const emptyMap = () => MODULES.reduce((acc, m) => {
    acc[m.id] = { read: false, write: false, delete: false };
    return acc;
}, {});
// ─── Component ─────────────────────────────────────────────────────────────────
export default function PermissionsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const subAdminId = params.id;
    // TanStack Query — fetch sub-admin detail
    const { data: subAdmin, isLoading, isError, } = useSubAdminDetail(subAdminId);
    // TanStack Query — update permissions mutation
    const updateMutation = useUpdatePermissions(subAdminId);
    // Local permissions state (derived from server data)
    const [permissionsMap, setPermissionsMap] = useState(emptyMap());
    // Seed local state when server data arrives
    useEffect(() => {
        if (!subAdmin?.permissions)
            return;
        const map = emptyMap();
        for (const record of subAdmin.permissions) {
            if (map[record.module] !== undefined) {
                map[record.module] = {
                    read: record.permissions.read ?? false,
                    write: record.permissions.write ?? false,
                    delete: record.permissions.delete ?? false,
                };
            }
        }
        setPermissionsMap(map);
    }, [subAdmin]);
    // ── Toggle single permission cell ─────────────────────────────────────────
    const handleToggle = (moduleId, permId) => {
        if (READ_ONLY_MODULES.includes(moduleId) && permId !== "read")
            return;
        setPermissionsMap((prev) => ({
            ...prev,
            [moduleId]: { ...prev[moduleId], [permId]: !prev[moduleId][permId] },
        }));
    };
    // ── Toggle all permissions for a module row ───────────────────────────────
    const handleToggleModule = (moduleId) => {
        const current = permissionsMap[moduleId];
        const hasAny = current.read || current.write || current.delete;
        const isReadOnly = READ_ONLY_MODULES.includes(moduleId);
        setPermissionsMap((prev) => ({
            ...prev,
            [moduleId]: hasAny
                ? { read: false, write: false, delete: false }
                : { read: true, write: !isReadOnly, delete: !isReadOnly },
        }));
    };
    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = () => {
        const permissions = Object.entries(permissionsMap)
            .filter(([, p]) => p.read || p.write || p.delete)
            .map(([module, permissions]) => ({
            module: module,
            permissions,
        }));
        updateMutation.mutate({ permissions }, {
            onSuccess: () => {
                toast({
                    title: "Permissions saved",
                    description: `Permissions for ${subAdmin?.firstName} ${subAdmin?.lastName} have been updated.`,
                });
                router.push("/admin/sub-admin");
            },
        });
    };
    const grantedCount = Object.values(permissionsMap).filter((p) => p.read || p.write || p.delete).length;
    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Page header skeleton */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-md shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
                <Skeleton className="h-6 w-36 rounded-full hidden sm:block" />
              </div>
            </div>

            {/* Info banners skeleton */}
            <div className="grid gap-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* 8-card permissions grid */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
                  {/* Module header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded shrink-0" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3 w-40 ml-6" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  </div>
                  {/* Checkbox row */}
                  <div className="grid grid-cols-3 gap-2 pl-1">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer actions skeleton */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <Skeleton className="h-10 w-24 rounded-md" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-40 hidden sm:block" />
                <Skeleton className="h-10 w-36 rounded-md" />
              </div>
            </div>
          </div>
        );
    }
    // ── Error ─────────────────────────────────────────────────────────────────
    if (isError || !subAdmin) {
        return (<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive"/>
        <p className="font-medium">Sub-admin not found</p>
        <Link href="/admin/sub-admin">
          <Button variant="outline">Back to Sub Admins</Button>
        </Link>
      </div>);
    }
    // ── Render ────────────────────────────────────────────────────────────────
    return (<div className="space-y-4 sm:space-y-6">

      <AdminPageHeader
        leading={(<Link href="/admin/sub-admin">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4"/>
          </Button>
        </Link>)}
        title="Manage Permissions"
        description={`${subAdmin.firstName} ${subAdmin.lastName} · ${subAdmin.email}`}
      >
        <>
          <Badge variant={subAdmin.isActive ? "default" : "secondary"} className="hidden sm:flex">
            {subAdmin.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline" className="hidden sm:flex">
            {grantedCount} of {MODULES.length} modules granted
          </Badge>
        </>
      </AdminPageHeader>

      {/* Info banners */}
      <div className="grid gap-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Sub-admins have no access by default. Enable the modules and
            actions you want to grant.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            <strong>Read-only modules:</strong> Dashboard, Revenue, and Analytics are view-only —
            Create/Edit &amp; Delete are not applicable.
          </p>
        </div>
      </div>

      {/* Module permission grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        {MODULES.map((module) => {
            const perms = permissionsMap[module.id] ?? { read: false, write: false, delete: false };
            const hasAny = perms.read || perms.write || perms.delete;
            const isReadOnly = READ_ONLY_MODULES.includes(module.id);
            return (<Card key={module.id} className={`transition-colors ${hasAny ? "border-green-300 bg-green-50/40" : "border-border"}`}>
              <CardContent className="p-4 space-y-3">
                {/* Module header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Shield className={`h-4 w-4 shrink-0 ${hasAny ? "text-green-600" : "text-muted-foreground"}`}/>
                      <span className="font-semibold text-sm capitalize">{module.name}</span>
                      {isReadOnly && (<Badge variant="secondary" className="text-xs py-0">
                          Read-only
                        </Badge>)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                      {module.description}
                    </p>
                  </div>

                  {/* Toggle-all button */}
                  <button type="button" onClick={() => handleToggleModule(module.id)} className={`shrink-0 rounded-full p-1 transition-colors ${hasAny
                    ? "text-green-600 hover:text-green-700"
                    : "text-muted-foreground hover:text-foreground"}`} title={hasAny ? "Revoke all" : "Grant all"}>
                    {hasAny
                    ? <CheckCircle2 className="h-5 w-5"/>
                    : <XCircle className="h-5 w-5"/>}
                  </button>
                </div>

                {/* Permission checkboxes */}
                <div className="grid grid-cols-3 gap-2 pl-1">
                  {PERMISSIONS.map((perm) => {
                    const disabled = isReadOnly && perm.id !== "read";
                    const checked = perms[perm.id];
                    return (<div key={perm.id} className={`flex items-center gap-1.5 ${disabled ? "opacity-40" : ""}`}>
                        <Checkbox id={`${module.id}-${perm.id}`} checked={checked} onCheckedChange={() => handleToggle(module.id, perm.id)} disabled={disabled} className="h-3.5 w-3.5"/>
                        <Label htmlFor={`${module.id}-${perm.id}`} className={`text-xs ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                          {perm.label}
                        </Label>
                      </div>);
                })}
                </div>
              </CardContent>
            </Card>);
        })}
      </div>

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t">
        <Link href="/admin/sub-admin">
          <Button variant="outline" className="w-full sm:w-auto">
            Cancel
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground hidden sm:block">
            {grantedCount} of {MODULES.length} modules granted
          </p>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 sm:flex-none">
            {updateMutation.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
            Save Permissions
          </Button>
        </div>
      </div>
    </div>);
}
