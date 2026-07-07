/**
 * Shared skeleton primitives for all admin list-page loaders.
 *
 * Usage:
 *   <TableSkeleton cols={6} rows={8} />
 *   <PropertyGridSkeleton />
 *   <PropertyListSkeleton />
 *   <MobileCardSkeleton rows={4} />
 *   <StatCardSkeleton />
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ─── Table (desktop) skeleton ─────────────────────────────────────────────────
export function TableSkeleton({ cols = 6, rows = 8, hasActions = true }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="bg-muted/50 px-4 py-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full max-w-[100px]" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="px-4 py-3 border-t grid gap-3 items-center"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, col) => {
            // First column: avatar + text block
            if (col === 0) {
              return (
                <div key={col} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-3.5 w-[80%]" />
                    <Skeleton className="h-3 w-[60%]" />
                  </div>
                </div>
              );
            }
            // Last column: action button
            if (hasActions && col === cols - 1) {
              return (
                <div key={col} className="flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              );
            }
            // Badge-like (shorter)
            if (col === cols - 2) {
              return <Skeleton key={col} className="h-5 w-16 rounded-full" />;
            }
            return <Skeleton key={col} className="h-4 w-full max-w-[120px]" />;
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Mobile card skeleton ─────────────────────────────────────────────────────
export function MobileCardSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Property card (grid view) skeleton ──────────────────────────────────────
export function PropertyGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-40 sm:h-48 w-full rounded-none" />
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Property list (list view) skeleton ──────────────────────────────────────
export function PropertyListSkeleton({ count = 8 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4">
          <Skeleton className="h-32 sm:h-20 sm:w-28 w-full shrink-0 rounded-lg" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-3 w-[50%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Stat card (dashboard page) skeleton ─────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Card-list item skeleton (sub-admin, transactions, etc.) ─────────────────
export function ListItemSkeleton({ rows = 5, hasAvatar = true }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {hasAvatar && <Skeleton className="h-9 w-9 rounded-full shrink-0" />}
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-3 w-[40%]" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
