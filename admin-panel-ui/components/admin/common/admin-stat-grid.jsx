"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @param {{ label: string, value?: number|string, icon: import("lucide-react").LucideIcon, color: string, bg: string }[]} items
 */
export function AdminStatGrid({
  items,
  isLoading = false,
  gridClassName = "grid gap-4 grid-cols-2 lg:grid-cols-3",
}) {
  return (
    <div className={gridClassName}>
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 sm:p-3 shrink-0 ${bg}`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
              {isLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl sm:text-2xl font-bold">{value ?? 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
