"use client"

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PlanFormDialog
 * Handles both Create and Edit modes.
 * Accepts `plan` prop — when provided, pre-fills form (edit mode).
 * Key insight: useEffect syncs plan → form whenever `plan` or `open` changes,
 * fixing the "edit doesn't pre-fill" bug.
 */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { planFormSchema, DEFAULT_FORM_VALUES } from "./plan-form.types";
import { PlanFormFields } from "./plan-form-fields";
import { useCreatePlan, useUpdatePlan } from "@/hooks/use-plan-queries";
/** Maps a PlanRecord → PlanFormValues for pre-filling the edit form */
function planToFormValues(plan) {
    return {
        name: plan.name,
        isFree: plan.isFree,
        price: plan.price,
        duration: plan.duration,
        durationUnit: plan.durationUnit,
        isDurationUnlimited: plan.isDurationUnlimited,
        description: plan.description ?? "",
        featuresRaw: plan.features?.join(", ") ?? "",
        isActive: plan.isActive,
        limits: {
            propertyUploads: plan.limits?.propertyUploads ?? 5,
            isPropertyUploadUnlimited: plan.limits?.isPropertyUploadUnlimited ?? false,
            featuredProperties: plan.limits?.featuredProperties ?? 0,
            isFeaturedPropertiesUnlimited: plan.limits?.isFeaturedPropertiesUnlimited ?? false,
            leadAccessCount: plan.limits?.leadAccessCount ?? 10,
            isLeadAccessUnlimited: plan.limits?.isLeadAccessUnlimited ?? false,
            prioritySupport: plan.limits?.prioritySupport ?? false,
            analyticsAccess: plan.limits?.analyticsAccess ?? false,
        },
    };
}
/** Converts form values → API payload */
function formValuesToPayload(data) {
    const features = data.featuresRaw
        ? data.featuresRaw.split(",").map(f => f.trim()).filter(Boolean)
        : [];
    return {
        name: data.name,
        isFree: data.isFree,
        price: data.isFree ? 0 : data.price,
        duration: data.duration,
        isDurationUnlimited: data.isDurationUnlimited,
        durationUnit: data.durationUnit,
        description: data.description,
        features,
        isActive: data.isActive,
        limits: data.limits,
    };
}
export function PlanFormDialog({ open, onOpenChange, plan }) {
    const isEdit = !!plan;
    const createMutation = useCreatePlan();
    const updateMutation = useUpdatePlan(plan?._id ?? "");
    const form = useForm({
        resolver: zodResolver(planFormSchema),
        defaultValues: DEFAULT_FORM_VALUES,
    });
    // ── KEY FIX: sync plan → form whenever dialog opens or plan changes ────────
    useEffect(() => {
        if (open) {
            if (plan) {
                form.reset(planToFormValues(plan));
            }
            else {
                form.reset(DEFAULT_FORM_VALUES);
            }
        }
    }, [open, plan]); // eslint-disable-line react-hooks/exhaustive-deps
    const close = () => {
        onOpenChange(false);
        // Don't reset here — useEffect handles it on next open
    };
    const onSubmit = (data) => {
        const payload = formValuesToPayload(data);
        if (isEdit) {
            updateMutation.mutate(payload, { onSuccess: close });
        }
        else {
            createMutation.mutate(payload, { onSuccess: close });
        }
    };
    const isPending = createMutation.isPending || updateMutation.isPending;
    return (_jsx(Dialog, {
        open: open, onOpenChange: (v) => {
            if (!v)
                close();
        }, children: _jsxs(DialogContent, {
            className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, {
                children: [_jsx(DialogTitle, { children: isEdit ? `Edit: ${plan.name}` : "Create New Plan" }), _jsx(DialogDescription, {
                    children: isEdit
                        ? "Update the subscription plan details below."
                        : "Configure a new subscription plan for brokers."
                })]
            }), _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "py-2", children: [_jsx(PlanFormFields, { register: form.register, control: form.control, watch: form.watch, errors: form.formState.errors, disabled: isPending }), _jsxs("div", { className: "flex justify-end gap-2 pt-6 border-t mt-6", children: [_jsx(Button, { type: "button", variant: "outline", onClick: close, disabled: isPending, children: "Cancel" }), _jsxs(Button, { type: "submit", disabled: isPending, className: "min-w-32", children: [isPending && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), isEdit ? "Save Changes" : "Create Plan"] })] })] })]
        })
    }));
}
