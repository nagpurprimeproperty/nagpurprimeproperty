"use client"

/** List-page pattern: shared primitives in `components/admin/common/` and `hooks/use-admin-list-state.js`. */
import { memo, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, Eye, Edit2, Trash2, Loader2, Zap, PhoneCall, CheckCircle2, Clock, MapPin, Building2, Calendar, } from "lucide-react";
import { TableSkeleton, MobileCardSkeleton } from "@/components/admin/common/skeletons";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { usePermission } from "@/hooks/use-permissions";
import { useLeadList, useLeadStats, useLeadFilterOptions, useUpdateLead, useUpdateLeadStatus, useDeleteLead, } from "@/hooks/use-lead-queries";
import { useLeadStore } from "@/lib/store/lead-store";
import { LEAD_STATUSES } from "@/lib/api/lead.api";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { AdminStatGrid } from "@/components/admin/common/admin-stat-grid";
import { ServerPagination } from "@/components/admin/common/server-pagination";
import { useAdminListState } from "@/hooks/use-admin-list-state";
// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    New: { label: "New", variant: "default", icon: Zap, color: "text-blue-600", bg: "bg-blue-500/10" },
    Contacted: { label: "Contacted", variant: "secondary", icon: PhoneCall, color: "text-orange-600", bg: "bg-orange-500/10" },
    Closed: { label: "Closed", variant: "outline", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" },
};
const StatusBadge = memo(function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.New;
    const Icon = cfg.icon;
    return (<Badge variant={cfg.variant} className="gap-1">
      <Icon className="h-3 w-3"/>
      {cfg.label}
    </Badge>);
});
const ITEMS_PER_PAGE = 10;
const LeadFormDialog = dynamic(() => import("@/components/admin/lead/lead-form-dialog").then((mod) => mod.LeadFormDialog));
const ViewLeadDialog = dynamic(() => import("@/components/admin/lead/view-lead-dialog").then((mod) => mod.ViewLeadDialog));
// ─── Stat Cards ───────────────────────────────────────────────────────────────
const StatCards = memo(function StatCards() {
    const { data: stats, isLoading } = useLeadStats();
    const cards = useMemo(() => [
        { label: "Total Leads", value: stats?.total, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
        { label: "New", value: stats?.new, icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10" },
        { label: "Contacted", value: stats?.contacted, icon: PhoneCall, color: "text-orange-600", bg: "bg-orange-500/10" },
        { label: "Closed", value: stats?.closed, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" },
    ], [stats?.total, stats?.new, stats?.contacted, stats?.closed]);
    return (<AdminStatGrid items={cards} isLoading={isLoading} gridClassName="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"/>);
});
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeadsPage() {
    const { canWrite, canDelete } = usePermission("leads");
    const updatingIds = useLeadStore((s) => s.updatingIds);
    // ── Filter + pagination state ─────────────────────────────────────────────
    const { searchInput, debouncedSearch, currentPage, setCurrentPage, handleSearchChange, withResetPage, } = useAdminListState();
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterArea, setFilterArea] = useState("all");
    const [filterType, setFilterType] = useState("all");
    // ── Dialog state ──────────────────────────────────────────────────────────
    const [editingLead, setEditingLead] = useState(null);
    const [viewingLead, setViewingLead] = useState(null);
    const [deletingLead, setDeletingLead] = useState(null);
    // ── Data fetching ─────────────────────────────────────────────────────────
    const params = useMemo(() => ({
        search: debouncedSearch || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        area: filterArea !== "all" ? filterArea : undefined,
        propertyType: filterType !== "all" ? filterType : undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    }), [debouncedSearch, filterStatus, filterArea, filterType, currentPage]);
    const { data, isLoading, isFetching, refetch } = useLeadList(params);
    const { data: filterOptions } = useLeadFilterOptions();
    const areaOptions = useMemo(() => {
        const fromApi = filterOptions?.localities ?? [];
        if (filterArea !== "all" && filterArea && !fromApi.includes(filterArea)) {
            return [...fromApi, filterArea].sort((a, b) => a.localeCompare(b));
        }
        return fromApi;
    }, [filterOptions?.localities, filterArea]);
    const propertyTypeOptions = filterOptions?.propertyTypes ?? [];
    const leads = data?.data ?? [];
    const pagination = data?.pagination;
    // ── Mutations ─────────────────────────────────────────────────────────────
    const updateMutation = useUpdateLead(editingLead?._id ?? "");
    const updateStatusMutation = useUpdateLeadStatus();
    const deleteMutation = useDeleteLead();
    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = useCallback((payload) => {
        if (!editingLead)
            return;
        updateMutation.mutate(payload, {
            onSuccess: () => setEditingLead(null),
        });
    }, [editingLead, updateMutation]);
    const handleStatusChange = useCallback((lead, status) => {
        updateStatusMutation.mutate({ lead, status });
    }, [updateStatusMutation]);
    const handleDeleteConfirm = useCallback(() => {
        if (!deletingLead)
            return;
        deleteMutation.mutate(deletingLead, {
            onSuccess: () => setDeletingLead(null),
        });
    }, [deleteMutation, deletingLead]);
    const dateFormatter = useMemo(() => new Intl.DateTimeFormat("en-IN", {
        day: "numeric", month: "short", year: "2-digit",
    }), []);
    // ─────────────────────────────────────────────────────────────────────────
    return (<PermissionGate module="leads" action="read" fallback={<Unauthorized />}>
      <div className="space-y-4 sm:space-y-6">

        <AdminPageHeader title="Leads" description="Manage and track property leads" onRefresh={() => refetch()} isFetching={isFetching}/>

        {/* Stats */}
        <StatCards />

        {/* Table Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
              All Leads
              {pagination && (<span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({pagination.total})
                </span>)}
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Search by name, phone, notes..." value={searchInput} onChange={handleSearchChange} className="pl-9"/>
              </div>
              <Select value={filterStatus} onValueChange={withResetPage(setFilterStatus)}>
                <SelectTrigger className="sm:w-36">
                  <SelectValue placeholder="Status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {LEAD_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filterArea} onValueChange={withResetPage(setFilterArea)}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Area"/>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Areas</SelectItem>
                  {areaOptions.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={withResetPage(setFilterType)}>
                <SelectTrigger className="sm:w-36">
                  <SelectValue placeholder="Property Type"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypeOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Table */}
            {isLoading ? (<>
                <div className="hidden sm:block">
                  <TableSkeleton cols={8} rows={8} />
                </div>
                <div className="sm:hidden">
                  <MobileCardSkeleton rows={5} />
                </div>
              </>) : (<>
                <div className="hidden sm:block overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Property Type</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.length === 0 ? (<TableRow>
                          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            No leads found.
                          </TableCell>
                        </TableRow>) : (leads.map((lead) => (<TableRow key={lead._id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{lead.customerName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lead.phone}</TableCell>
                            <TableCell className="text-sm">{lead.propertyType}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lead.area}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {lead.budget || "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={lead.status}/>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {dateFormatter.format(new Date(lead.createdAt))}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    {updatingIds.has(lead._id)
                    ? <Loader2 className="h-4 w-4 animate-spin"/>
                    : <MoreHorizontal className="h-4 w-4"/>}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setViewingLead(lead)} className="gap-2 cursor-pointer">
                                    <Eye className="h-4 w-4"/>View Details
                                  </DropdownMenuItem>

                                  {canWrite && (<DropdownMenuItem onClick={() => setEditingLead(lead)} className="gap-2 cursor-pointer">
                                      <Edit2 className="h-4 w-4"/>Edit
                                    </DropdownMenuItem>)}

                                  {canWrite && lead.status !== "Contacted" && (<DropdownMenuItem onClick={() => handleStatusChange(lead, "Contacted")} className="gap-2 cursor-pointer">
                                      <PhoneCall className="h-4 w-4"/>Mark Contacted
                                    </DropdownMenuItem>)}

                                  {canWrite && lead.status !== "Closed" && (<DropdownMenuItem onClick={() => handleStatusChange(lead, "Closed")} className="gap-2 cursor-pointer">
                                      <CheckCircle2 className="h-4 w-4"/>Mark Closed
                                    </DropdownMenuItem>)}

                                  {canWrite && lead.status !== "New" && (<DropdownMenuItem onClick={() => handleStatusChange(lead, "New")} className="gap-2 cursor-pointer">
                                      <Zap className="h-4 w-4"/>Mark New
                                    </DropdownMenuItem>)}

                                  {canDelete && (<>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setDeletingLead(lead)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                                        <Trash2 className="h-4 w-4"/>Delete
                                      </DropdownMenuItem>
                                    </>)}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>)))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {leads.length === 0 ? (<p className="text-center py-8 text-sm text-muted-foreground">
                      No leads found.
                    </p>) : (leads.map((lead) => (<div key={lead._id} className="border rounded-lg p-4 space-y-3 bg-card">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{lead.customerName}</p>
                            <p className="text-xs text-muted-foreground">{lead.phone}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingLead(lead)} className="gap-2 cursor-pointer">
                                <Eye className="h-4 w-4"/>View
                              </DropdownMenuItem>
                              {canWrite && (<DropdownMenuItem onClick={() => setEditingLead(lead)} className="gap-2 cursor-pointer">
                                  <Edit2 className="h-4 w-4"/>Edit
                                </DropdownMenuItem>)}
                              {canWrite && lead.status !== "Contacted" && (<DropdownMenuItem onClick={() => handleStatusChange(lead, "Contacted")} className="gap-2 cursor-pointer">
                                  <PhoneCall className="h-4 w-4"/>Mark Contacted
                                </DropdownMenuItem>)}
                              {canWrite && lead.status !== "Closed" && (<DropdownMenuItem onClick={() => handleStatusChange(lead, "Closed")} className="gap-2 cursor-pointer">
                                  <CheckCircle2 className="h-4 w-4"/>Mark Closed
                                </DropdownMenuItem>)}
                              {canDelete && (<>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setDeletingLead(lead)} className="gap-2 cursor-pointer text-destructive">
                                    <Trash2 className="h-4 w-4"/>Delete
                                  </DropdownMenuItem>
                                </>)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={lead.status}/>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3"/>{lead.propertyType}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3"/>{lead.area}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {lead.budget && <span>Budget: {lead.budget}</span>}
                          <span className="flex items-center gap-1 ml-auto">
                            <Calendar className="h-3 w-3"/>
                            {dateFormatter.format(new Date(lead.createdAt))}
                          </span>
                        </div>
                      </div>)))}
                </div>

                {pagination && pagination.totalPages > 1 && (<ServerPagination className="pt-2" currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} itemsPerPage={pagination.limit} onPageChange={setCurrentPage} countSuffix=" leads"/>)}
              </>)}
          </CardContent>
        </Card>

        {/* ── Dialogs ──────────────────────────────────────────────────────────── */}

        {/* Edit */}
        <LeadFormDialog open={!!editingLead} onOpenChange={(v) => !v && setEditingLead(null)} onSubmit={handleEdit} isSubmitting={updateMutation.isPending} lead={editingLead}/>

        {/* View */}
        <ViewLeadDialog lead={viewingLead} onClose={() => setViewingLead(null)}/>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingLead} onOpenChange={(v) => !v && setDeletingLead(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the lead for{" "}
              <strong>{deletingLead?.customerName}</strong>? This cannot be undone.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2 pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteMutation.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </PermissionGate>);
}
