"use client"

/**
 * /admin/plans — Plans management page.
 *
 * Responsibilities (only):
 *  - Manage open/close state for dialogs
 *  - Fetch list via usePlanList
 *  - Coordinate mutations via useTogglePlanStatus / useDeletePlan
 *  - Render layout + child components
 *
 * All UI detail lives in the components/ sub-folder.
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { usePermission } from "@/hooks/use-permissions";
import { usePlanList, useTogglePlanStatus, useDeletePlan } from "@/hooks/use-plan-queries";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { PlanStats } from "@/components/admin/plan/plan-stats";
import { PlanGrid } from "@/components/admin/plan/plan-grid";
import { PlanFormDialog } from "@/components/admin/plan/plan-form-dialog";
import { PlanDeleteDialog } from "@/components/admin/plan/plan-delete-dialog";
export default function PlansPage() {
    const { canWrite, canDelete } = usePermission("plans");
    // ── Filter state ────────────────────────────────────────────────────────────
    const [filterStatus, setFilterStatus] = useState("all");
    // ── Dialog state ────────────────────────────────────────────────────────────
    const [formOpen, setFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [deletingPlan, setDeletingPlan] = useState(null);
    // ── Data ────────────────────────────────────────────────────────────────────
    const planParams = useMemo(() => ({
        isActive: filterStatus,
        limit: 50,
    }), [filterStatus]);
    const { data, isLoading, isFetching, refetch } = usePlanList(planParams);
    const plans = data?.data ?? [];
    // ── Mutations ────────────────────────────────────────────────────────────────
    const toggleMutation = useTogglePlanStatus();
    const deleteMutation = useDeletePlan();
    // ── Handlers ────────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingPlan(null);
        setFormOpen(true);
    };
    const openEdit = (plan) => {
        setEditingPlan(plan);
        setFormOpen(true);
    };
    const closeForm = (open) => {
        setFormOpen(open);
        if (!open)
            setEditingPlan(null);
    };
    const handleDeleteConfirm = () => {
        if (!deletingPlan)
            return;
        deleteMutation.mutate(deletingPlan, {
            onSuccess: () => setDeletingPlan(null),
        });
    };
    // ── Render ───────────────────────────────────────────────────────────────────
    return (<PermissionGate module="plans" action="read" fallback={<Unauthorized />}>
      <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-hidden">

        <AdminPageHeader
          title="Subscription Plans"
          description="View and manage your subscription plans"
          onRefresh={() => refetch()}
          isFetching={isFetching}
          refreshSize="icon"
        >
          {canWrite && (
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4"/>
              Add Plan
            </Button>
          )}
        </AdminPageHeader>

        {/* Stat cards */}
        <PlanStats />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plan grid */}
        <PlanGrid plans={plans} isLoading={isLoading} isFiltered={filterStatus !== "all"} canWrite={canWrite} canDelete={canDelete} onEdit={openEdit} onDelete={setDeletingPlan} onToggle={(plan) => toggleMutation.mutate(plan)} onCreate={openCreate}/>

        {/* Create / Edit form dialog */}
        <PlanFormDialog open={formOpen} onOpenChange={closeForm} plan={editingPlan}/>

        {/* Delete confirmation */}
        <PlanDeleteDialog plan={deletingPlan} isPending={deleteMutation.isPending} onOpenChange={(open) => { if (!open)
        setDeletingPlan(null); }} onConfirm={handleDeleteConfirm}/>

      </div>
    </PermissionGate>);
}
