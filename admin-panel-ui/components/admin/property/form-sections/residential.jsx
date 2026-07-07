"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FURNISHING_OPTIONS, FACING_OPTIONS, FLOOR_TYPE, WATER_SUPPLY, ELECTRICITY_STATUS, AGE_OF_PROPERTY } from "@/lib/api/property.api";
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
                // Convert empty string to null, otherwise parse as number
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

// Residential Property Form Sections
export function ResidentialFormSections({ form, set, errors }) {
    return (
        <div className="space-y-6">
            {/* Basic Residential Fields */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field 
                        label="BHK" 
                        required 
                        error={errors.bhk}
                    >
                        <NumInput
                            value={form.bhk ?? ""}
                            onChange={(value) => set("bhk", value)}
                            placeholder="e.g., 2"
                            min={1}
                            max={10}
                            error={!!errors.bhk}
                        />
                    </Field>

                    <Field 
                        label="Bathrooms" 
                        required 
                        error={errors.bathrooms}
                    >
                        <NumInput
                            value={form.bathrooms ?? ""}
                            onChange={(value) => set("bathrooms", value)}
                            placeholder="e.g., 2"
                            min={1}
                            max={10}
                            error={!!errors.bathrooms}
                        />
                    </Field>

                    <Field 
                        label="Balconies" 
                        error={errors.balconies}
                    >
                        <NumInput
                            value={form.balconies ?? ""}
                            onChange={(value) => set("balconies", value)}
                            placeholder="e.g., 2"
                            min={0}
                            max={10}
                            error={!!errors.balconies}
                        />
                    </Field>

                    <Field 
                        label="Floor Number" 
                        required 
                        error={errors.floorNumber}
                    >
                        <NumInput
                            value={form.floorNumber ?? ""}
                            onChange={(value) => set("floorNumber", value)}
                            placeholder="e.g., 3"
                            min={0}
                            max={100}
                            error={!!errors.floorNumber}
                        />
                    </Field>

                    <Field 
                        label="Total Floors" 
                        required 
                        error={errors.totalFloors}
                    >
                        <NumInput
                            value={form.totalFloors ?? ""}
                            onChange={(value) => set("totalFloors", value)}
                            placeholder="e.g., 5"
                            min={1}
                            max={100}
                            error={!!errors.totalFloors}
                        />
                    </Field>
                </CardContent>
            </Card>

            {/* Area Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Area Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field 
                        label="Carpet Area (sq ft)" 
                        required 
                        error={errors.carpetArea}
                        hint="Built-up area that can be covered by carpet"
                    >
                        <NumInput
                            value={form.carpetArea ?? ""}
                            onChange={(value) => set("carpetArea", value)}
                            placeholder="e.g., 1200"
                            min={1}
                            error={!!errors.carpetArea}
                        />
                    </Field>

                    <Field 
                        label="Built-up Area (sq ft)" 
                        error={errors.builtUpArea}
                        hint="Total area including walls"
                    >
                        <NumInput
                            value={form.builtUpArea ?? ""}
                            onChange={(value) => set("builtUpArea", value)}
                            placeholder="e.g., 1400"
                            min={1}
                            error={!!errors.builtUpArea}
                        />
                    </Field>

                    <Field 
                        label="Super Built-up Area (sq ft)" 
                        error={errors.superBuiltUpArea}
                        hint="Area including common spaces"
                    >
                        <NumInput
                            value={form.superBuiltUpArea ?? ""}
                            onChange={(value) => set("superBuiltUpArea", value)}
                            placeholder="e.g., 1600"
                            min={1}
                            error={!!errors.superBuiltUpArea}
                        />
                    </Field>
                </CardContent>
            </Card>

            {/* Property Features */}
            <Card>
                <CardHeader>
                    <CardTitle>Property Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field 
                        label="Furnishing" 
                        required 
                        error={errors.furnishing}
                    >
                        <Select value={form.furnishing} onValueChange={(value) => set("furnishing", value)}>
                            <SelectTrigger className={errors.furnishing ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select furnishing" />
                            </SelectTrigger>
                            <SelectContent>
                                {FURNISHING_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        label="Age of Property" 
                        error={errors.ageOfProperty}
                    >
                        <Select value={form.ageOfProperty} onValueChange={(value) => set("ageOfProperty", value)}>
                            <SelectTrigger className={errors.ageOfProperty ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select age" />
                            </SelectTrigger>
                            <SelectContent>
                                {AGE_OF_PROPERTY.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field 
                        label="Floor Type" 
                        error={errors.floorType}
                    >
                        <Select value={form.floorType} onValueChange={(value) => set("floorType", value)}>
                            <SelectTrigger className={errors.floorType ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select floor type" />
                            </SelectTrigger>
                            <SelectContent>
                                {FLOOR_TYPE.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field 
                        label="Water Supply" 
                        error={errors.waterSupply}
                    >
                        <Select value={form.waterSupply} onValueChange={(value) => set("waterSupply", value)}>
                            <SelectTrigger className={errors.waterSupply ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select water supply" />
                            </SelectTrigger>
                            <SelectContent>
                                {WATER_SUPPLY.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field 
                        label="Electricity Status" 
                        error={errors.electricityStatus}
                    >
                        <Select value={form.electricityStatus} onValueChange={(value) => set("electricityStatus", value)}>
                            <SelectTrigger className={errors.electricityStatus ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select electricity status" />
                            </SelectTrigger>
                            <SelectContent>
                                {ELECTRICITY_STATUS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </CardContent>
            </Card>

            {/* Rental Options */}
            {(form.listingCategory === "Rental") && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rental Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ToggleRow
                            label="Pet Friendly"
                            checked={form.petFriendly}
                            onChange={(checked) => set("petFriendly", checked)}
                        />

                        <ToggleRow
                            label="Non-Vegetarian Allowed"
                            checked={form.nonVegAllowed}
                            onChange={(checked) => set("nonVegAllowed", checked)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Resale Options */}
            {(form.listingCategory === "Resale") && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resale Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ToggleRow
                            label="Ready to Move"
                            checked={form.readyToMove}
                            onChange={(checked) => set("readyToMove", checked)}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
