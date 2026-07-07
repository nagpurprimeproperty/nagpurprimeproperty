"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Play, Video } from "lucide-react";

function formatValue(v) {
  if (v == null || v === "") return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string" && v.match(/^\d{4}-\d{2}-\d{2}/)) {
    return new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  return String(v);
}

export function MediaSlider({ photos, videoUrl, title }) {
  const slides = [...photos.map((url) => ({ type: "image", url })), ...(videoUrl ? [{ type: "video", url: videoUrl }] : [])];
  const [idx, setIdx] = useState(0);
  const videoRef = useRef(null);

  const go = useCallback((next) => {
    if (slides[idx]?.type === "video") videoRef.current?.pause();
    setIdx(next);
  }, [idx, slides]);

  if (slides.length === 0) {
    return (
      <div className="relative h-72 sm:h-[420px] bg-muted rounded-2xl flex flex-col items-center justify-center gap-3">
        <ImageIcon className="h-16 w-16 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">No media uploaded</p>
      </div>
    );
  }

  const current = slides[idx];
  const isVideo = current.type === "video";

  return (
    <div className="space-y-2.5">
      <div className="relative h-72 sm:h-[420px] rounded-2xl overflow-hidden bg-black group">
        {isVideo ? (
          <>
            <video ref={videoRef} src={current.url} className="w-full h-full object-contain" controls preload="metadata" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
              <Video className="h-3 w-3" />
              Video
            </div>
          </>
        ) : (
          <Image src={current.url} alt={`${title} — photo ${idx + 1}`} fill className="object-cover transition-opacity duration-300" unoptimized priority={idx === 0} />
        )}

        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
          {idx + 1} / {slides.length}
          {slides.some((s) => s.type === "video") && !isVideo && <span className="ml-1.5 opacity-60">· video at end</span>}
        </div>

        {slides.length > 1 && (
          <>
            <button onClick={() => go(Math.max(0, idx - 1))} disabled={idx === 0} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white disabled:opacity-0 hover:bg-black/75 transition-all duration-150 opacity-0 group-hover:opacity-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => go(Math.min(slides.length - 1, idx + 1))} disabled={idx === slides.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white disabled:opacity-0 hover:bg-black/75 transition-all duration-150 opacity-0 group-hover:opacity-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border">
          {slides.map((slide, i) => (
            <button key={i} onClick={() => go(i)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-150 ${i === idx ? "border-primary shadow-md scale-[1.03]" : "border-transparent opacity-55 hover:opacity-90 hover:border-border"}`}>
              {slide.type === "video" ? (
                <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-1">
                  <Play className="h-4 w-4 text-white/80 fill-white/80" />
                  <span className="text-[9px] text-white/60 font-medium uppercase tracking-wide">Video</span>
                </div>
              ) : (
                <Image src={slide.url} alt="" fill className="object-cover" unoptimized />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InfoRow({ label, value }) {
  const display = formatValue(value);
  if (!display) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-words max-w-[60%]">{display}</span>
    </div>
  );
}

export function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3 text-center space-y-1">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold leading-tight">{value}</p>
    </div>
  );
}
