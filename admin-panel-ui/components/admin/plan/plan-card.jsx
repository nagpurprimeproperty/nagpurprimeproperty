"use client"

/**
 * PlanCard — displays a single plan.
 * Purely presentational: receives callbacks, no mutation logic.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Building2, Star, Zap, Headphones, BarChart3, CheckCircle2, Infinity, Crown, Package, MoreHorizontal, Edit2, Trash2, ToggleLeft, ToggleRight, } from "lucide-react";
import { formatCurrency, formatDuration, getPlanGradient } from "./plan-helpers";
function LimitRow({ icon: Icon, label, value, isUnlimited, }) {
  return (<div className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2 min-w-0 overflow-hidden">
    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 flex-shrink-0" />
    <span className="text-xs text-muted-foreground truncate min-w-0">{label}</span>
    <span className="ml-auto text-xs font-semibold shrink-0 flex-shrink-0">
      {isUnlimited
        ? <Infinity className="h-3.5 w-3.5 inline" />
        : (value ?? 0)}
    </span>
  </div>);
}
export function PlanCard({ plan, canWrite, canDelete, onEdit, onDelete, onToggle }) {
  const gradient = getPlanGradient(plan);
  return (<Card className={`overflow-hidden transition-all border-2 w-full min-w-0 max-w-full gap-0 py-0 ${plan.isActive
    ? "border-border hover:shadow-md"
    : "border-dashed border-muted-foreground/30 opacity-65"}`}>
    {/* ── Gradient header ───────────────────────────────────────────── */}
    <div className={`min-w-0 bg-gradient-to-br ${gradient} p-4 sm:p-5`}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        {/* Icon + name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="rounded-xl bg-white/20 p-2 shrink-0">
            {plan.isFree
              ? <Package className="h-5 w-5 text-white" />
              : <Crown className="h-5 w-5 text-white" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight truncate">{plan.name}</h3>
            <p className="text-white/75 text-xs mt-0.5">{formatDuration(plan)}</p>
          </div>
        </div>

        {/* Status badges + menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!plan.isActive && (<Badge className="bg-black/30 text-white text-xs border-0">Inactive</Badge>)}
          {canWrite && (<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 focus-visible:ring-white">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(plan)}>
                <Edit2 className="h-4 w-4" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onToggle(plan)}>
                {plan.isActive
                  ? <><ToggleLeft className="h-4 w-4" />Deactivate</>
                  : <><ToggleRight className="h-4 w-4" />Activate</>}
              </DropdownMenuItem>
              {canDelete && (<>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => onDelete(plan)}>
                  <Trash2 className="h-4 w-4" />Delete
                </DropdownMenuItem>
              </>)}
            </DropdownMenuContent>
          </DropdownMenu>)}
        </div>
      </div>

      {/* Price */}
      <div className="mt-4 min-w-0">
        {plan.isFree ? (<span className="text-3xl font-black text-white">Free</span>) : (<div className="flex min-w-0 items-baseline gap-1">
          <span className="text-3xl font-black text-white truncate">
            {formatCurrency(plan.price)}
          </span>
          <span className="text-white/70 text-sm shrink-0">
            /{plan.durationUnit.replace(/s$/, "")}
          </span>
        </div>)}
      </div>
    </div>

    {/* ── Body ─────────────────────────────────────────────────────── */}
    <CardContent className="p-4 space-y-4 min-w-0">
      {plan.description && (<p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{plan.description}</p>)}

      {/* Limit rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 min-w-0">
        <LimitRow icon={Building2} label="Listings" value={plan.limits?.propertyUploads} isUnlimited={plan.limits?.isPropertyUploadUnlimited} />
        <LimitRow icon={Star} label="Featured" value={plan.limits?.featuredProperties} isUnlimited={plan.limits?.isFeaturedPropertiesUnlimited} />
        <LimitRow icon={Zap} label="Leads" value={plan.limits?.leadAccessCount} isUnlimited={plan.limits?.isLeadAccessUnlimited} />
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-1.5 min-w-0">
        {plan.limits?.prioritySupport && (<Badge variant="outline" className="text-xs gap-1 text-green-700 border-green-200 bg-green-50">
          <Headphones className="h-3 w-3" />Priority Support
        </Badge>)}
        {plan.limits?.analyticsAccess && (<Badge variant="outline" className="text-xs gap-1 text-blue-700 border-blue-200 bg-blue-50">
          <BarChart3 className="h-3 w-3" />Analytics
        </Badge>)}
        {plan.isDurationUnlimited && (<Badge variant="outline" className="text-xs gap-1">
          <Infinity className="h-3 w-3" />Unlimited Duration
        </Badge>)}
      </div>

      {/* Features list */}
      {plan.features && plan.features.length > 0 && (<ul className="space-y-1.5 pt-1 border-t">
        {plan.features.slice(0, 4).map((f, i) => (<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground min-w-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
          <span className="break-words min-w-0">{f}</span>
        </li>))}
        {plan.features.length > 4 && (<li className="text-xs text-primary font-medium pl-5">
          +{plan.features.length - 4} more features
        </li>)}
      </ul>)}
    </CardContent>
  </Card>);
}
