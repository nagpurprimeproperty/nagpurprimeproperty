"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus } from "lucide-react";
export function PlanEmptyState({ isFiltered, canWrite, onCreate }) {
    return (<Card className="w-full min-w-0">
      <CardContent className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground"/>
        </div>
        <div>
          <h3 className="font-semibold text-base">No plans found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isFiltered
            ? "Try changing the status filter."
            : "Create your first subscription plan to get started."}
          </p>
        </div>
        {canWrite && !isFiltered && (<Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4"/>Create First Plan
          </Button>)}
      </CardContent>
    </Card>);
}
