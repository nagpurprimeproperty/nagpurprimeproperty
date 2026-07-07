"use client"

import { use, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Crown, ToggleLeft, ToggleRight, Trash2, Edit2, CreditCard, MessageSquare, Building2, Zap, AlertCircle, Loader2, } from "lucide-react";
import { PlanBadge } from "@/components/admin/common/plan-badge";
import { useUserDetail, useUpdateUser, useToggleUserStatus, useDeleteUser, usePropLeadPlanQueryStats, } from "@/hooks/use-user-queries";
import { useToast } from "@/hooks/use-toast";
import { PermissionGate } from "@/components/utils/permission-gate";
import { PlansTab } from "@/components/admin/user/plans-tab";
import { LeadsTab, PropertiesTab, QueriesTab } from "@/components/admin/user/user-detail-tabs";
const UserFormDialog = dynamic(() => import("@/components/admin/user/user-form-dialog").then((mod) => mod.UserFormDialog));
function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function UserDetailSkeleton() {
    return (<div className="space-y-6">
      <Skeleton className="h-8 w-40 rounded-md"/>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card skeleton */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <Skeleton className="h-20 w-20 rounded-full"/>
              <div className="space-y-2 w-full flex flex-col items-center">
                <Skeleton className="h-5 w-44"/>
                <Skeleton className="h-4 w-56"/>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Skeleton className="h-6 w-16 rounded-full"/>
                <Skeleton className="h-6 w-20 rounded-full"/>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              {[1, 2, 3, 4].map((i) => (<div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-md shrink-0"/>
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-16"/>
                    <Skeleton className="h-4 w-40"/>
                  </div>
                </div>))}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="rounded-lg bg-muted/40 border p-3 text-center space-y-2">
                  <Skeleton className="h-4 w-4 rounded-md mx-auto"/>
                  <Skeleton className="h-5 w-10 mx-auto"/>
                  <Skeleton className="h-3 w-16 mx-auto"/>
                </div>))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md"/>
              <Skeleton className="h-10 w-full rounded-md"/>
              <Skeleton className="h-10 w-full rounded-md"/>
            </div>
          </CardContent>
        </Card>

        {/* Tabs skeleton */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-9 w-full rounded-md"/>))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-56"/>
                      <Skeleton className="h-3 w-40"/>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full"/>
                  </div>
                  <Skeleton className="h-10 w-full rounded-md"/>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-28"/>
                    <Skeleton className="h-3 w-20"/>
                  </div>
                </div>))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { data: user, isLoading, isError } = useUserDetail(id);
    const { data: qStats, isLoading: qStatsLoading, isError: statsError } = usePropLeadPlanQueryStats(id);
    const updateMutation = useUpdateUser(id);
    const toggleMutation = useToggleUserStatus();
    const deleteMutation = useDeleteUser();
    const handleEdit = (data) => {
        updateMutation.mutate(data, { onSuccess: () => setEditOpen(false) });
    };
    const handleToggle = () => {
        if (!user)
            return;
        toggleMutation.mutate(user);
    };
    const handleDelete = () => {
        if (!user)
            return;
        deleteMutation.mutate(user, { onSuccess: () => router.push("/admin/users") });
        setDeleteOpen(false);
    };
    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading) {
        return <UserDetailSkeleton />;
    }
    // ── Error / not found ─────────────────────────────────────────────────────
    if (isError || !user) {
        return (<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive"/>
        </div>
        <h3 className="text-lg font-semibold">User Not Found</h3>
        <p className="text-sm text-muted-foreground">This user does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/admin/users"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Users</Link>
        </Button>
      </div>);
    }
    const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const planCount = qStats?.plans ?? 0;
    const queryCount = qStats?.enquiries ?? 0;
    const propCount = qStats?.properties ?? 0;
    const leadCount = qStats?.leads ?? 0;
    return (<div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/admin/users"><ArrowLeft className="h-4 w-4"/>Back to Users</Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
                <PlanBadge plan={user.plan}/>
              </div>
            </div>

            <Separator />

            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-2 shrink-0"><Phone className="h-4 w-4 text-muted-foreground"/></div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="font-medium">{user.mobile}</p>
                </div>
              </div>
              {user.email && (<div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2 shrink-0"><Mail className="h-4 w-4 text-muted-foreground"/></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                </div>)}
              {(user.area || user.city) && (<div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2 shrink-0"><MapPin className="h-4 w-4 text-muted-foreground"/></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{[user.area, user.city].filter(Boolean).join(", ")}</p>
                  </div>
                </div>)}
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-2 shrink-0"><Calendar className="h-4 w-4 text-muted-foreground"/></div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{fmtDate(user.createdAt)}</p>
                </div>
              </div>
              {user.planExpiry && (<div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2 shrink-0"><Crown className="h-4 w-4 text-muted-foreground"/></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Plan Expires</p>
                    <p className="font-medium">{user.planExpiry}</p>
                  </div>
                </div>)}
            </div>

            <Separator />

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
            { label: "Properties", value: propCount, icon: Building2 },
            { label: "Queries", value: queryCount, icon: MessageSquare },
            { label: "Leads", value: leadCount, icon: Zap },
            { label: "Plans", value: planCount, icon: CreditCard },
        ].map(({ label, value, icon: Icon }) => (<div key={label} className="rounded-lg bg-muted/40 border p-3 text-center">
                  <Icon className="mx-auto h-4 w-4 text-muted-foreground mb-1"/>
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>))}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <PermissionGate module="users" action="write">
                <Button variant="outline" className="w-full gap-2" onClick={() => setEditOpen(true)}>
                  <Edit2 className="h-4 w-4"/>Edit User
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleToggle} disabled={toggleMutation.isPending}>
                  {toggleMutation.isPending
            ? <Loader2 className="h-4 w-4 animate-spin"/>
            : user.isActive
                ? <ToggleLeft className="h-4 w-4"/>
                : <ToggleRight className="h-4 w-4"/>}
                  {user.isActive ? "Deactivate User" : "Activate User"}
                </Button>
              </PermissionGate>
              <PermissionGate module="users" action="delete">
                <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4"/>Delete User
                </Button>
              </PermissionGate>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="plans">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                {[
            { value: "plans", label: "Plans", count: planCount },
            { value: "queries", label: "Queries", count: queryCount },
            { value: "properties", label: "Properties", count: propCount },
            { value: "leads", label: "Leads", count: leadCount },
        ].map(({ value, label, count }) => (<TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
                    {label}
                    {count > 0 && (<span className="ml-1.5 hidden sm:inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs px-1.5 min-w-[1.25rem]">
                        {count}
                      </span>)}
                  </TabsTrigger>))}
              </TabsList>

              <TabsContent value="plans"><PlansTab userId={id}/></TabsContent>
              <TabsContent value="queries"><QueriesTab userId={id}/></TabsContent>
              <TabsContent value="properties"><PropertiesTab userId={id}/></TabsContent>
              <TabsContent value="leads"><LeadsTab userId={id}/></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <UserFormDialog open={editOpen} onOpenChange={setEditOpen} onSubmit={handleEdit} isSubmitting={updateMutation.isPending} user={user}/>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete <strong>{user.name}</strong>?
            All their data will be removed. This cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Delete User
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}
