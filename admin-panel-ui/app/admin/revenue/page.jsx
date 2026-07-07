"use client"

import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, TrendingUp, Users, Calendar, ArrowUpRight, ArrowRight, Crown, } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { useRevenueStats, useMonthlyRevenue, useSubscriptionsByPlan, usePlanBreakdown, useTransactions, revenueKeys, } from "@/hooks/use-revenue-queries";
import { formatInr } from "@/lib/formatters";
function ChartTooltip({ active, payload, label, formatter }) {
    if (!active || !payload?.length)
        return null;
    return (<div className="rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 shadow-lg">
      {label && (<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>)}
      {payload.map((entry, i) => (<p key={i} className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>))}
    </div>);
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
// Distinct colours for plan bars
const BAR_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

function ChartAreaSkeleton({ bars = 7 }) {
    return (<div className="h-[300px] w-full rounded-lg border bg-muted/10 p-4">
      <div className="flex h-full items-end gap-2">
        {Array.from({ length: bars }).map((_, i) => (<Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${30 + (i % 5) * 11}%` }}/>))}
      </div>
    </div>);
}
// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
    const { data: stats, isLoading } = useRevenueStats();
    const cards = [
        {
            label: "Total Revenue",
            value: formatInr(stats?.totalRevenue ?? 0),
            sub: "+18% from last month",
            icon: IndianRupee,
            border: "border-l-primary",
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
        },
        {
            label: "Monthly Revenue",
            value: formatInr(stats?.monthlyRevenue ?? 0),
            sub: "+12% from last month",
            icon: TrendingUp,
            border: "border-l-green-500",
            iconBg: "bg-green-500/10",
            iconColor: "text-green-600",
        },
        {
            label: "Active Subscriptions",
            value: String(stats?.activeSubscriptions ?? 0),
            sub: "Currently active",
            icon: Users,
            border: "border-l-blue-500",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
        },
        {
            label: "Expiring Soon",
            value: String(stats?.expiringSoon ?? 0),
            sub: "In next 7 days",
            icon: Calendar,
            border: "border-l-yellow-500",
            iconBg: "bg-yellow-500/10",
            iconColor: "text-yellow-600",
        },
    ];
    return (<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, sub, icon: Icon, border, iconBg, iconColor }) => (<Card key={label} className={`border-l-4 ${border}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
                {isLoading
                ? <Skeleton className="h-8 w-28 mt-1"/>
                : <p className="text-xl sm:text-2xl font-bold break-words">{value}</p>}
                <div className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-green-600">
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0"/>
                  <span>{sub}</span>
                </div>
              </div>
              <div className={`rounded-lg ${iconBg} p-2 sm:p-3 shrink-0`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`}/>
              </div>
            </div>
          </CardContent>
        </Card>))}
    </div>);
}
// ─── Revenue Trend Chart ──────────────────────────────────────────────────────
function RevenueTrendChart() {
    const { data: monthly, isLoading } = useMonthlyRevenue();
    return (<Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <CardTitle className="text-base sm:text-lg font-semibold">Revenue Trend</CardTitle>
        <p className="text-xs text-muted-foreground">Last 6 months</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (<ChartAreaSkeleton bars={6}/>) : (<ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthly ?? []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
              <XAxis dataKey="month" className="text-xs"/>
              <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}/>
              <Tooltip content={<ChartTooltip formatter={formatInr}/>}/>
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#colorRevenue)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>)}
      </CardContent>
    </Card>);
}
// ─── Subscriptions by Plan Chart ──────────────────────────────────────────────
function SubscriptionsByPlanChart() {
    const { data, isLoading } = useSubscriptionsByPlan();
    const planNames = data?.planNames ?? [];
    const chartData = data?.data ?? [];
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg font-semibold">Subscriptions by Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (<ChartAreaSkeleton bars={8}/>) : (<>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                <XAxis dataKey="month" className="text-xs"/>
                <YAxis className="text-xs" allowDecimals={false}/>
                <Tooltip content={<ChartTooltip />}/>
                {planNames.map((name, i) => (<Bar key={name} dataKey={name} name={name} fill={BAR_COLORS[i % BAR_COLORS.length]} radius={[4, 4, 0, 0]} stackId="plans"/>))}
              </BarChart>
            </ResponsiveContainer>
            {planNames.length > 0 && (<div className="mt-4 flex flex-wrap justify-center gap-4">
                {planNames.map((name, i) => (<div key={name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}/>
                    <span className="text-sm">{name}</span>
                  </div>))}
              </div>)}
          </>)}
      </CardContent>
    </Card>);
}
// ─── Plan Breakdown Cards ─────────────────────────────────────────────────────
/** Returns a short label like "/mo", "/yr", "/day", or "Unlimited" */
function priceLabel(plan) {
    if (plan.isDurationUnlimited) return "Unlimited";
    const unitMap = { months: "mo", years: "yr", days: "day" };
    const unit = unitMap[plan.durationUnit] ?? plan.durationUnit;
    return `/${unit}`;
}
function PlanBreakdownCards() {
    const { data: plans, isLoading } = usePlanBreakdown();
    if (isLoading) {
        return (<div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (<Card key={i}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-md"/>
                  <Skeleton className="h-4 w-28"/>
                </div>
                <Skeleton className="h-6 w-16 rounded-full"/>
              </div>
              <div className="space-y-3 text-sm">
                {[1, 2, 3, 4].map((j) => (<div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-3 w-28"/>
                    <Skeleton className="h-3 w-16"/>
                  </div>))}
              </div>
            </CardContent>
          </Card>))}
      </div>);
    }
    if (!plans || plans.length === 0)
        return null;
    return (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (<Card key={plan.planName}>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary"/>
                <h3 className="text-lg font-semibold">{plan.planName}</h3>
              </div>
              <Badge variant="outline">
                {plan.isDurationUnlimited
                  ? formatInr(plan.price)
                  : `${formatInr(plan.price)}${priceLabel(plan)}`}
              </Badge>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Subscribers</span>
                <span className="font-semibold">{plan.subscribers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue This Month</span>
                <span className="font-semibold">{formatInr(plan.revenueThisMonth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">{formatInr(plan.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New This Month</span>
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  <ArrowUpRight className="h-3 w-3"/>
                  {plan.newThisMonth}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>))}
    </div>);
}
// ─── Recent Transactions ──────────────────────────────────────────────────────
function RecentTransactions() {
    const txParams = useMemo(() => ({ limit: 5 }), []);
    const { data, isLoading } = useTransactions(txParams);
    const transactions = data?.data ?? [];
    const statusVariant = (s) => s === "Active" ? "default" : s === "Pending" ? "secondary" : "destructive";
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg font-semibold">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
          <Link href="/admin/revenue/transactions">
            View All <ArrowRight className="h-4 w-4"/>
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (<div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0"/>
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-40"/>
                    <Skeleton className="h-3 w-28"/>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20 ml-auto"/>
                    <Skeleton className="h-3 w-16 ml-auto"/>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full"/>
                </div>
              </div>))}
          </div>) : transactions.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>) : (<div className="space-y-3">
            {transactions.map((tx) => (<div key={tx._id} className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                    <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-primary"/>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{tx.user?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.plan?.name ?? "—"} Plan
                      {tx.paymentDetails?.method ? ` · ${tx.paymentDetails.method}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatInr(tx.paymentDetails?.amountPaid ?? tx.plan?.price ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">{fmtDate(tx.createdAt)}</p>
                  </div>
                  <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                </div>
              </div>))}
          </div>)}
      </CardContent>
    </Card>);
}
// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RevenuePage() {
    const queryClient = useQueryClient();
    const isRefreshing = useIsFetching({ queryKey: revenueKeys.all }) > 0;
    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: revenueKeys.all });
    };
    return (<PermissionGate module="revenue" action="read" fallback={<Unauthorized />}>
      <div className="space-y-4 sm:space-y-6">
        <AdminPageHeader
          title="Revenue"
          description="Track subscriptions, revenue trends and plan performance"
          onRefresh={handleRefresh}
          isFetching={isRefreshing}
          refreshWithLabel
        />

        {/* KPI Cards */}
        <StatCards />

        {/* Charts row */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <RevenueTrendChart />
          <SubscriptionsByPlanChart />
        </div>

        {/* Plan breakdown */}
        <PlanBreakdownCards />

        {/* Recent transactions */}
        <RecentTransactions />
      </div>
    </PermissionGate>);
}
