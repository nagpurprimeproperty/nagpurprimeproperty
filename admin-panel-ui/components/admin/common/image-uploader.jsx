"use client"

import { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * ImageUploader — drag-drop / click-to-upload component.
 *
 * Props:
 *   value     — current image URL (string)
 *   onChange  — called with the new URL after upload
 *   label     — field label displayed above the dropzone
 *   circular  — set true for a circular crop preview (author avatars)
 *   className — extra wrapper classes
 */
export function ImageUploader({ value, onChange, label, circular = false, className, disabled = false }) {
  const token = useAuthStore((s) => s.token);
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file", description: "Please upload a JPEG, PNG, WebP or GIF image.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum image size is 10 MB.", variant: "destructive" });
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/v1/admin/media/single", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.message || "Upload failed");
        error.errors = data.errors;
        throw error;
      }
      onChange(data.data.url);
      toast({ title: "Image uploaded!" });
    } catch (err) {
      toast({ title: "Upload failed", description: err, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <p className="text-sm font-medium leading-none">{label}</p>}

      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); !disabled && setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          disabled ? "cursor-not-allowed opacity-60 bg-muted/20" : "cursor-pointer",
          dragging && !disabled ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40",
          circular ? "mx-auto w-28 h-28 rounded-full" : "w-full"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFile}
          disabled={disabled}
        />

        {/* Uploading spinner overlay */}
        {uploading && (
          <div className={cn(
            "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm",
            circular ? "rounded-full" : "rounded-xl"
          )}>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Uploading…</span>
          </div>
        )}

        {/* Preview when image exists */}
        {value && !uploading ? (
          <>
            <img
              src={value}
              alt="Preview"
              className={cn(
                "h-full w-full object-cover",
                circular ? "rounded-full h-28" : "max-h-44"
              )}
            />
            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                onClick={clear}
                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : !uploading ? (
          /* Empty state */
          <div className={cn(
            "flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground",
            circular && "py-6"
          )}>
            <UploadCloud className={cn("opacity-40", circular ? "h-7 w-7" : "h-9 w-9")} />
            {!circular && (
              <>
                <p className="text-sm font-medium">Click or drag image here</p>
                <p className="text-xs opacity-70">JPEG, PNG, WebP, GIF · max 10 MB</p>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Fallback URL input for already-hosted images */}
      {!circular && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">or paste URL</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}
      {!circular && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={disabled}
        />
      )}
    </div>
  );
}
