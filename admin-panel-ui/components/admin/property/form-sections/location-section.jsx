"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationMapPicker } from "@/components/admin/property/location-map-picker";
import { Field, NumInput } from "./shared-fields";

export function LocationSection({ form, set, errors = {}, disabled }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <LocationMapPicker lat={form.lat} lng={form.lng} disabled={disabled} onFill={(fields) => {
          set("lat", fields.lat);
          set("lng", fields.lng);
          if (fields.locality) set("locality", fields.locality);
          if (fields.subLocality) set("subLocality", fields.subLocality);
          if (fields.landmark) set("landmark", fields.landmark);
          if (fields.pinCode) set("pinCode", fields.pinCode);
        }} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Locality" hint="Max 100 characters">
            <Input value={form.locality} onChange={(e) => set("locality", e.target.value)} placeholder="e.g. Dharampeth" maxLength={100} disabled={disabled} />
          </Field>

          <Field label="Sub-locality" hint="Max 100 characters">
            <Input value={form.subLocality} onChange={(e) => set("subLocality", e.target.value)} placeholder="Optional sub-area" maxLength={100} disabled={disabled} />
          </Field>

          <Field label="Landmark" hint="Max 100 characters">
            <Input value={form.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder="e.g. Near Big Bazaar" maxLength={100} disabled={disabled} />
          </Field>

          <Field label="Pin Code" hint="6-digit Nagpur pin code" error={errors.pinCode}>
            <Input value={form.pinCode} onChange={(e) => set("pinCode", e.target.value)} placeholder="440001" maxLength={6} disabled={disabled} className={errors.pinCode ? "border-destructive focus-visible:ring-destructive" : ""} />
          </Field>

          <Field label="Latitude" required error={errors.lat}>
            <NumInput value={form.lat} onChange={(v) => set("lat", v)} placeholder="21.1458" disabled={disabled} step="any" error={!!errors.lat} />
          </Field>

          <Field label="Longitude" required error={errors.lng}>
            <NumInput value={form.lng} onChange={(v) => set("lng", v)} placeholder="79.0882" disabled={disabled} step="any" error={!!errors.lng} />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
