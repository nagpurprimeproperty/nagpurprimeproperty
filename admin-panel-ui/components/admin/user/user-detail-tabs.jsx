"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Building2, ChevronLeft, ChevronRight, Edit2, Eye, Loader2, MessageSquare, MoreHorizontal, Phone, Plus, ToggleLeft, ToggleRight, Trash2, Zap } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PermissionGate } from "@/components/utils/permission-gate";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLeads, useUserQueries } from "@/hooks/use-user-queries";
import { useDeleteProperty, usePropertyList, useUpdatePropertyStatus } from "@/hooks/use-property-queries";
import { usePropertyStore } from "@/lib/store/property.store";
import { formatInrCompact } from "@/lib/formatters";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtPrice(price, type) {
  const f = formatInrCompact(price);
  return type === "rent" ? `${f}/mo` : f;
}

export function QueriesTab({ userId }) {
  const { data, isLoading, isError } = useUserQueries(userId);
  const queries = data?.data ?? [];
  const statusStyle = {
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Contacted: "bg-green-50 text-green-700 border-green-200",
    Closed: "bg-gray-50 text-gray-600 border-gray-200",
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-10 gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load queries</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Queries Sent ({queries.length})</h3>
      {queries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No queries sent by this user.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queries.map((q) => (
            <div key={q._id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{q.propertyType} in {q.area}</p>
                  <p className="text-xs text-muted-foreground">By: {q.customerName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyle[q.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {q.status}
                  </span>
                </div>
              </div>
              {q.notes && <p className="text-sm text-muted-foreground bg-muted/40 rounded p-2.5 italic">"{q.notes}"</p>}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{q.phone}</span>
                {q.budget != null && <span className="font-medium">Budget: {q.budget}</span>}
                <span>{fmtDate(q.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertiesTab({ userId }) {
  const router = useRouter();
  const [deletingProp, setDeletingProp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const params = { brokerId: userId, page: currentPage, limit: 6 };
  const { data, isLoading, isError } = usePropertyList(params);
  const statusMutation = useUpdatePropertyStatus();
  const deleteMutation = useDeleteProperty();
  const updatingIds = usePropertyStore((s) => s.updatingIds);
  const properties = data?.data ?? [];
  const pagination = data?.pagination;

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const handleDeleteConfirm = () => {
    if (!deletingProp) return;
    deleteMutation.mutate(deletingProp, { onSuccess: () => setDeletingProp(null) });
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-44" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  if (isError) {
    return (
      <div className="flex flex-col items-center py-10 gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Properties Posted
          {pagination && <span className="ml-2 text-sm font-normal text-muted-foreground">({pagination.total})</span>}
        </h3>
        <PermissionGate module="properties" action="write">
          <Button size="sm" className="gap-2" asChild>
            <Link href="/admin/properties/create">
              <Plus className="h-4 w-4" />Add Property
            </Link>
          </Button>
        </PermissionGate>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3 rounded-lg border border-dashed">
          <Building2 className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">No properties posted</p>
            <p className="text-xs text-muted-foreground mt-1">This user hasn't listed any properties yet</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((prop) => {
            const isUpdating = updatingIds.has(prop._id);
            return (
              <div key={prop._id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{prop.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {prop.propertyType} · {prop.location?.locality}, {prop.location?.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={prop.status === "Active" ? "default" : prop.status === "Inactive" ? "destructive" : "outline"}>
                      {prop.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/properties/${prop._id}`} className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />View Details
                          </Link>
                        </DropdownMenuItem>
                        <PermissionGate module="properties" action="write">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/properties/${prop._id}/edit`} className="gap-2 cursor-pointer">
                              <Edit2 className="h-4 w-4" />Edit Property
                            </Link>
                          </DropdownMenuItem>
                          {prop.status === "Active" && (
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleStatusChange(prop._id, "Inactive")}>
                              <ToggleLeft className="h-4 w-4" />Deactivate
                            </DropdownMenuItem>
                          )}
                          {prop.status === "Inactive" && (
                            <DropdownMenuItem className="gap-2 cursor-pointer text-green-600" onClick={() => handleStatusChange(prop._id, "Active")}>
                              <ToggleRight className="h-4 w-4" />Activate
                            </DropdownMenuItem>
                          )}
                        </PermissionGate>
                        <PermissionGate module="properties" action="delete">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeletingProp(prop)}>
                            <Trash2 className="h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </PermissionGate>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold text-primary">
                      {(() => {
                        const price = prop.pricing?.totalPrice ?? prop.pricing?.monthlyRent ?? prop.pricing?.startingPrice;
                        if (!price) return "TBD";
                        return fmtPrice(price, prop.listingCategory === "Rental" ? "rent" : "sale");
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium capitalize text-sm">{prop.listingCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Listed</p>
                    <p className="font-medium text-sm">{fmtDate(prop.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={pagination.page === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Button key={p} size="sm" variant={pagination.page === p ? "default" : "outline"} className="h-7 w-7 p-0 text-xs" onClick={() => setCurrentPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={pagination.page === pagination.totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deletingProp} onOpenChange={(v) => !v && setDeletingProp(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Property</AlertDialogTitle>
          <AlertDialogDescription>
            Permanently delete <strong>{deletingProp?.title}</strong>? This cannot be undone.
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
  );
}

export function LeadsTab({ userId }) {
  const { data, isLoading, isError } = useUserLeads(userId);
  const leads = data?.data ?? [];
  const statusStyle = {
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Contacted: "bg-green-50 text-green-700 border-green-200",
    Closed: "bg-gray-50 text-gray-600 border-gray-200",
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  if (isError) {
    return (
      <div className="flex flex-col items-center py-10 gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load leads</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Leads Received ({leads.length})</h3>
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Zap className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No leads received on this user's properties.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead._id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{lead.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">For: {lead.propertyType} in {lead.area}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyle[lead.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
              {lead.notes && <p className="text-sm text-muted-foreground bg-muted/40 rounded p-2.5 italic">"{lead.notes}"</p>}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>
                {lead.budget != null && <span className="font-medium">Budget: {lead.budget}</span>}
                <span>{fmtDate(lead.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
