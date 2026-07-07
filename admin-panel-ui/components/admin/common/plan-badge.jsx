"use client";

import { memo } from "react";
import { Crown } from "lucide-react";

const PLAN_STYLES = {
  free: "bg-gray-100 text-gray-700 border-gray-200",
  basic: "bg-blue-50 text-blue-700 border-blue-200",
  premium: "bg-orange-50 text-orange-700 border-orange-200",
  enterprise: "bg-purple-50 text-purple-700 border-purple-200",
};

export const PlanBadge = memo(function PlanBadge({ plan }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${PLAN_STYLES[plan] ?? PLAN_STYLES.free}`}
    >
      <Crown className="h-3 w-3" />
      {plan}
    </span>
  );
});
