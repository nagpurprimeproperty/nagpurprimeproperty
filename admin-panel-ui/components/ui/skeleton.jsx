import { cn } from '@/lib/utils';
function Skeleton({ className, ...props }) {
    return (<div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        // Shimmer overlay
        "after:absolute after:inset-0 after:-translate-x-full after:animate-skeleton-shimmer after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent",
        // Keep shimmer subtle in dark mode
        "dark:after:via-foreground/5",
        className
      )}
      {...props}
    />);
}
export { Skeleton };
