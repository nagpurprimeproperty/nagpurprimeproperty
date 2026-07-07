"use client"

import { useCallback, useMemo, useState, memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Users, UserCheck, UserX, Search, MoreHorizontal, Eye, UserPlus, MapPin, ToggleLeft, ToggleRight, Trash2, Loader2, } from "lucide-react";
import { TableSkeleton, MobileCardSkeleton } from "@/components/admin/common/skeletons";
import { useUserList, useUserStats, useToggleUserStatus, useDeleteUser, useCreateUser, } from "@/hooks/use-user-queries";
import { useUserStore } from "@/lib/store/user-store";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { PlanBadge } from "@/components/admin/common/plan-badge";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { AdminStatGrid } from "@/components/admin/common/admin-stat-grid";
import { ServerPagination } from "@/components/admin/common/server-pagination";
import { useAdminListState } from "@/hooks/use-admin-list-state";
const ITEMS_PER_PAGE = 10;
const UserFormDialog = dynamic(() => import("@/components/admin/user/user-form-dialog").then((mod) => mod.UserFormDialog));

const UserTableRow = memo(function UserTableRow({ user, dateFormatter, isToggling, onToggle, onDeleteRequest, }) {
  return (<TableRow className="hover:bg-muted/30">
    <TableCell>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email || "—"}</p>
        </div>
      </div>
    </TableCell>
    <TableCell className="text-sm">{user.mobile}</TableCell>
    <TableCell className="text-sm text-muted-foreground">
      {[user.area, user.city].filter(Boolean).join(", ") || "—"}
    </TableCell>
    <TableCell>
      <Badge variant={user.isActive ? "default" : "secondary"}>
        {user.isActive ? "Active" : "Inactive"}
      </Badge>
    </TableCell>
    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
      {user?.createdAt &&
        !isNaN(new Date(user.createdAt).getTime())
        ? dateFormatter.format(new Date(user.createdAt))
        : "-"}
    </TableCell>
    <TableCell className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${user._id}`} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4" /> View Details
            </Link>
          </DropdownMenuItem>
          <PermissionGate module="users" action="write">
            <DropdownMenuItem onClick={() => onToggle(user)} disabled={isToggling} className="gap-2 cursor-pointer">
              {isToggling
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : user.isActive
                  ? <ToggleLeft className="h-4 w-4" />
                  : <ToggleRight className="h-4 w-4" />}
              {user.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </PermissionGate>
          <PermissionGate module="users" action="delete">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteRequest(user)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </PermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>);
});

const UserMobileCard = memo(function UserMobileCard({ user }) {
  return (<div className="border rounded-lg p-4 space-y-3 bg-card">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.mobile}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/users/${user._id}`}><Eye className="h-4 w-4" /></Link>
      </Button>
    </div>
    <div className="flex items-center justify-between">
      <PlanBadge plan={user.plan} />
      <Badge variant={user.isActive ? "default" : "secondary"}>
        {user.isActive ? "Active" : "Inactive"}
      </Badge>
    </div>
    {(user.area || user.city) && (<p className="text-xs text-muted-foreground flex items-center gap-1">
      <MapPin className="h-3 w-3" />
      {[user.area, user.city].filter(Boolean).join(", ")}
    </p>)}
  </div>);
});

export default function UsersPage() {
  const togglingIds = useUserStore((s) => s.togglingIds);
  const { searchInput, debouncedSearch, currentPage, setCurrentPage, handleSearchChange, withResetPage, } = useAdminListState();
  const [filterStatus, setFilterStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    isActive: filterStatus !== "all" ? filterStatus : undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  }), [debouncedSearch, filterStatus, currentPage]);
  const { data, isLoading, isFetching, refetch } = useUserList(params);
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const users = data?.data ?? [];
  const pagination = data?.pagination;
  const createMutation = useCreateUser();
  const toggleMutation = useToggleUserStatus();
  const deleteMutation = useDeleteUser();
  const handleCreate = useCallback((payload) => {
    createMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
  }, [createMutation]);
  const handleDeleteConfirm = useCallback(() => {
    if (!deletingUser)
      return;
    deleteMutation.mutate(deletingUser, { onSuccess: () => setDeletingUser(null) });
  }, [deleteMutation, deletingUser]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "2-digit",
  }), []);
  const statCards = useMemo(() => [
    { label: "Total Users", value: stats?.total ?? 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active", value: stats?.active ?? 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-500/10" },
    { label: "Inactive", value: stats?.inactive ?? 0, icon: UserX, color: "text-red-500", bg: "bg-red-500/10" },
  ], [stats?.total, stats?.active, stats?.inactive]);
  const handleToggleUser = useCallback((u) => {
    toggleMutation.mutate(u);
  }, [toggleMutation]);
  const handleRequestDeleteUser = useCallback((u) => {
    setDeletingUser(u);
  }, []);
  return (<PermissionGate module="users" action="read" fallback={<Unauthorized />}>
    <div className="space-y-6">

      <AdminPageHeader title="Users" description="Manage Users and their subscription plans" onRefresh={() => refetch()} isFetching={isFetching}>
        <PermissionGate module="users" action="write">
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </PermissionGate>
      </AdminPageHeader>

      <AdminStatGrid items={statCards} isLoading={statsLoading} />

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>
            All Users
            {pagination && (<span className="ml-2 text-sm font-normal text-muted-foreground">({pagination.total})</span>)}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, email or phone..." value={searchInput} onChange={handleSearchChange} className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={withResetPage(setFilterStatus)}>
              <SelectTrigger className="sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (<>
            {/* Desktop Table Skeleton */}
            <div className="hidden sm:block">
              <TableSkeleton cols={6} rows={8} />
            </div>
            {/* Mobile Skeleton */}
            <div className="sm:hidden">
              <MobileCardSkeleton rows={5} />
            </div>
          </>) : (<>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (<TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>) : (users.map((user) => (<UserTableRow key={user._id} user={user} dateFormatter={dateFormatter} isToggling={togglingIds.has(user._id)} onToggle={handleToggleUser} onDeleteRequest={handleRequestDeleteUser} />)))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {users.length === 0 ? (<p className="text-center py-8 text-sm text-muted-foreground">No users found.</p>) : (users.map((user) => (<UserMobileCard key={user._id} user={user} />)))}
            </div>

            {pagination && pagination.totalPages > 1 && (<ServerPagination className="pt-2" currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} itemsPerPage={pagination.limit} onPageChange={setCurrentPage} />)}
          </>)}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} isSubmitting={createMutation.isPending} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(v) => !v && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete <strong>{deletingUser?.name}</strong>?
            This cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  </PermissionGate>);
}
