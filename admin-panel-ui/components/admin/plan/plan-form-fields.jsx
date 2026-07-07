"use client"

/**
 * PlanFormFields — pure presentational form fields.
 * Receives react-hook-form's control/register/watch, renders nothing else.
 */
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
function SwitchRow({ label, name, control, disabled }) {
    return (<div className="flex items-center justify-between">
      <Label className="cursor-pointer text-sm">{label}</Label>
      <Controller control={control} name={name} render={({ field }) => (<Switch checked={!!field.value} onCheckedChange={field.onChange} disabled={disabled}/>)}/>
    </div>);
}
export function PlanFormFields({ register, control, watch, errors, disabled }) {
    const isFree = watch("isFree");
    const isDurationUnlimited = watch("isDurationUnlimited");
    const isPropUnlimited = watch("limits.isPropertyUploadUnlimited");
    const isFeaturedUnlimited = watch("limits.isFeaturedPropertiesUnlimited");
    const isLeadUnlimited = watch("limits.isLeadAccessUnlimited");
    return (<div className="space-y-6">
      {/* ── Basic Info ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</p>

        <div className="space-y-1.5">
          <Label htmlFor="pf-name">
            Plan Name <span className="text-destructive">*</span>
          </Label>
          <Input id="pf-name" placeholder="e.g. Basic, Premium, Enterprise…" disabled={disabled} {...register("name")}/>
          {errors.name && (<p className="text-xs text-destructive">{errors.name.message}</p>)}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pf-description">Description</Label>
          <Textarea id="pf-description" rows={2} placeholder="Brief plan description…" disabled={disabled} {...register("description")}/>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pf-features">
            Features{" "}
            <span className="text-xs text-muted-foreground font-normal">(comma-separated)</span>
          </Label>
          <Input id="pf-features" placeholder="Unlimited listings, Priority support, Analytics…" disabled={disabled} {...register("featuresRaw")}/>
        </div>
      </section>

      <Separator />

      {/* ── Pricing & Duration ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing & Duration</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pf-price">
              Price (₹){" "}
              {isFree && <span className="text-xs text-muted-foreground">(auto 0 for free plans)</span>}
            </Label>
            <Input id="pf-price" type="number" min={0} disabled={isFree || disabled} className={isFree ? "opacity-50" : ""} {...register("price", { valueAsNumber: true })}/>
            {errors.price && (<p className="text-xs text-destructive">{errors.price.message}</p>)}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-duration">Duration Value</Label>
            <Input id="pf-duration" type="number" min={1} disabled={isDurationUnlimited || disabled} className={isDurationUnlimited ? "opacity-50" : ""} {...register("duration", { valueAsNumber: true })}/>
          </div>

          <div className="space-y-1.5">
            <Label>Duration Unit</Label>
            <Controller control={control} name="durationUnit" render={({ field }) => (<Select value={field.value} onValueChange={field.onChange} disabled={isDurationUnlimited || disabled}>
                  <SelectTrigger className={isDurationUnlimited ? "opacity-50" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>)}/>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Plan Options ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan Options</p>

        <div className="rounded-lg border divide-y">
          {[
            { name: "isFree", label: "Free Plan" },
            { name: "isDurationUnlimited", label: "Unlimited Duration" },
            { name: "isActive", label: "Active / Published" },
        ].map(({ name, label }) => (<div key={name} className="flex items-center justify-between px-4 py-3">
              <Label className="cursor-pointer">{label}</Label>
              <Controller control={control} name={name} render={({ field }) => (<Switch checked={!!field.value} onCheckedChange={field.onChange} disabled={disabled}/>)}/>
            </div>))}
        </div>
      </section>

      <Separator />

      {/* ── Usage Limits ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usage Limits</p>

        {/* Property Uploads */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Property Uploads</p>
          <div className="flex items-center justify-between">
            <Label>Unlimited Uploads</Label>
            <SwitchRow label="" name="limits.isPropertyUploadUnlimited" control={control} disabled={disabled}/>
          </div>
          {!isPropUnlimited && (<div className="space-y-1.5">
              <Label htmlFor="pf-prop-uploads">Max Uploads</Label>
              <Input id="pf-prop-uploads" type="number" min={0} disabled={disabled} {...register("limits.propertyUploads", { valueAsNumber: true })}/>
            </div>)}
        </div>

        {/* Featured Properties */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Featured Properties</p>
          <div className="flex items-center justify-between">
            <Label>Unlimited Featured</Label>
            <SwitchRow label="" name="limits.isFeaturedPropertiesUnlimited" control={control} disabled={disabled}/>
          </div>
          {!isFeaturedUnlimited && (<div className="space-y-1.5">
              <Label htmlFor="pf-featured">Max Featured</Label>
              <Input id="pf-featured" type="number" min={0} disabled={disabled} {...register("limits.featuredProperties", { valueAsNumber: true })}/>
            </div>)}
        </div>

        {/* Lead Access */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Lead Access</p>
          <div className="flex items-center justify-between">
            <Label>Unlimited Leads</Label>
            <SwitchRow label="" name="limits.isLeadAccessUnlimited" control={control} disabled={disabled}/>
          </div>
          {!isLeadUnlimited && (<div className="space-y-1.5">
              <Label htmlFor="pf-leads">Lead Access Count</Label>
              <Input id="pf-leads" type="number" min={0} disabled={disabled} {...register("limits.leadAccessCount", { valueAsNumber: true })}/>
            </div>)}
        </div>

        {/* Boolean features */}
        <div className="rounded-lg border divide-y">
          {[
            { name: "limits.prioritySupport", label: "Priority Support" },
            { name: "limits.analyticsAccess", label: "Analytics Access" },
        ].map(({ name, label }) => (<div key={name} className="flex items-center justify-between px-4 py-3">
              <Label>{label}</Label>
              <Controller control={control} name={name} render={({ field }) => (<Switch checked={!!field.value} onCheckedChange={field.onChange} disabled={disabled}/>)}/>
            </div>))}
        </div>
      </section>
    </div>);
}
