"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanCard } from "./plan-card";
import { PlanEmptyState } from "./plan-empty-state";

/** Single column until lg (sidebar + padding); avoids 2-col overflow in narrow main area */
const GRID_CLASS =
    "grid w-full max-w-full min-w-0 gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3";

function PlanCardSkeleton() {
    return (
        <Card className="flex min-w-0 max-w-full flex-col gap-0 overflow-hidden py-0">
            <Skeleton className="h-40 w-full rounded-none" />
            <CardContent className="flex-1 space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid min-w-0 grid-cols-2 gap-2">
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                </div>
            </CardContent>
        </Card>
    );
}

export function PlanGrid({
    plans,
    isLoading,
    isFiltered,
    canWrite,
    canDelete,
    onEdit,
    onDelete,
    onToggle,
    onCreate,
}) {
    if (isLoading) {
        return (
            <div className={GRID_CLASS}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="min-w-0 max-w-full">
                        <PlanCardSkeleton />
                    </div>
                ))}
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <PlanEmptyState
                isFiltered={isFiltered}
                canWrite={canWrite}
                onCreate={onCreate}
            />
        );
    }

    return (
        <div className={GRID_CLASS}>
            {plans.map((plan) => (
                <div key={plan._id} className="min-w-0 max-w-full">
                    <PlanCard
                        plan={plan}
                        canWrite={canWrite}
                        canDelete={canDelete}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggle={onToggle}
                    />
                </div>
            ))}
        </div>
    );
}

