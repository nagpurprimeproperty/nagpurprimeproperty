"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, CheckCircle2, XCircle, Crown } from "lucide-react";
import { usePlanStats } from "@/hooks/use-plan-queries";
const STAT_CARDS = [
    { key: "total", label: "Total Plans", icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { key: "active", label: "Active", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" },
    { key: "inactive", label: "Inactive", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { key: "free", label: "Free Plans", icon: Crown, color: "text-amber-600", bg: "bg-amber-500/10" },
];
export function PlanStats() {
    const { data: stats, isLoading } = usePlanStats();
    return (<div className="grid w-full min-w-0 gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (<Card key={key} className="min-w-0 overflow-hidden">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 sm:p-3 shrink-0 ${bg}`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`}/>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
              {isLoading
                ? <Skeleton className="h-7 w-10 mt-1"/>
                : <p className="text-xl sm:text-2xl font-bold">{stats?.[key] ?? 0}</p>}
            </div>
          </CardContent>
        </Card>))}
    </div>);
}
