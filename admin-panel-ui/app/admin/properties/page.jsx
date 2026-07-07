"use client"

import { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Building2, Search, MoreHorizontal, Eye, Check, X, Star, Trash2, MapPin, Grid3X3, List, CheckCircle, Loader2, Plus, } from "lucide-react";
import { PropertyGridSkeleton, PropertyListSkeleton } from "@/components/admin/common/skeletons";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { usePermission } from "@/hooks/use-permissions";
import { usePropertyList, usePropertyStats, useUpdatePropertyStatus, useDeleteProperty, } from "@/hooks/use-property-queries";
import { usePropertyStore } from "@/lib/store/property.store";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { AdminStatGrid } from "@/components/admin/common/admin-stat-grid";
import { ServerPagination } from "@/components/admin/common/server-pagination";
import { useAdminListState } from "@/hooks/use-admin-list-state";
import { formatInrCompact } from "@/lib/formatters";
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(property) {
    const price = property.pricing?.totalPrice ?? property.pricing?.monthlyRent ?? property.pricing?.startingPrice;
    if (!price)
        return "Price TBD";
    const formatted = formatInrCompact(price);
    return property?.listingCategory === "Rental" ? `${formatted}/mo` : formatted;
}
function getStatusVariant(status) {
    switch (status) {
        case "Active": return "default";
        case "Sold": return "outline";
        case "Inactive": return "destructive";
        default: return "secondary";
    }
}
const ITEMS_PER_PAGE = 12;
// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
    const { data: stats, isLoading } = usePropertyStats();
    const cards = useMemo(() => [
        { label: "Total", value: stats?.total, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
        { label: "Active", value: stats?.active, icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/10" },
        { label: "Sold", value: stats?.sold, icon: Star, color: "text-blue-600", bg: "bg-blue-500/10" },
        { label: "Inactive", value: stats?.inactive, icon: X, color: "text-red-600", bg: "bg-red-500/10" },
        { label: "Featured", value: stats?.featured, icon: Star, color: "text-yellow-600", bg: "bg-yellow-500/10" },
    ], [stats?.total, stats?.active, stats?.sold, stats?.inactive, stats?.featured]);
    return (<AdminStatGrid items={cards} isLoading={isLoading} gridClassName="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5"/>);
}
// ─── Property Card (Grid View) ────────────────────────────────────────────────
const PropertyCard = memo(function PropertyCard({ property, canWrite, canDelete, isUpdating, onStatusChange, onDelete, }) {
    const photo = property?.photos?.[0];
    const status = property?.status;
    return (<Card className="overflow-hidden">
      <div className="relative h-40 sm:h-48">
        {photo ? (<Image src={photo} alt={property?.title ?? "Property"} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" priority={false}/>) : (<div className="flex h-full items-center justify-center bg-muted">
            <Building2 className="h-16 w-16 text-muted-foreground/30"/>
          </div>)}
        <Badge className="absolute right-3 top-3" variant={getStatusVariant(status)}>
          {status}
        </Badge>
      </div>

      <CardContent className="p-3 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold line-clamp-1 text-sm sm:text-base">
              {property?.title}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0"/>
              <span className="line-clamp-1">
                {property.location?.locality}, {property.location?.city}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4"/>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/properties/${property._id}`} className="gap-2 cursor-pointer">
                  <Eye className="h-4 w-4"/>View Details
                </Link>
              </DropdownMenuItem>
              {canWrite && status === "Active" && (<DropdownMenuItem onClick={() => onStatusChange(property._id, "Inactive")} className="gap-2 cursor-pointer">
                  <X className="h-4 w-4"/>Deactivate
                </DropdownMenuItem>)}
              {canWrite && status === "Inactive" && (<DropdownMenuItem onClick={() => onStatusChange(property._id, "Active")} className="gap-2 cursor-pointer text-green-600">
                  <Check className="h-4 w-4"/>Activate
                </DropdownMenuItem>)}
              {canDelete && (<>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(property)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4"/>Delete
                  </DropdownMenuItem>
                </>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-base sm:text-lg font-bold text-primary">{formatPrice(property)}</p>
          <Badge variant="outline" className="text-xs capitalize">
            {property?.listingCategory}
          </Badge>
        </div>

        <div className="mt-2 text-xs text-muted-foreground capitalize">
          {property?.propertyType}
        </div>
      </CardContent>
    </Card>);
});
// ─── Property Row (List View) ─────────────────────────────────────────────────
const PropertyRow = memo(function PropertyRow({ property, canWrite, canDelete, isUpdating, onStatusChange, onDelete, }) {
    const photo = property?.photos?.[0];
    return (<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4">
      <div className="relative h-32 sm:h-20 sm:w-28 w-full shrink-0 overflow-hidden rounded-lg">
        {photo ? (<Image src={photo} alt={property?.title ?? "Property"} fill sizes="(max-width: 640px) 100vw, 112px" className="object-cover" priority={false}/>) : (<div className="flex h-full items-center justify-center bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground/50"/>
          </div>)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base line-clamp-1">
          {property?.title}
        </p>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-0.5">
          <MapPin className="h-3 w-3 shrink-0"/>
          <span className="line-clamp-1">
            {property.location?.locality}, {property.location?.city}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {property?.propertyType} · {property?.listingCategory}
        </p>
      </div>

      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
        <p className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
          {formatPrice(property)}
        </p>
        <Badge variant={getStatusVariant(property.status)}>{property.status}</Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4"/>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/properties/${property._id}`} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4"/>View Details
            </Link>
          </DropdownMenuItem>
          {canWrite && property.status === "Active" && (<DropdownMenuItem onClick={() => onStatusChange(property._id, "Inactive")} className="gap-2 cursor-pointer">
              <X className="h-4 w-4"/>Deactivate
            </DropdownMenuItem>)}
          {canDelete && (<>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(property)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4"/>Delete
              </DropdownMenuItem>
            </>)}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>);
});
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
    const canWrite  = usePermission("properties").canWrite;
    const canDelete = usePermission("properties").canDelete;
    // Serialize updatingIds to a plain Set — each component reads only what it needs
    const updatingIds = usePropertyStore((s) => s.updatingIds);
    const { searchInput, debouncedSearch, currentPage, setCurrentPage, handleSearchChange, withResetPage, } = useAdminListState();
    const [viewMode, setViewMode] = useState("grid");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [filterCat, setFilterCat] = useState("all");
    const [deletingProp, setDeletingProp] = useState(null);
    const params = useMemo(() => ({
        search: debouncedSearch || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        propertyType: filterType !== "all" ? filterType : undefined,
        listingCategory: filterCat !== "all" ? filterCat : undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    }), [debouncedSearch, filterStatus, filterType, filterCat, currentPage]);
    const { data, isLoading, isFetching, refetch } = usePropertyList(params);
    const statusMutation = useUpdatePropertyStatus();
    const deleteMutation = useDeleteProperty();
    const properties = data?.data ?? [];
    const pagination = data?.pagination;
    const handleStatusChange = useCallback((id, status) => {
        statusMutation.mutate({ id, status });
    }, [statusMutation]);
    const handleDeleteConfirm = useCallback(() => {
        if (!deletingProp)
            return;
        deleteMutation.mutate(deletingProp, { onSuccess: () => setDeletingProp(null) });
    }, [deleteMutation, deletingProp]);
    return (<PermissionGate module="properties" action="read" fallback={<Unauthorized />}>
      <div className="space-y-4 sm:space-y-6">

        <AdminPageHeader title="Properties" description="View and manage your properties" onRefresh={() => refetch()} isFetching={isFetching}>
          <PermissionGate module="properties" action="write">
            <Button>
              <Link className="gap-2 flex items-center text-sm sm:text-base sm:gap-2 btn btn-primary sm:btn-sm btn-primary" href="/admin/properties/create">
                <Plus className="h-4 w-4"/>
                Create Property
              </Link>
            </Button>
          </PermissionGate>
        </AdminPageHeader>
        {/* Stats */}
        <StatCards />

        {/* Table Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
              All Properties
              {pagination && (<span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({pagination.total})
                </span>)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4"/>
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4"/>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Search properties..." value={searchInput} onChange={handleSearchChange} className="pl-9"/>
              </div>
              <Select value={filterStatus} onValueChange={withResetPage(setFilterStatus)}>
                <SelectTrigger className="sm:w-36"><SelectValue placeholder="Status"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCat} onValueChange={withResetPage(setFilterCat)}>
                <SelectTrigger className="sm:w-36"><SelectValue placeholder="Category"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Resale">Resale</SelectItem>
                  <SelectItem value="Rental">Rental</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={withResetPage(setFilterType)}>
                <SelectTrigger className="sm:w-44"><SelectValue placeholder="Type"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Flat/Apartment">Flat/Apartment</SelectItem>
                  <SelectItem value="Villa/Independent House">Villa/House</SelectItem>
                  <SelectItem value="Penthouse">Pent House</SelectItem>
                  <SelectItem value="Office Space">Office Space</SelectItem>
                  <SelectItem value="Shop">Shop</SelectItem>
                  <SelectItem value="Showroom">Showroom</SelectItem>
                  <SelectItem value="Warehouse/Godown">Warehouse</SelectItem>
                  <SelectItem value="Residential Plot">Residential Plot</SelectItem>
                  <SelectItem value="Agricultural Land">Agricultural Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            {isLoading ? (
              viewMode === "grid"
                ? <PropertyGridSkeleton count={ITEMS_PER_PAGE} />
                : <PropertyListSkeleton count={ITEMS_PER_PAGE} />
            ) : properties.length === 0 ? (<div className="py-16 text-center text-muted-foreground">
                No properties found matching your criteria.
              </div>) : viewMode === "grid" ? (<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 scroll-gpu touch-pan">
                {properties.map((property) => (<div key={property._id} className="property-card-item"><PropertyCard property={property} canWrite={canWrite} canDelete={canDelete} isUpdating={updatingIds.has(property._id)} onStatusChange={handleStatusChange} onDelete={setDeletingProp}/></div>))}
              </div>) : (<div className="space-y-3 scroll-gpu touch-pan">
                {properties.map((property) => (<div key={property._id} className="property-card-item"><PropertyRow property={property} canWrite={canWrite} canDelete={canDelete} isUpdating={updatingIds.has(property._id)} onStatusChange={handleStatusChange} onDelete={setDeletingProp}/></div>))}
              </div>)}

            {pagination && pagination.total > 0 && (<ServerPagination className="pt-2" currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} itemsPerPage={pagination.limit} onPageChange={setCurrentPage}/>)}
          </CardContent>
        </Card>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingProp} onOpenChange={(v) => !v && setDeletingProp(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{deletingProp?.title}</strong>?
              This cannot be undone.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2 pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </PermissionGate>);
}
