import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PropertyMedia({
  images = [],
  video,
  alt,
  aspectClassName = "aspect-[5/4]",
  rounded = "rounded-2xl",
}) {
  // Memoize slides so the array isn't rebuilt on every parent re-render.
  // Only recomputes when the images array reference or video URL changes.
  const slides = useMemo(() => [
    ...images.map((src) => ({ type: "image", src })),
    ...(video ? [{ type: "video", src: video }] : []),
  ], [images, video]);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Reset to first slide when images change (e.g. different card data loaded)
  useEffect(() => { setI(0); setPlaying(false); }, [slides]);

  const go = useCallback((next) => {
    const n = (next + slides.length) % slides.length;
    setI(n);
    setPlaying(false);
  }, [slides.length]);
  const cur = slides[i];

  return (
    <div className={cn("group relative overflow-hidden bg-muted", aspectClassName, rounded)}>
      {cur.type === "image" ? (
        <Image src={cur.src} alt={alt || 'Property image'} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
      ) : playing ? (
        <video
          src={cur.src}
          controls
          autoPlay
          className="h-full w-full bg-black object-cover"
          onEnded={() => setPlaying(false)}
        />
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setPlaying(true);
          }}
          className="relative grid h-full w-full place-items-center bg-foreground"
        >
          <Image src={images[0]} alt={alt || 'Property video thumbnail'} fill className="object-cover opacity-50" sizes="(max-width: 640px) 100vw, 50vw" />
          <span className="relative grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 fill-current" />
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold">
            Property Tour Video
          </span>
        </button>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              go(i - 1);
            }}
            className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              go(i + 1);
            }}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/70 px-2 py-1 backdrop-blur">
            {slides.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  go(idx);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === i ? "w-5 bg-primary" : "w-1.5 bg-foreground/40",
                  s.type === "video" && idx !== i && "bg-primary/60",
                )}
                aria-label={s.type === "video" ? "Video tour" : `Image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
