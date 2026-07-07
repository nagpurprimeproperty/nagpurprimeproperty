"use client"

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { PROPERTY_TYPES, LEAD_STATUSES } from "@/lib/api/lead.api";
import { useLeadFilterOptions } from "@/hooks/use-lead-queries";
// ─── Zod schema ───────────────────────────────────────────────────────────────
const schema = z.object({
    customerName: z
        .string({ required_error: "Customer name is required" })
        .min(2, "Min 2 characters")
        .max(100, "Max 100 characters")
        .trim(),
    phone: z
        .string({ required_error: "Phone is required" })
        .regex(/^\d{10}$/, "Enter a valid 10-digit number"),
    propertyType: z.enum(PROPERTY_TYPES, {
        errorMap: () => ({ message: "Select a property type" }),
    }),
    area: z.string().min(1, "Select a valid locality"),
    budget: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
    notes: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
    status: z.enum(["New", "Contacted", "Closed"]).optional().default("New"),
});
export function LeadFormDialog({ open, onOpenChange, onSubmit, isSubmitting, lead }) {
    const isEdit = !!lead;
    const { data: filterOptions } = useLeadFilterOptions();
    const areaOptions = useMemo(() => {
        const fromApi = filterOptions?.localities ?? [];
        const current = lead?.area;
        if (current && !fromApi.includes(current)) {
            return [...fromApi, current].sort((a, b) => a.localeCompare(b));
        }
        return fromApi;
    }, [filterOptions?.localities, lead?.area]);
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            customerName: "",
            phone: "",
            propertyType: undefined,
            area: undefined,
            budget: "",
            notes: "",
            status: "New",
        },
    });
    useEffect(() => {
        if (open) {
            form.reset(lead
                ? {
                    customerName: lead.customerName,
                    phone: lead.phone,
                    propertyType: lead.propertyType,
                    area: lead.area,
                    budget: lead.budget ?? "",
                    notes: lead.notes ?? "",
                    status: lead.status,
                }
                : {
                    customerName: "",
                    phone: "",
                    propertyType: undefined,
                    area: undefined,
                    budget: "",
                    notes: "",
                    status: "New",
                });
        }
    }, [open, lead]); // eslint-disable-line
    const handleClose = () => {
        form.reset();
        onOpenChange(false);
    };
    const handleSubmit = (data) => {
        const clean = { ...data };
        if (!clean.budget)
            delete clean.budget;
        if (!clean.notes)
            delete clean.notes;
        onSubmit(clean);
    };
    return (<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lead" : "Create New Lead"}</DialogTitle>
          <DialogDescription>
            {isEdit
            ? "Update the lead information below."
            : "Add a new property lead to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label>
              Customer Name <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="e.g. Rahul Deshmukh" disabled={isSubmitting} {...form.register("customerName")}/>
            {form.formState.errors.customerName && (<p className="text-xs text-destructive">
                {form.formState.errors.customerName.message}
              </p>)}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="9876543210" disabled={isSubmitting} {...form.register("phone")}/>
            {form.formState.errors.phone && (<p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>)}
          </div>

          {/* Property Type + Area */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>
                Property Type <span className="text-destructive">*</span>
              </Label>
              <Select value={form.watch("propertyType")} onValueChange={(v) => form.setValue("propertyType", v, { shouldValidate: true })} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type"/>
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
              {form.formState.errors.propertyType && (<p className="text-xs text-destructive">
                  {form.formState.errors.propertyType.message}
                </p>)}
            </div>

            <div className="space-y-2">
              <Label>
                Area <span className="text-destructive">*</span>
              </Label>
              <Select value={form.watch("area")} onValueChange={(v) => form.setValue("area", v, { shouldValidate: true })} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area"/>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {areaOptions.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
                </SelectContent>
              </Select>
              {form.formState.errors.area && (<p className="text-xs text-destructive">
                  {form.formState.errors.area.message}
                </p>)}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label>Budget</Label>
            <Input placeholder="e.g. 50L–60L" disabled={isSubmitting} {...form.register("budget")}/>
          </div>

          {/* Status (only show on edit) */}
          {isEdit && (<div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>)}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Additional notes about this lead…" rows={3} className="resize-none" disabled={isSubmitting} {...form.register("notes")}/>
            {form.formState.errors.notes && (<p className="text-xs text-destructive">
                {form.formState.errors.notes.message}
              </p>)}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {isEdit ? "Save Changes" : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);
}
