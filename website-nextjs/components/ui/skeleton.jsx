import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Base: muted background, rounded
        "relative overflow-hidden rounded-md bg-muted/60",
        // Shimmer overlay — sweep from left to right (matches admin panel)
        "after:absolute after:inset-0 after:-translate-x-full after:animate-skeleton-shimmer after:bg-gradient-to-r after:from-transparent after:via-foreground/[0.07] after:to-transparent",
        // Subtler in dark mode
        "dark:after:via-foreground/[0.04]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
