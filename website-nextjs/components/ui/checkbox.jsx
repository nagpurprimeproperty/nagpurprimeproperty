"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, onChange, id, disabled, ...props }, ref) => {
  const isChecked = !!checked;

  const handleChange = (e) => {
    if (disabled) return;
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (onCheckedChange) {
      onCheckedChange(!isChecked);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        ref={ref}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <div
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer select-none",
          isChecked ? "bg-primary text-primary-foreground" : "bg-background border-input hover:border-primary/60",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
      </div>
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
