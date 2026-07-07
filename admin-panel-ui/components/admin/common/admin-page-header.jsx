"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/**
 * Shared list/detail page title row with optional refresh and trailing actions.
 *
 * @param {"sm" | "icon"} refreshSize - matches existing pages (sm: users/sub-admin/properties; icon: plans)
 * @param {React.ReactNode} [leading] — e.g. back button; sits before title/description
 * @param {boolean} [refreshWithLabel] — outline button with icon + "Refresh" text
 */
export function AdminPageHeader({
  leading,
  title,
  description,
  onRefresh,
  isFetching = false,
  refreshSize = "sm",
  refreshWithLabel = false,
  children,
}) {
  const titleBlock = (
    <div className="min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{description}</p>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      {leading ? (
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="shrink-0">{leading}</div>
          {titleBlock}
        </div>
      ) : (
        titleBlock
      )}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {onRefresh ? (
          <Button
            variant="outline"
            size={refreshWithLabel ? "sm" : refreshSize === "icon" ? "icon" : "sm"}
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 shrink-0 ${isFetching ? "animate-spin" : ""} ${refreshWithLabel ? "mr-2" : ""}`} />
            {refreshWithLabel ? <span className="hidden sm:inline">Refresh</span> : null}
          </Button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
