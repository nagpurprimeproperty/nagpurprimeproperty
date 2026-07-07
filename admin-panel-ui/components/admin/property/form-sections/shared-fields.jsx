"use client";

import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

export function Field({ label, required, children, hint, error, className }) {
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

export function NumInput({ value, onChange, placeholder, min, max, disabled, step, error }) {
  return (
    <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} disabled={disabled} step={step} className={error ? "border-destructive focus-visible:ring-destructive" : ""} />
  );
}

export function ToggleRow({ label, hint, checked, onChange, disabled }) {
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

export function MultiCheckbox({ label, options, selected, onChange, disabled }) {
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {options.map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <Checkbox id={`mchk-${label}-${opt}`} checked={selected.includes(opt)} onCheckedChange={() => toggle(opt)} disabled={disabled} />
            <label htmlFor={`mchk-${label}-${opt}`} className="text-sm cursor-pointer">{opt}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sel({ label, required, value, onChange, options, placeholder, disabled, hint, error }) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? "border-destructive focus:ring-destructive" : ""}>
          <SelectValue placeholder={placeholder ?? "Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}
