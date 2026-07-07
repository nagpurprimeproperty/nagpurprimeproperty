/**
 * SubAdminStats
 *
 * Displays 3 KPI cards fetched from GET /v1/admin/sub-admins/stats.
 * Uses TanStack Query via useSubAdminStats — no props required.
 */
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX } from "lucide-react";
import { useSubAdminStats } from "@/hooks/use-sub-admin-queries";
export function SubAdminStats() {
    const { data: stats, isLoading } = useSubAdminStats();
    const cards = [
        {
            label: "Total Sub-Admins",
            value: stats?.total ?? 0,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            label: "Active",
            value: stats?.active ?? 0,
            icon: UserCheck,
            color: "text-green-600",
            bg: "bg-green-500/10",
        },
        {
            label: "Inactive",
            value: stats?.inactive ?? 0,
            icon: UserX,
            color: "text-red-600",
            bg: "bg-red-500/10",
        },
    ];
    return (<div className="grid gap-3 sm:gap-4 grid-cols-3">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (<Card key={label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 sm:p-3 shrink-0 ${bg}`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`}/>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
              {isLoading ? (<Skeleton className="h-7 w-10 mt-1"/>) : (<p className="text-xl sm:text-2xl font-bold">{value}</p>)}
            </div>
          </CardContent>
        </Card>))}
    </div>);
}
