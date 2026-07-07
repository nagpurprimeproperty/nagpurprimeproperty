"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SHOP_FLOOR_OPTIONS, FOOTFALL_RATING_OPTIONS, SUITABLE_FOR_OPTIONS } from "@/lib/api/property.api";
import { AlertCircle } from "lucide-react";

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-destructive mt-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {message}
        </p>
    );
}

function Field({ label, required, children, hint, error, className }) {
    return (
        <div className={`space-y-1.5 ${className ?? ""}`}>
            <Label className={`text-sm font-medium ${error ? "text-destructive" : ""}`}>
                {label}{required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

function NumInput({ value, onChange, placeholder, min, max, disabled, step, error }) {
    return (
        <Input 
            type="number" 
            value={value} 
            onChange={(e) => {
                const value = e.target.value;
                const parsed = value.trim() === '' ? null : Number(value);
                onChange(isNaN(parsed) ? null : parsed);
            }} 
            placeholder={placeholder} 
            min={min} 
            max={max} 
            disabled={disabled} 
            step={step} 
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
        />
    );
}

function ToggleRow({ label, hint, checked, onChange, disabled }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
            <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
        </div>
    );
}

// Commercial Property Form Sections
export function CommercialFormSections({ form, set, errors }) {
    return (
        <div className="space-y-6">
            {/* Office Space Fields */}
            {form.propertyType === "Office Space" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Office Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field 
                            label="Cabin Count" 
                            error={errors.cabinCount}
                        >
                            <NumInput
                                value={form.cabinCount || ""}
                                onChange={(value) => set("cabinCount", value)}
                                placeholder="e.g., 5"
                                min={1}
                                error={!!errors.cabinCount}
                            />
                        </Field>

                        <Field 
                            label="Open Desks" 
                            error={errors.openDesks}
                        >
                            <NumInput
                                value={form.openDesks || ""}
                                onChange={(value) => set("openDesks", value)}
                                placeholder="e.g., 20"
                                min={0}
                                error={!!errors.openDesks}
                            />
                        </Field>

                        <Field 
                            label="Washrooms" 
                            required 
                            error={errors.washrooms}
                        >
                            <NumInput
                                value={form.washrooms || ""}
                                onChange={(value) => set("washrooms", value)}
                                placeholder="e.g., 2"
                                min={1}
                                error={!!errors.washrooms}
                            />
                        </Field>

                        <ToggleRow
                            label="Has Pantry"
                            checked={form.hasPantry}
                            onChange={(checked) => set("hasPantry", checked)}
                        />

                        <ToggleRow
                            label="IT Ready"
                            checked={form.itReady}
                            onChange={(checked) => set("itReady", checked)}
                        />

                        <ToggleRow
                            label="Conference Room"
                            checked={form.conferenceRoom}
                            onChange={(checked) => set("conferenceRoom", checked)}
                        />

                        <ToggleRow
                            label="Reception Area"
                            checked={form.receptionArea}
                            onChange={(checked) => set("receptionArea", checked)}
                        />

                        <ToggleRow
                            label="Central AC"
                            checked={form.centralAC}
                            onChange={(checked) => set("centralAC", checked)}
                        />

                        <ToggleRow
                            label="Fire Safety"
                            checked={form.officeFireSafety}
                            onChange={(checked) => set("officeFireSafety", checked)}
                        />

                        <ToggleRow
                            label="DG Backup"
                            checked={form.dgBackup}
                            onChange={(checked) => set("dgBackup", checked)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Shop Fields */}
            {form.propertyType === "Shop" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Shop Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field 
                            label="Shop Floor" 
                            required 
                            error={errors.shopFloor}
                        >
                            <Select value={form.shopFloor} onValueChange={(value) => set("shopFloor", value)}>
                                <SelectTrigger className={errors.shopFloor ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select shop floor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SHOP_FLOOR_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field 
                            label="Frontage (ft)" 
                            error={errors.frontage}
                        >
                            <NumInput
                                value={form.frontage || ""}
                                onChange={(value) => set("frontage", value)}
                                placeholder="e.g., 20"
                                min={1}
                                error={!!errors.frontage}
                            />
                        </Field>

                        <Field 
                            label="Depth (ft)" 
                            error={errors.depth}
                        >
                            <NumInput
                                value={form.depth || ""}
                                onChange={(value) => set("depth", value)}
                                placeholder="e.g., 30"
                                min={1}
                                error={!!errors.depth}
                            />
                        </Field>

                        <Field 
                            label="Ceiling Height (ft)" 
                            error={errors.ceilingHeight}
                        >
                            <NumInput
                                value={form.ceilingHeight || ""}
                                onChange={(value) => set("ceilingHeight", value)}
                                placeholder="e.g., 10"
                                min={1}
                                error={!!errors.ceilingHeight}
                            />
                        </Field>

                        <ToggleRow
                            label="Main Road Facing"
                            checked={form.mainRoadFacing}
                            onChange={(checked) => set("mainRoadFacing", checked)}
                        />

                        <ToggleRow
                            label="Corner Shop"
                            checked={form.cornerShop}
                            onChange={(checked) => set("cornerShop", checked)}
                        />

                        <ToggleRow
                            label="Mezzanine Floor"
                            checked={form.mezzanineFloor}
                            onChange={(checked) => set("mezzanineFloor", checked)}
                        />

                        <ToggleRow
                            label="Has Washroom"
                            checked={form.hasWashroom}
                            onChange={(checked) => set("hasWashroom", checked)}
                        />

                        <Field 
                            label="Footfall Rating" 
                            error={errors.footfallRating}
                        >
                            <Select value={form.footfallRating} onValueChange={(value) => set("footfallRating", value)}>
                                <SelectTrigger className={errors.footfallRating ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select footfall rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FOOTFALL_RATING_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field 
                            label="Suitable For" 
                            error={errors.suitableFor}
                        >
                            <Select value={form.suitableFor} onValueChange={(value) => set("suitableFor", value)}>
                                <SelectTrigger className={errors.suitableFor ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select suitable for" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUITABLE_FOR_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </CardContent>
                </Card>
            )}

            {/* Showroom Fields */}
            {form.propertyType === "Showroom" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Showroom Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field 
                            label="Showroom Area (sq ft)" 
                            required 
                            error={errors.showroomArea}
                        >
                            <NumInput
                                value={form.showroomArea || ""}
                                onChange={(value) => set("showroomArea", value)}
                                placeholder="e.g., 2000"
                                min={1}
                                error={!!errors.showroomArea}
                            />
                        </Field>

                        <Field 
                            label="Number of Floors" 
                            error={errors.numberOfShowroomFloors}
                        >
                            <NumInput
                                value={form.numberOfShowroomFloors || ""}
                                onChange={(value) => set("numberOfShowroomFloors", value)}
                                placeholder="e.g., 2"
                                min={1}
                                error={!!errors.numberOfShowroomFloors}
                            />
                        </Field>

                        <ToggleRow
                            label="Glass Front"
                            checked={form.glassFront}
                            onChange={(checked) => set("glassFront", checked)}
                        />

                        <ToggleRow
                            label="Parking Available"
                            checked={form.parkingAvailable}
                            onChange={(checked) => set("parkingAvailable", checked)}
                        />

                        <ToggleRow
                            label="AC Installed"
                            checked={form.acInstalled}
                            onChange={(checked) => set("acInstalled", checked)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Warehouse Fields */}
            {form.propertyType === "Warehouse/Godown" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Warehouse Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field 
                            label="Warehouse Area (sq ft)" 
                            required 
                            error={errors.warehouseArea}
                        >
                            <NumInput
                                value={form.warehouseArea || ""}
                                onChange={(value) => set("warehouseArea", value)}
                                placeholder="e.g., 5000"
                                min={1}
                                error={!!errors.warehouseArea}
                            />
                        </Field>

                        <Field 
                            label="Warehouse Height (ft)" 
                            required 
                            error={errors.warehouseHeight}
                        >
                            <NumInput
                                value={form.warehouseHeight || ""}
                                onChange={(value) => set("warehouseHeight", value)}
                                placeholder="e.g., 15"
                                min={1}
                                error={!!errors.warehouseHeight}
                            />
                        </Field>

                        <ToggleRow
                            label="Truck Access"
                            checked={form.truckAccess}
                            onChange={(checked) => set("truckAccess", checked)}
                        />

                        <Field 
                            label="Number of Docks" 
                            error={errors.numberOfDocks}
                        >
                            <NumInput
                                value={form.numberOfDocks || ""}
                                onChange={(value) => set("numberOfDocks", value)}
                                placeholder="e.g., 3"
                                min={0}
                                error={!!errors.numberOfDocks}
                            />
                        </Field>

                        <Field 
                            label="Floor Load Capacity (kg/sq ft)" 
                            error={errors.floorLoadCapacity}
                        >
                            <NumInput
                                value={form.floorLoadCapacity || ""}
                                onChange={(value) => set("floorLoadCapacity", value)}
                                placeholder="e.g., 500"
                                min={0}
                                error={!!errors.floorLoadCapacity}
                            />
                        </Field>

                        <Field 
                            label="Open Yard Area (sq ft)" 
                            error={errors.openYardArea}
                        >
                            <NumInput
                                value={form.openYardArea || ""}
                                onChange={(value) => set("openYardArea", value)}
                                placeholder="e.g., 1000"
                                min={0}
                                error={!!errors.openYardArea}
                            />
                        </Field>

                        <Field 
                            label="Power Load (kW)" 
                            error={errors.powerLoad}
                        >
                            <NumInput
                                value={form.powerLoad || ""}
                                onChange={(value) => set("powerLoad", value)}
                                placeholder="e.g., 100"
                                min={0}
                                error={!!errors.powerLoad}
                            />
                        </Field>

                        <ToggleRow
                            label="Water Supply"
                            checked={form.waterSupplyWarehouse}
                            onChange={(checked) => set("waterSupplyWarehouse", checked)}
                        />

                        <ToggleRow
                            label="Office Space Inside"
                            checked={form.officeSpaceInside}
                            onChange={(checked) => set("officeSpaceInside", checked)}
                        />

                        <ToggleRow
                            label="MIDC Approved"
                            checked={form.midc}
                            onChange={(checked) => set("midc", checked)}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
