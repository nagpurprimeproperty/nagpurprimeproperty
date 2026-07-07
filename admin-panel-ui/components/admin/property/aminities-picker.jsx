"use client"

import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Predefined suggestions shown as quick-add chips — not an enforced enum */
const AMENITY_SUGGESTIONS = [
    "Parking (2-wheeler)",
    "Parking (4-wheeler)",
    "Lift/Elevator",
    "24x7 Security",
    "CCTV Surveillance",
    "Gym/Fitness Centre",
    "Swimming Pool",
    "Garden/Park",
    "Children's Play Area",
    "Clubhouse",
    "Power Backup",
    "Rainwater Harvesting",
    "Fire Safety",
    "Intercom",
    "Visitor Parking",
    "Water Storage",
    "Piped Gas",
    "Sewage Treatment",
    "Gas Connection",
    "Water Connection",
    "Electricity Connection",
    "Water Supply",
];

/**
 * AmenitiesPicker — free-form amenities editor.
 *
 * Props:
 *   selected          string[]  — current amenities array (controlled)
 *   onAmenitiesChange fn        — called with the new string[] on every change
 *   disabled          boolean
 */
export function AmenitiesPicker({
    selected = [],
    onAmenitiesChange,
    // Legacy props — kept for backward-compat but ignored in rendering
    otherAmenities,
    onToggle,
    onOtherAmenitiesChange,
    disabled = false,
}) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);

    const addAmenity = (value) => {
        const trimmed = value.trim();
        if (!trimmed || selected.includes(trimmed)) return;
        onAmenitiesChange?.([...selected, trimmed]);
        setInputValue("");
    };

    const removeAmenity = (amenity) => {
        onAmenitiesChange?.(selected.filter((a) => a !== amenity));
    };

    const toggleSuggestion = (amenity) => {
        if (selected.includes(amenity)) {
            removeAmenity(amenity);
        } else {
            onAmenitiesChange?.([...selected, amenity]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addAmenity(inputValue);
        } else if (e.key === "Backspace" && !inputValue && selected.length > 0) {
            removeAmenity(selected[selected.length - 1]);
        }
    };

    return (
        <div className="space-y-5">
            {/* ── Suggestions ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Amenities</Label>
                    {selected.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {selected.length} selected
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                    Click a suggestion to add/remove it, or type a custom amenity below.
                </p>
                <div className="flex flex-wrap gap-2">
                    {AMENITY_SUGGESTIONS.map((amenity) => {
                        const active = selected.includes(amenity);
                        return (
                            <button
                                key={amenity}
                                type="button"
                                disabled={disabled}
                                onClick={() => toggleSuggestion(amenity)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                    active
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {amenity}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Custom tag input ── */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <Label className="text-sm font-medium">Add custom amenity</Label>

                {/* Selected tags */}
                {selected.filter((a) => !AMENITY_SUGGESTIONS.includes(a)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selected
                            .filter((a) => !AMENITY_SUGGESTIONS.includes(a))
                            .map((amenity) => (
                                <span
                                    key={amenity}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed bg-muted/40 text-foreground"
                                >
                                    {amenity}
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => removeAmenity(amenity)}
                                            className="ml-0.5 hover:text-destructive transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </span>
                            ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Solar panels, EV charging… (Enter to add)"
                        maxLength={100}
                        disabled={disabled}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 gap-1 shrink-0"
                        disabled={disabled || !inputValue.trim()}
                        onClick={() => addAmenity(inputValue)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Press Enter or click Add to insert a custom amenity.
                </p>
            </div>
        </div>
    );
}
