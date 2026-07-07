"use client"

/**
 * /admin/sub-admin — Sub-Admin list page
 *
 * Architecture:
 *  - All data fetching → TanStack Query (useSubAdminList)
 *  - UI state (toggling, pagination meta) → Zustand (useSubAdminStore)
 *  - Filters → query params sent to the backend (server-side filtering)
 *  - Search debounced via useAdminListState (same pattern as users/leads/properties)
 *  - Pagination → fully backend-driven; frontend just sends page/limit
 */
import { useMemo, useState } from "react";
import { useAdminListState } from "@/hooks/use-admin-list-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { TableSkeleton, MobileCardSkeleton } from "@/components/admin/common/skeletons";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { useSubAdminList, useCreateSubAdmin, useToggleSubAdminStatus, useDeleteSubAdmin, } from "@/hooks/use-sub-admin-queries";
import { useSubAdminStore } from "@/lib/store/sub-admin-store";
import { SubAdminStats } from "@/components/admin/sub-admin/sub-admin-stats";
import { SubAdminFilters } from "@/components/admin/sub-admin/sub-admin-filters";
import { CreateSubAdminDialog } from "@/components/admin/sub-admin/create-sub-admin-dialog";
import { DeleteSubAdminDialog } from "@/components/admin/sub-admin/delete-sub-admin-dialog";
import { SubAdminTableRow } from "@/components/admin/sub-admin/sub-admin-table-row";
import { SubAdminMobileCard } from "@/components/admin/sub-admin/sub-admin-mobile-card";
import { SubAdminPagination } from "@/components/admin/sub-admin/sub-admin-pagination";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
const ITEMS_PER_PAGE = 10;
export default function SubAdminPage() {
    const { searchInput, debouncedSearch, currentPage, setCurrentPage, handleSearchChange, withResetPage, } = useAdminListState();
    const [status, setStatus] = useState("all");
    // ── Dialog state ──────────────────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedForDelete, setForDelete] = useState(null);
    // ── Server data ───────────────────────────────────────────────────────────
    const subAdminParams = useMemo(() => ({
        search: debouncedSearch || undefined,
        status,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    }), [debouncedSearch, status, currentPage]);
    const { data, isLoading, refetch, isFetching } = useSubAdminList(subAdminParams);
    const subAdmins = data?.data ?? [];
    const pagination = data?.pagination;
    // ── Mutations ─────────────────────────────────────────────────────────────
    const createMutation = useCreateSubAdmin();
    const toggleMutation = useToggleSubAdminStatus();
    const deleteMutation = useDeleteSubAdmin();
    // ── UI state from Zustand ─────────────────────────────────────────────────
    const togglingIds = useSubAdminStore((s) => s.togglingIds);
    // ── Mutation handlers ─────────────────────────────────────────────────────
    const handleCreate = (data) => {
        createMutation.mutate(data, { onSuccess: () => setCreateOpen(false) });
    };
    const handleDeleteConfirm = () => {
        if (!selectedForDelete)
            return;
        deleteMutation.mutate(selectedForDelete, { onSuccess: () => setForDelete(null) });
    };
    return (<PermissionGate module="sub-admin" action="read" fallback={<Unauthorized />}>
      <div className="space-y-4 sm:space-y-6">

      <AdminPageHeader title="Sub Admins" description="Manage sub-admins and control their module access" onRefresh={() => refetch()} isFetching={isFetching}>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4"/>
          Create Sub Admin
        </Button>
      </AdminPageHeader>

      {/* ── KPI stats (API-driven) ──────────────────────────────────────────── */}
      <SubAdminStats />

      {/* ── Server-side filters ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <SubAdminFilters searchInput={searchInput} onSearchChange={handleSearchChange} status={status} onStatusChange={withResetPage(setStatus)}/>
        </CardContent>
      </Card>

      {/* ── Table / cards ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Sub Admins
            {pagination && (<span className="ml-2 text-sm font-normal text-muted-foreground">
                ({pagination.total})
              </span>)}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (<>
              <div className="hidden sm:block">
                <TableSkeleton cols={6} rows={8} />
              </div>
              <div className="sm:hidden">
                <MobileCardSkeleton rows={5} />
              </div>
            </>) : (<>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Module Access</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subAdmins.length === 0 ? (<TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No sub-admins found
                        </TableCell>
                      </TableRow>) : (subAdmins.map((sa) => (<SubAdminTableRow key={sa._id} subAdmin={sa} isToggling={togglingIds.has(sa._id)} onToggleStatus={(sa) => toggleMutation.mutate(sa)} onDelete={setForDelete}/>)))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {subAdmins.length === 0 ? (<p className="text-center py-8 text-sm text-muted-foreground">
                    No sub-admins found
                  </p>) : (subAdmins.map((sa) => (<SubAdminMobileCard key={sa._id} subAdmin={sa} onToggleStatus={(sa) => toggleMutation.mutate(sa)} onDelete={setForDelete}/>)))}
              </div>

              {/* Backend-driven pagination */}
              {pagination && pagination.totalPages > 1 && (<SubAdminPagination className="mt-4" currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} itemsPerPage={pagination.limit} onPageChange={setCurrentPage}/>)}
            </>)}
        </CardContent>
      </Card>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <CreateSubAdminDialog open={createOpen} isSubmitting={createMutation.isPending} onOpenChange={setCreateOpen} onSubmit={handleCreate}/>

      <DeleteSubAdminDialog subAdmin={selectedForDelete} onOpenChange={(v) => !v && setForDelete(null)} onConfirm={handleDeleteConfirm}/>
    </div>
    </PermissionGate>);
}
