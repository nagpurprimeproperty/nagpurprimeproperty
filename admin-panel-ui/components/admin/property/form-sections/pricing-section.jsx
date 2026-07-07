"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSSESSION_TIMELINE_OPTIONS, PREFERRED_TENANTS_OPTIONS, LEASE_DURATION_OPTIONS, LOCK_IN_PERIOD_OPTIONS, showsPreferredTenants } from "@/lib/api/property.api";
import { Field, MultiCheckbox, NumInput, Sel, ToggleRow } from "@/components/admin/property/form-sections/shared-fields";

export function PricingSection({ form, set, errors = {}, disabled }) {
  const lc = form.listingCategory;
  const isAgri = form.propertyType === "Agricultural Land";
  const showPreferredTenants = showsPreferredTenants(form.propertyType);
  if (!lc) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a listing category above to see pricing fields.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {lc === "Resale" && (
            <>
              <Field label="Total Price (₹)" required error={errors.totalPrice}><NumInput value={form.totalPrice} onChange={(v) => set("totalPrice", v)} placeholder="7500000" min={1} disabled={disabled} error={!!errors.totalPrice} /></Field>
              <Field label="Price per Sqft (₹)" error={errors.pricePerSqft}><NumInput value={form.pricePerSqft} onChange={(v) => set("pricePerSqft", v)} placeholder="4500" min={1} disabled={disabled} /></Field>
              <Sel label="Possession Timeline" required value={form.possessionTimeline} onChange={(v) => set("possessionTimeline", v)} options={POSSESSION_TIMELINE_OPTIONS} disabled={disabled} hint="When can the buyer take possession?" error={errors.possessionTimeline} />
              <Field label="Brokerage" hint="Max 50 characters"><Input value={form.brokerage} onChange={(e) => set("brokerage", e.target.value)} placeholder="1% or ₹50,000" maxLength={50} disabled={disabled} /></Field>
              <ToggleRow label="Price Negotiable" checked={form.priceNegotiable} onChange={(v) => set("priceNegotiable", v)} disabled={disabled} />
            </>
          )}

          {lc === "New" && (
            <>
              <Field label="Starting Price (₹)" required error={errors.startingPrice}><NumInput value={form.startingPrice} onChange={(v) => set("startingPrice", v)} placeholder="5000000" min={1} disabled={disabled} error={!!errors.startingPrice} /></Field>
              <Field label="Price per Sqft (₹)" error={errors.pricePerSqft}><NumInput value={form.pricePerSqft} onChange={(v) => set("pricePerSqft", v)} placeholder="4500" min={1} disabled={disabled} /></Field>
              <Field label="Price Range" hint="Max 50 characters"><Input value={form.priceRange} onChange={(e) => set("priceRange", e.target.value)} placeholder="₹50L - ₹1Cr" maxLength={50} disabled={disabled} /></Field>
              <Field label="Booking Amount (₹)"><NumInput value={form.bookingAmount} onChange={(v) => set("bookingAmount", v)} placeholder="100000" min={0} disabled={disabled} /></Field>
              <Field label="Possession Date" required error={errors.possessionDate}><Input type="date" value={form.possessionDate} onChange={(e) => set("possessionDate", e.target.value)} disabled={disabled} className={errors.possessionDate ? "border-destructive focus-visible:ring-destructive" : ""} /></Field>
              <Field label="Brokerage" hint="Max 50 characters"><Input value={form.brokerage} onChange={(e) => set("brokerage", e.target.value)} placeholder="1%" maxLength={50} disabled={disabled} /></Field>
              <ToggleRow label="GST Applicable" checked={form.gstApplicable} onChange={(v) => set("gstApplicable", v)} disabled={disabled} />
              <ToggleRow label="Price Negotiable" checked={form.priceNegotiable} onChange={(v) => set("priceNegotiable", v)} disabled={disabled} />
            </>
          )}

          {lc === "Rental" && (
            <>
              {isAgri ? (
                <Field label="Annual Lease (₹)" required error={errors.annualLease}>
                  <NumInput value={form.annualLease} onChange={(v) => set("annualLease", v)} placeholder="120000" min={1} disabled={disabled} error={!!errors.annualLease} />
                </Field>
              ) : (
                <>
                  <Field label="Monthly Rent (₹)" required error={errors.monthlyRent}><NumInput value={form.monthlyRent} onChange={(v) => set("monthlyRent", v)} placeholder="15000" min={1} disabled={disabled} error={!!errors.monthlyRent} /></Field>
                  <Field label="Annual Lease (₹)"><NumInput value={form.annualLease} onChange={(v) => set("annualLease", v)} placeholder="180000" min={0} disabled={disabled} /></Field>
                </>
              )}
              <Field label="Security Deposit (₹)" required error={errors.securityDeposit}><NumInput value={form.securityDeposit} onChange={(v) => set("securityDeposit", v)} placeholder="45000" min={0} disabled={disabled} error={!!errors.securityDeposit} /></Field>
              <Field label="Maintenance (₹/mo)"><NumInput value={form.maintenance} onChange={(v) => set("maintenance", v)} placeholder="2000" min={0} disabled={disabled} /></Field>
              <Field label="Available From" required error={errors.availableFrom}><Input type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} disabled={disabled} className={errors.availableFrom ? "border-destructive focus-visible:ring-destructive" : ""} /></Field>
              <Sel label="Lease Duration" value={form.leaseDuration} onChange={(v) => set("leaseDuration", v)} options={LEASE_DURATION_OPTIONS} disabled={disabled} />
              <Sel label="Lock-in Period" value={form.lockInPeriod} onChange={(v) => set("lockInPeriod", v)} options={LOCK_IN_PERIOD_OPTIONS} disabled={disabled} />
              <Field label="Brokerage" hint="Max 50 characters"><Input value={form.brokerage} onChange={(e) => set("brokerage", e.target.value)} placeholder="1 month rent" maxLength={50} disabled={disabled} /></Field>
              {showPreferredTenants && (
                <div className="sm:col-span-2">
                  <MultiCheckbox label="Preferred Tenants" options={PREFERRED_TENANTS_OPTIONS} selected={form.preferredTenants} onChange={(v) => set("preferredTenants", v)} disabled={disabled} />
                </div>
              )}
              <ToggleRow label="Rent Negotiable" checked={form.rentNegotiable} onChange={(v) => set("rentNegotiable", v)} disabled={disabled} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

