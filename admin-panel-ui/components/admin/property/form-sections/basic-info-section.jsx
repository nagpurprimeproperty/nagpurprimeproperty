"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LISTING_CATEGORIES, PROPERTY_TYPES } from "@/lib/api/property.api";
import { Sel, Field } from "./shared-fields";

export function BasicInfoSection({ form, set, errors = {}, disabled }) {
  // Agricultural Land is not applicable for New listings
  const availablePropertyTypes = form.listingCategory === "New"
    ? PROPERTY_TYPES.filter((t) => t !== "Agricultural Land")
    : PROPERTY_TYPES;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Field label="Property Title" required error={errors.title}>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Spacious 3 BHK Flat in Dharampeth" disabled={disabled} maxLength={100} className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""} />
          <p className="text-xs text-muted-foreground mt-1">{form.title.length} / 100 characters</p>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Sel label="Listing Category" required value={form.listingCategory} onChange={(v) => set("listingCategory", v)} options={LISTING_CATEGORIES} placeholder="Select category" disabled={disabled} error={errors.listingCategory} />
          <Sel label="Property Type" required value={form.propertyType} onChange={(v) => set("propertyType", v)} options={availablePropertyTypes} placeholder="Select type" disabled={disabled} error={errors.propertyType} />
        </div>

        <Field label="Description" required error={errors.description}>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property in detail…" rows={4} disabled={disabled} maxLength={2000} className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""} />
          <p className="text-xs text-muted-foreground mt-1">{form.description.length} / 2000 characters</p>
        </Field>
      </CardContent>
    </Card>
  );
}
