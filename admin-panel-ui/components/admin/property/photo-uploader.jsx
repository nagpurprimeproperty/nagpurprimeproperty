"use client"

/**
 * PhotoUploader — media uploader with instant S3 upload/delete.
 *
 * NEW FLOW:
 *  - When a user adds a photo/video  → upload to S3 immediately via POST /api/v1/admin/media
 *  - When a user removes a photo/video → delete from S3 immediately via DELETE /api/v1/admin/media
 *  - The parent form gets clean string URL arrays — no file blobs at submit time
 *
 * Props:
 *   value          - Current list of photo URLs (controlled)
 *   videoUrl       - Current video URL or null (controlled)
 *   onChange       - Called with new photo URL array whenever photos change
 *   onVideoChange  - Called with new video URL (or null) whenever video changes
 *   disabled       - Disable all interactions
 *   maxPhotos      - Max photos (default 15)
 */
import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ImageIcon, Video, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadMedia, deleteMedia } from "@/lib/api/media.api";
import { useToast } from "@/hooks/use-toast";
// ─── Component ────────────────────────────────────────────────────────────────
export function PhotoUploader({ value = [], videoUrl = null, onChange, onVideoChange, disabled = false, maxPhotos = 15, }) {
    const { toast } = useToast();
    const photoInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [uploadingPhotos, setUploadingPhotos] = useState([]);
    const [deletingUrls, setDeletingUrls] = useState(new Set());
    const [uploadingVideo, setUploadingVideo] = useState(false);
    // ── Photo add ─────────────────────────────────────────────────────────────
    const handlePhotoAdd = useCallback(async (files) => {
        if (!files || files.length === 0)
            return;
        const remaining = maxPhotos - value.length - uploadingPhotos.length;
        const toUpload = Array.from(files).slice(0, remaining);
        if (toUpload.length === 0) {
            toast({ title: "Photo limit reached", description: `Maximum ${maxPhotos} photos allowed.`, variant: "destructive" });
            return;
        }
        if (toUpload.length < files.length) {
            toast({ title: "Some photos skipped", description: `Only ${toUpload.length} photos added (${maxPhotos} max).` });
        }
        // Create preview slots immediately
        const slots = toUpload.map((f) => ({
            id: `${Date.now()}-${Math.random()}`,
            preview: URL.createObjectURL(f),
        }));
        setUploadingPhotos((prev) => [...prev, ...slots]);
        try {
            const result = await uploadMedia(toUpload);
            // Replace preview slots with real URLs
            setUploadingPhotos((prev) => prev.filter((s) => !slots.some((sl) => sl.id === s.id)));
            slots.forEach((s) => URL.revokeObjectURL(s.preview));
            onChange?.([...value, ...result.photos]);
        }
        catch (err) {
            setUploadingPhotos((prev) => prev.filter((s) => !slots.some((sl) => sl.id === s.id)));
            slots.forEach((s) => URL.revokeObjectURL(s.preview));
            toast({
                title: "Upload failed",
                description: err?.response?.data?.message ?? "Could not upload photos. Please try again.",
                variant: "destructive",
            });
        }
    }, [value, uploadingPhotos.length, maxPhotos, onChange, toast]);
    // ── Photo remove ──────────────────────────────────────────────────────────
    const handlePhotoRemove = useCallback(async (url) => {
        setDeletingUrls((prev) => new Set(prev).add(url));
        try {
            await deleteMedia([url]);
        }
        catch {
            // best effort — don't block the user from removing the photo from the form
            console.warn('[PhotoUploader] Failed to delete photo from storage:', url);
        }
        finally {
            setDeletingUrls((prev) => { const s = new Set(prev); s.delete(url); return s; });
            onChange?.(value.filter((u) => u !== url));
        }
    }, [value, onChange]);
    // ── Video add ─────────────────────────────────────────────────────────────
    const handleVideoAdd = useCallback(async (file) => {
        if (!file)
            return;
        setUploadingVideo(true);
        try {
            const result = await uploadMedia([], file);
            onVideoChange?.(result.video);
        }
        catch (err) {
            toast({
                title: "Video upload failed",
                description: err?.response?.data?.message ?? "Could not upload video. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setUploadingVideo(false);
        }
    }, [onVideoChange, toast]);
    // ── Video remove ──────────────────────────────────────────────────────────
    const handleVideoRemove = useCallback(async () => {
        if (!videoUrl)
            return;
        setDeletingUrls((prev) => new Set(prev).add(videoUrl));
        try {
            await deleteMedia([videoUrl]);
        }
        catch {
            console.warn('[PhotoUploader] Failed to delete video from storage:', videoUrl);
        }
        finally {
            setDeletingUrls((prev) => { const s = new Set(prev); s.delete(videoUrl); return s; });
            onVideoChange?.(null);
        }
    }, [videoUrl, onVideoChange]);
    // ─────────────────────────────────────────────────────────────────────────
    const totalSlots = value.length + uploadingPhotos.length;
    const canAddMore = totalSlots < maxPhotos && !disabled;
    return (<div className="space-y-5">

      {/* ── Photos section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4 text-muted-foreground"/>
            Photos
            <span className="text-xs font-normal text-muted-foreground">
              ({totalSlots}/{maxPhotos})
            </span>
          </Label>
          {canAddMore && (<Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => photoInputRef.current?.click()} disabled={disabled}>
              <Upload className="h-3.5 w-3.5"/>
              Add Photos
            </Button>)}
        </div>

        <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handlePhotoAdd(e.target.files)} onClick={(e) => { e.target.value = ''; }}/>

        {/* Photo grid */}
        {totalSlots === 0 ? (<button type="button" onClick={() => photoInputRef.current?.click()} disabled={disabled} className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <ImageIcon className="h-8 w-8"/>
            <span className="text-sm">Click to add photos</span>
            <span className="text-xs opacity-60">JPEG, PNG, WebP — max 10 MB each</span>
          </button>) : (<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {/* Existing / uploaded photos */}
            {value.map((url) => {
                const isDeleting = deletingUrls.has(url);
                return (<div key={url} className="relative group aspect-square rounded-xl overflow-hidden border bg-muted">
                  <Image src={url} alt="" fill className="object-cover" unoptimized/>
                  {isDeleting ? (<div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-5 w-5 animate-spin text-white"/>
                    </div>) : (!disabled && (<button type="button" onClick={() => handlePhotoRemove(url)} className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all">
                        <X className="h-3.5 w-3.5"/>
                      </button>))}
                </div>);
            })}

            {/* Uploading preview slots */}
            {uploadingPhotos.map((slot) => (<div key={slot.id} className="relative aspect-square rounded-xl overflow-hidden border bg-muted">
                <Image src={slot.preview} alt="Uploading…" fill className="object-cover opacity-50" unoptimized/>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-5 w-5 animate-spin text-white"/>
                </div>
              </div>))}

            {/* Add more button */}
            {canAddMore && (<button type="button" onClick={() => photoInputRef.current?.click()} disabled={disabled} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Upload className="h-5 w-5"/>
                <span className="text-xs">Add</span>
              </button>)}
          </div>)}

        <p className="text-xs text-muted-foreground">
          Photos are uploaded instantly when added. Removed photos are deleted from storage immediately.
        </p>
      </div>

      {/* ── Video section ── */}
      <div className="space-y-3 border-t pt-4">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Video className="h-4 w-4 text-muted-foreground"/>
          Video
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </Label>

        <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/x-msvideo,video/webm" className="hidden" onChange={(e) => handleVideoAdd(e.target.files?.[0] ?? null)} onClick={(e) => { e.target.value = ''; }}/>

        {uploadingVideo ? (<div className="flex h-20 items-center justify-center gap-3 rounded-xl border-2 border-dashed text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin"/>
            <span className="text-sm">Uploading video…</span>
          </div>) : videoUrl ? (<div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-56">
              <video src={videoUrl} controls className="w-full h-full" preload="metadata"/>
              {deletingUrls.has(videoUrl) && (<div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white"/>
                </div>)}
            </div>
            {!disabled && !deletingUrls.has(videoUrl) && (<div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive gap-2" onClick={handleVideoRemove}>
                  <X className="h-3.5 w-3.5"/>
                  Remove Video
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => videoInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5"/>
                  Replace
                </Button>
              </div>)}
          </div>) : (<button type="button" onClick={() => videoInputRef.current?.click()} disabled={disabled} className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <Video className="h-6 w-6"/>
            <span className="text-sm">Click to add a video</span>
            <span className="text-xs opacity-60">MP4, MOV, AVI, WebM — max 100 MB</span>
          </button>)}
      </div>
    </div>);
}
