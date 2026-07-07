// components/admin/user/plans-tab.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Plus, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useUserPlans, useCreateUserPlan, useUpdateUserPlan, useDeleteUserPlan, } from "@/hooks/use-user-plan-queries";
import { usePlanOptions } from "@/hooks/use-plan-queries";
import { formatInr } from "@/lib/formatters";
const PLAN_STATUSES = ["Active", "Expired", "Cancelled", "Pending", "Inactive"];
const planSchema = z.object({
    planId: z.string().min(1, "Select a plan"),
    startDate: z.string().min(1, "Start date required"),
    endDate: z.string().optional(),
    status: z.enum(PLAN_STATUSES).default("Active"),
    paymentId: z.string().optional(),
    orderId: z.string().optional(),
    method: z.string().optional(),
});
const STATUS_STYLES = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Expired: "bg-gray-50 text-gray-600 border-gray-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Inactive: "bg-gray-50 text-gray-500 border-gray-200",
};
function fmtDate(d) {
    if (!d)
        return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function isExpiringSoon(endDate) {
    const diff = new Date(endDate).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}
function PlanDialog({ open, onOpenChange, onSubmit, isSubmitting, plans, plansLoading, editRecord }) {
    const isEdit = !!editRecord;
    const safePlans = Array.isArray(plans) ? plans : [];
    const form = useForm({
        resolver: zodResolver(planSchema),
        defaultValues: {
            planId: "", startDate: new Date().toISOString().split("T")[0],
            endDate: "", status: "Active", paymentId: "", orderId: "", method: "",
        },
    });
    // Prefill on edit
    useEffect(() => {
        if (!open) {
            form.reset({
                planId: "", startDate: new Date().toISOString().split("T")[0],
                endDate: "", status: "Active", paymentId: "", orderId: "", method: "",
            });
            return;
        }
        if (editRecord) {
            const planId = typeof editRecord.planId === "object"
                ? editRecord.planId._id
                : editRecord.planId;
            form.reset({
                planId: planId ?? "",
                startDate: editRecord.startDate?.split("T")[0] ?? "",
                endDate: editRecord.isDurationUnlimited ? "" : (editRecord.endDate?.split("T")[0] ?? ""),
                status: editRecord.status ?? "Active",
                paymentId: editRecord.paymentDetails?.paymentId ?? "",
                orderId: editRecord.paymentDetails?.orderId ?? "",
                method: editRecord.paymentDetails?.method ?? "",
            });
        }
    }, [open, editRecord]);
    const selectedPlanId = form.watch("planId");
    const selectedPlan = safePlans.find((p) => p._id === selectedPlanId);
    // Auto-fill dates and amount when plan is selected (create mode only)
    useEffect(() => {
        if (!selectedPlanId || isEdit)
            return;
        const plan = safePlans.find((p) => p._id === selectedPlanId);
        if (!plan)
            return;
        const today = new Date();
        const startStr = today.toISOString().split("T")[0];
        form.setValue("startDate", startStr);
        if (plan.isDurationUnlimited) {
            form.setValue("endDate", "");
        }
        else {
            const end = new Date(today);
            if (plan.durationUnit === "days")
                end.setDate(end.getDate() + plan.duration);
            if (plan.durationUnit === "months")
                end.setMonth(end.getMonth() + plan.duration);
            if (plan.durationUnit === "years")
                end.setFullYear(end.getFullYear() + plan.duration);
            form.setValue("endDate", end.toISOString().split("T")[0]);
        }
    }, [selectedPlanId, isEdit]);
    return (<Dialog open={open} onOpenChange={(v) => { if (!isSubmitting)
        onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan Record" : "Assign Plan"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this subscription record." : "Assign a plan to this user."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Plan select */}
          <div className="space-y-2">
            <Label>Plan <span className="text-destructive">*</span></Label>
            {plansLoading ? (<Skeleton className="h-10 w-full"/>) : (<Select value={form.watch("planId")} onValueChange={(v) => form.setValue("planId", v)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan"/>
                </SelectTrigger>
                <SelectContent>
                  {safePlans.filter((p) => p.isActive).map((p) => (<SelectItem key={p._id} value={p._id}>
                      <span className="flex items-center gap-2">
                        <Crown className="h-3 w-3"/>
                        {p.name}
                        <span className="text-muted-foreground text-xs">
                          {p.isFree ? "Free" : formatInr(p.price)}
                          {!p.isDurationUnlimited && p.duration ? ` · ${p.duration} ${p.durationUnit}` : " · Unlimited"}
                        </span>
                      </span>
                    </SelectItem>))}
                </SelectContent>
              </Select>)}
            {form.formState.errors.planId && (<p className="text-xs text-destructive">{form.formState.errors.planId.message}</p>)}
          </div>

          {/* Plan preview */}
          {selectedPlan && (<div className="rounded-md bg-muted/40 border p-3 text-sm space-y-1">
              <p className="font-medium">{selectedPlan.name}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Price: <strong className="text-foreground">{selectedPlan.isFree ? "Free" : formatInr(selectedPlan.price)}</strong></span>
                <span>Duration: <strong className="text-foreground">{selectedPlan.isDurationUnlimited ? "Unlimited" : `${selectedPlan.duration} ${selectedPlan.durationUnit}`}</strong></span>
                <span>Properties: <strong className="text-foreground">{selectedPlan.limits.isPropertyUploadUnlimited ? "Unlimited" : selectedPlan.limits.propertyUploads}</strong></span>
                <span>Leads: <strong className="text-foreground">{selectedPlan.limits.isLeadAccessUnlimited ? "Unlimited" : selectedPlan.limits.leadAccessCount}</strong></span>
              </div>
            </div>)}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v)} disabled={isSubmitting}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Input placeholder="e.g. UPI, Card, Cash" disabled={isSubmitting} {...form.register("method")}/>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date <span className="text-destructive">*</span></Label>
              <Input type="date" disabled={isSubmitting} {...form.register("startDate")}/>
              {form.formState.errors.startDate && (<p className="text-xs text-destructive">{form.formState.errors.startDate.message}</p>)}
            </div>

            {/* End Date — hidden if plan is unlimited */}
            {(!selectedPlan || !selectedPlan.isDurationUnlimited) && (<div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" disabled={isSubmitting} {...form.register("endDate")}/>
              </div>)}

            {/* Payment ID */}
            <div className="space-y-2">
              <Label>Payment ID</Label>
              <Input placeholder="e.g. pay_ABC123" disabled={isSubmitting} {...form.register("paymentId")}/>
            </div>

            {/* Order ID */}
            <div className="space-y-2">
              <Label>Order ID</Label>
              <Input placeholder="e.g. order_XYZ" disabled={isSubmitting} {...form.register("orderId")}/>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || plansLoading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {isEdit ? "Save Changes" : "Assign Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);
}
// ─── Main PlansTab ────────────────────────────────────────────────────────────
export function PlansTab({ userId }) {
    const { data: plans = [], isLoading, isError } = useUserPlans(userId);
    const { data: availablePlans = [], isLoading: plansLoading } = usePlanOptions();
    const createMutation = useCreateUserPlan(userId);
    const updateMutation = useUpdateUserPlan(userId);
    const deleteMutation = useDeleteUserPlan(userId);
    const [createOpen, setCreateOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const handleCreate = (data) => {
        const payload = {
            planId: data.planId,
            startDate: data.startDate,
            endDate: data.endDate || undefined,
            status: data.status,
            paymentId: data.paymentId || undefined,
            orderId: data.orderId || undefined,
            method: data.method || undefined,
        };
        createMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
    };
    const handleUpdate = (data) => {
        if (!editRecord)
            return;
        const payload = {
            planId: data.planId,
            startDate: data.startDate,
            endDate: data.endDate || undefined,
            status: data.status,
            paymentId: data.paymentId || undefined,
            orderId: data.orderId || undefined,
            method: data.method || undefined,
        };
        updateMutation.mutate({ planId: editRecord._id, payload }, { onSuccess: () => setEditRecord(null) });
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });
    };
    if (isLoading)
        return (<div className="space-y-3">
      {[1, 2].map((i) => (<div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0"/>
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-44"/>
                <Skeleton className="h-3 w-40"/>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-5 w-20 rounded-full"/>
              <Skeleton className="h-7 w-7 rounded-md"/>
              <Skeleton className="h-7 w-7 rounded-md"/>
            </div>
          </div>
          <Skeleton className="h-px w-full"/>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (<div key={j} className="space-y-2">
                <Skeleton className="h-3 w-16"/>
                <Skeleton className="h-4 w-20"/>
              </div>))}
          </div>
        </div>))}
    </div>);
    if (isError)
        return (<div className="flex flex-col items-center py-10 gap-2 text-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground"/>
      <p className="text-sm text-muted-foreground">Failed to load plan records</p>
    </div>);
    return (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Plan History
          <span className="ml-2 text-sm font-normal text-muted-foreground">({plans.length})</span>
        </h3>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4"/>Assign Plan
        </Button>
      </div>

      {plans.length === 0 ? (<div className="flex flex-col items-center justify-center py-12 text-center gap-3 rounded-lg border border-dashed">
          <Crown className="h-10 w-10 text-muted-foreground/40"/>
          <div>
            <p className="text-sm font-medium">No plans assigned</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Assign Plan" to add the first plan</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-3 w-3"/>Assign Plan
          </Button>
        </div>) : (<div className="space-y-3">
          {plans.map((plan) => {
                const soon = plan.status === "Active" && plan.endDate && isExpiringSoon(plan.endDate);
                return (<div key={plan._id} className="rounded-lg border p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-50 p-2.5 shrink-0">
                      <Crown className="h-5 w-5 text-orange-600"/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                          <Crown className="h-3 w-3"/>{plan.planName}
                        </span>
                        {soon && (<span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                            Expiring soon
                          </span>)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtDate(plan.startDate)} → {plan.isDurationUnlimited ? "Unlimited" : fmtDate(plan.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[plan.status] ?? STATUS_STYLES.Expired}`}>
                      {plan.status}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditRecord(plan)}>
                      <Edit2 className="h-3.5 w-3.5"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(plan)}>
                      <Trash2 className="h-3.5 w-3.5"/>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold text-primary">{plan.isFree ? "Free" : formatInr(plan.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-xs">{plan.isDurationUnlimited ? "Unlimited" : `${plan.duration ?? "—"} ${plan.durationUnit}`}</p>
                  </div>
                  {plan.paymentDetails?.paymentId && (<div>
                      <p className="text-xs text-muted-foreground">Payment ID</p>
                      <p className="font-mono text-xs truncate">{plan.paymentDetails.paymentId}</p>
                    </div>)}
                  <div>
                    <p className="text-xs text-muted-foreground">Added on</p>
                    <p className="text-xs">{fmtDate(plan.createdAt)}</p>
                  </div>
                </div>

                {/* Limits */}
                {plan.limits && (<>
                    <Separator />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                      <div>
                        <p className="text-muted-foreground">Properties</p>
                        <p className="font-semibold">{plan.limits.isPropertyUploadUnlimited ? "∞" : plan.limits.propertyUploads}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Leads</p>
                        <p className="font-semibold">{plan.limits.isLeadAccessUnlimited ? "∞" : plan.limits.leadAccessCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Featured</p>
                        <p className="font-semibold">{plan.limits.isFeaturedPropertiesUnlimited ? "∞" : plan.limits.featuredProperties}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Analytics</p>
                        <p className="font-semibold">{plan.limits.analyticsAccess ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </>)}

                {/* Usage */}
                {plan.usage && (<>
                    <Separator />
                    <div className="grid grid-cols-3 gap-3 text-xs text-center">
                      <div>
                        <p className="text-muted-foreground">Used: Properties</p>
                        <p className="font-semibold">{plan.usage.propertiesPosted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Used: Leads</p>
                        <p className="font-semibold">{plan.usage.leadsUnlocked}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Used: Featured</p>
                        <p className="font-semibold">{plan.usage.featuredPropertiesUsed}</p>
                      </div>
                    </div>
                  </>)}
              </div>);
            })}
        </div>)}

      {/* Summary */}
      {plans.length > 0 && (<div className="grid grid-cols-3 gap-3 pt-1">
          {[
                { label: "Total plans", value: plans.length },
                { label: "Active", value: plans.filter((p) => p.status === "Active").length },
                { label: "Total paid", value: formatInr(plans.reduce((s, p) => s + (p.paymentDetails?.amountPaid ?? 0), 0)) },
            ].map(({ label, value }) => (<div key={label} className="rounded-md bg-muted/40 border p-3 text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-bold text-sm mt-0.5">{value}</p>
            </div>))}
        </div>)}

      <PlanDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} isSubmitting={createMutation.isPending} plans={availablePlans} plansLoading={plansLoading}/>
      <PlanDialog open={!!editRecord} onOpenChange={(v) => !v && setEditRecord(null)} onSubmit={handleUpdate} isSubmitting={updateMutation.isPending} plans={availablePlans} plansLoading={plansLoading} editRecord={editRecord}/>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Plan Record</AlertDialogTitle>
          <AlertDialogDescription>
            Remove the <strong>{deleteTarget?.planName}</strong> plan record? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}
