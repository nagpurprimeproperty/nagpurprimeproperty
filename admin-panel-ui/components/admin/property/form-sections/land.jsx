"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ROAD_TYPES, IRRIGATION_TYPES, SOIL_TYPES, NA_ORDER_STATUS_OPTIONS, WATER_SOURCE_OPTIONS, APPROVED_BY_OPTIONS, ZONE_TYPES, FACING_OPTIONS } from "@/lib/api/property.api";
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
            onChange={(e) => onChange(e.target.value)} 
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

function MultiCheckbox({ label, options, selected, onChange, disabled }) {
    const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);
    
    // Sanitize ID to handle special characters and spaces
    const sanitizeId = (str) => str.replace(/[^a-zA-Z0-9]/g, '-');
    
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {options.map((opt, index) => {
                    const safeId = sanitizeId(`${label}-${opt}-${index}`);
                    return (
                    <div key={opt} className="flex items-center gap-2">
                        <Checkbox 
                            id={`mchk-${safeId}`} 
                            checked={selected.includes(opt)} 
                            onCheckedChange={() => toggle(opt)} 
                            disabled={disabled}
                        />
                        <Label htmlFor={`mchk-${safeId}`} className="text-sm">
                            {opt}
                        </Label>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

// Land Property Form Sections
export function LandFormSections({ form, set, errors }) {
    return (
        <div className="space-y-6">
            {/* Residential Plot Fields */}
            {form.propertyType === "Residential Plot" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Plot Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field 
                            label="Plot Area (sq ft)" 
                            required 
                            error={errors.plotAreaSqFt}
                        >
                            <NumInput
                                value={form.plotAreaSqFt || ""}
                                onChange={(value) => set("plotAreaSqFt", value)}
                                placeholder="e.g., 2400"
                                min={1}
                                error={!!errors.plotAreaSqFt}
                            />
                        </Field>

                        <Field 
                            label="Plot Length (ft)" 
                            error={errors.plotLength}
                        >
                            <NumInput
                                value={form.plotLength || ""}
                                onChange={(value) => set("plotLength", value)}
                                placeholder="e.g., 60"
                                min={1}
                                error={!!errors.plotLength}
                            />
                        </Field>

                        <Field 
                            label="Plot Width (ft)" 
                            error={errors.plotWidth}
                        >
                            <NumInput
                                value={form.plotWidth || ""}
                                onChange={(value) => set("plotWidth", value)}
                                placeholder="e.g., 40"
                                min={1}
                                error={!!errors.plotWidth}
                            />
                        </Field>

                        <Field 
                            label="Facing" 
                            error={errors.facing}
                        >
                            <Select value={form.facing} onValueChange={(value) => set("facing", value)}>
                                <SelectTrigger className={errors.facing ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select facing" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FACING_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field 
                            label="Zone Type" 
                            error={errors.zoneType}
                        >
                            <Select value={form.zoneType} onValueChange={(value) => set("zoneType", value)}>
                                <SelectTrigger className={errors.zoneType ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select zone type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ZONE_TYPES.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field 
                            label="FSI Available" 
                            error={errors.fsiAvailable}
                        >
                            <NumInput
                                value={form.fsiAvailable || ""}
                                onChange={(value) => set("fsiAvailable", value)}
                                placeholder="e.g., 1.5"
                                min={0}
                                step="0.1"
                                error={!!errors.fsiAvailable}
                            />
                        </Field>

                        <MultiCheckbox
                            label="Approved By"
                            options={APPROVED_BY_OPTIONS}
                            selected={form.approvedBy || []}
                            onChange={(selected) => set("approvedBy", selected)}
                        />

                        <ToggleRow
                            label="Boundary Wall"
                            checked={form.boundaryWall}
                            onChange={(checked) => set("boundaryWall", checked)}
                        />

                        <ToggleRow
                            label="Gated Layout"
                            checked={form.gatedLayout}
                            onChange={(checked) => set("gatedLayout", checked)}
                        />

                        <ToggleRow
                            label="Corner Plot"
                            checked={form.cornerPlot}
                            onChange={(checked) => set("cornerPlot", checked)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Agricultural Land Fields */}
            {form.propertyType === "Agricultural Land" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Agricultural Land Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field 
                            label="Area (Acres)" 
                            required 
                            error={errors.areaAcres}
                        >
                            <NumInput
                                value={form.areaAcres || ""}
                                onChange={(value) => set("areaAcres", value)}
                                placeholder="e.g., 5"
                                min={0.01}
                                step="0.01"
                                error={!!errors.areaAcres}
                            />
                        </Field>

                        <Field 
                            label="Area (Hectares)" 
                            error={errors.areaHectares}
                        >
                            <NumInput
                                value={form.areaHectares || ""}
                                onChange={(value) => set("areaHectares", value)}
                                placeholder="e.g., 2"
                                min={0.01}
                                step="0.01"
                                error={!!errors.areaHectares}
                            />
                        </Field>

                        <Field 
                            label="Distance from City (km)" 
                            error={errors.distanceFromCity}
                        >
                            <NumInput
                                value={form.distanceFromCity || ""}
                                onChange={(value) => set("distanceFromCity", value)}
                                placeholder="e.g., 25"
                                min={0}
                                error={!!errors.distanceFromCity}
                            />
                        </Field>

                        <Field 
                            label="Road Type" 
                            error={errors.roadType}
                        >
                            <Select value={form.roadType} onValueChange={(value) => set("roadType", value)}>
                                <SelectTrigger className={errors.roadType ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select road type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROAD_TYPES.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field 
                            label="Soil Type" 
                            error={errors.soilType}
                        >
                            <Select value={form.soilType} onValueChange={(value) => set("soilType", value)}>
                                <SelectTrigger className={errors.soilType ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select soil type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SOIL_TYPES.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <MultiCheckbox
                            label="Water Source"
                            options={WATER_SOURCE_OPTIONS}
                            selected={form.waterSource || []}
                            onChange={(selected) => set("waterSource", selected)}
                        />

                        <Field 
                            label="Irrigation Type" 
                            error={errors.irrigationType}
                        >
                            <Select value={form.irrigationType} onValueChange={(value) => set("irrigationType", value)}>
                                <SelectTrigger className={errors.irrigationType ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select irrigation type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {IRRIGATION_TYPES.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <ToggleRow
                            label="Road Access"
                            checked={form.roadAccess}
                            onChange={(checked) => set("roadAccess", checked)}
                        />

                        <ToggleRow
                            label="Fencing"
                            checked={form.fencing}
                            onChange={(checked) => set("fencing", checked)}
                        />

                        <ToggleRow
                            label="Electricity Available"
                            checked={form.electricityLand}
                            onChange={(checked) => set("electricityLand", checked)}
                        />

                        <ToggleRow
                            label="7/12 Extract"
                            checked={form.sevenTwelveExtract}
                            onChange={(checked) => set("sevenTwelveExtract", checked)}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
