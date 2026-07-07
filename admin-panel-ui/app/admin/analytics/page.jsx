"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { MessageSquare, TrendingUp, Users, Building2, Download, ArrowUpRight, ArrowDownRight, RefreshCw, } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, } from "recharts";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { useToast } from "@/hooks/use-toast";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { useAnalyticsOverview, useUserActivity, useSubscriptionPlanDistribution, useTopBrokers, usePropertiesByLocation, usePropertyTypeDistribution, } from "@/hooks/use-analytics-queries";

function ChartSkeleton({ bars = 7 }) {
    return (<div className="h-[300px] w-full rounded-lg border bg-muted/10 p-4">
      <div className="flex h-full items-end gap-2">
        {Array.from({ length: bars }).map((_, i) => (<Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${28 + (i % 5) * 12}%` }}/>))}
      </div>
    </div>);
}

function DonutLegendSkeleton() {
    return (<div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-full sm:w-52 shrink-0 h-[200px] flex items-center justify-center">
        <div className="h-[150px] w-[150px] rounded-full border border-muted flex items-center justify-center">
          <Skeleton className="h-[72px] w-[72px] rounded-full"/>
        </div>
      </div>
      <div className="flex-1 w-full space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-full shrink-0"/>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24"/>
                <Skeleton className="h-3 w-8"/>
              </div>
              <Skeleton className="h-1.5 w-full rounded-full"/>
            </div>
            <Skeleton className="h-3 w-6 shrink-0"/>
          </div>))}
      </div>
    </div>);
}
// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, change, icon: Icon, iconBg, iconColor, isLoading, formatValue, }) {
    const isPositive = (change ?? 0) >= 0;
    const displayValue = value !== undefined
        ? (formatValue ? formatValue(value) : value.toLocaleString("en-IN"))
        : "—";
    return (<Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (<Skeleton className="h-8 w-24 mt-1"/>) : (<p className="text-2xl font-bold">{displayValue}</p>)}
            {change !== undefined && !isLoading && (<div className={`mt-1 flex items-center gap-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive
                ? <ArrowUpRight className="h-4 w-4"/>
                : <ArrowDownRight className="h-4 w-4"/>}
                {isPositive ? "+" : ""}{change}% this week
              </div>)}
          </div>
          <div className={`rounded-lg p-3 ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`}/>
          </div>
        </div>
      </CardContent>
    </Card>);
}
// ─── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length)
        return null;
    return (<div className="rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 shadow-lg">
      {label && (<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>)}
      {payload.map((entry, i) => (<p key={i} className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          {entry.name}: {entry.value}
        </p>))}
    </div>);
}
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const { toast } = useToast();
    const [period, setPeriod] = useState("week");
    const overview = useAnalyticsOverview();
    const activity = useUserActivity(period);
    const planDist = useSubscriptionPlanDistribution();
    const topBrokers = useTopBrokers(5);
    const byLocation = usePropertiesByLocation();
    const byType = usePropertyTypeDistribution();
    const isRefreshing = overview.isFetching || activity.isFetching;
    const handleRefresh = () => {
        overview.refetch();
        activity.refetch();
        planDist.refetch();
        topBrokers.refetch();
        byLocation.refetch();
        byType.refetch();
    };
    const handleExport = () => {
        const data = planDist.data ?? [];
        if (data.length === 0) {
            toast({ title: 'No data', description: 'No subscription plan data to export yet.', variant: 'destructive' });
            return;
        }
        const rows = [
            ['Plan', 'Subscribers', 'Percentage %'],
            ...data.map((p) => [p.name, p.value, p.percentage]),
        ];
        const csv = rows
            .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `subscription-plans-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Export complete', description: 'subscription-plans.csv downloaded.' });
    };
    const ov = overview.data;
    return (<PermissionGate module="analytics" action="read" fallback={<Unauthorized />}>
      <div className="space-y-6">

        <AdminPageHeader
          title="Analytics"
          description="Platform insights and performance metrics"
          onRefresh={handleRefresh}
          isFetching={isRefreshing}
          refreshWithLabel
        >
          <Select value={period} onValueChange={(v) => setPeriod(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </AdminPageHeader>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Properties" value={ov?.totalProperties} change={ov?.totalPropertiesChange} icon={Building2} iconBg="bg-primary/10" iconColor="text-primary" isLoading={overview.isLoading}/>
          <StatCard title="Total Inquiries" value={ov?.inquiries} change={ov?.inquiriesChange} icon={MessageSquare} iconBg="bg-blue-500/10" iconColor="text-blue-600" isLoading={overview.isLoading}/>
          <StatCard title="Avg. Conversion Rate" value={ov?.conversionRate} change={ov?.conversionRateChange} icon={TrendingUp} iconBg="bg-green-500/10" iconColor="text-green-600" isLoading={overview.isLoading} formatValue={(v) => `${v}%`}/>
          <StatCard title="Active Users" value={ov?.activeUsers} change={ov?.activeUsersChange} icon={Users} iconBg="bg-purple-500/10" iconColor="text-purple-600" isLoading={overview.isLoading}/>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* User & Lead Growth */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">User & Lead Growth</CardTitle>
              <Select value={period} onValueChange={(v) => setPeriod(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {activity.isLoading ? (<ChartSkeleton bars={7}/>) : (<ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activity.data ?? []}>
                    <defs>
                      <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis dataKey="date" className="text-xs"/>
                    <YAxis className="text-xs"/>
                    <Tooltip content={<ChartTooltip />}/>
                    <Area type="monotone" dataKey="newUsers" stroke="#f97316" fill="url(#colorNewUsers)" strokeWidth={2} name="New Users"/>
                    <Area type="monotone" dataKey="inquiries" stroke="#3b82f6" fill="url(#colorInquiries)" strokeWidth={2} name="Inquiries"/>
                  </AreaChart>
                </ResponsiveContainer>)}
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#f97316]"/>
                  <span className="text-sm">New Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#3b82f6]"/>
                  <span className="text-sm">Inquiries</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plan Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Subscription Plans</CardTitle>
                <CardDescription className="mt-1">Active users by plan type</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4"/>Export
              </Button>
            </CardHeader>
            <CardContent>
              {planDist.isLoading ? (<DonutLegendSkeleton />) : (planDist.data ?? []).length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">No plan data yet.</div>) : (<div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Donut */}
                  <div className="w-full sm:w-52 shrink-0 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={planDist.data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                          {(planDist.data ?? []).map((entry, i) => (<Cell key={`cell-${i}`} fill={entry.color}/>))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend + stats */}
                  <div className="flex-1 w-full space-y-3">
                    {(planDist.data ?? []).map((item) => (<div key={item.name} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${item.percentage}%`, backgroundColor: item.color }}/>
                          </div>
                        </div>
                        <span className="text-sm font-bold w-8 text-right shrink-0">{item.value}</span>
                      </div>))}
                  </div>
                </div>)}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Top Performing Brokers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Top Performing Brokers</CardTitle>
              {topBrokers.isLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground"/>}
            </CardHeader>
            <CardContent>
              {topBrokers.isLoading ? (<div className="space-y-3">
                  {[1, 2, 3].map((i) => (<div key={i} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0"/>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40"/>
                          <Skeleton className="h-3 w-28"/>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 text-sm">
                        <div className="text-center hidden sm:block space-y-2">
                          <Skeleton className="h-4 w-10 mx-auto"/>
                          <Skeleton className="h-3 w-16 mx-auto"/>
                        </div>
                        <div className="text-center hidden sm:block space-y-2">
                          <Skeleton className="h-4 w-10 mx-auto"/>
                          <Skeleton className="h-3 w-12 mx-auto"/>
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full"/>
                      </div>
                    </div>))}
                </div>) : (topBrokers.data ?? []).length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">
                  No broker data available yet.
                </div>) : (<div className="space-y-4">
                  {(topBrokers.data ?? []).map((broker, index) => (<div key={broker.id ?? `${broker.name}-${index}`} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{broker.name}</p>
                          <p className="text-sm text-muted-foreground">{broker.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 text-sm">
                        <div className="text-center hidden sm:block">
                          <p className="font-semibold">{broker.properties}</p>
                          <p className="text-muted-foreground">Properties</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="font-semibold">{broker.leads}</p>
                          <p className="text-muted-foreground">Leads</p>
                        </div>
                        <Badge variant="outline" className="text-green-600">{broker.conversion}</Badge>
                      </div>
                    </div>))}
                </div>)}
            </CardContent>
          </Card>

          {/* Properties by Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Properties by Location</CardTitle>
              <CardDescription>Active listings across Nagpur localities</CardDescription>
            </CardHeader>
            <CardContent>
              {byLocation.isLoading ? (<ChartSkeleton bars={6}/>) : (byLocation.data ?? []).length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">No location data yet.</div>) : (<ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byLocation.data ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis type="number" className="text-xs"/>
                    <YAxis type="category" dataKey="city" className="text-xs" width={90}/>
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}/>
                    <Bar dataKey="properties" fill="#f97316" radius={[0, 4, 4, 0]} name="Properties"/>
                  </BarChart>
                </ResponsiveContainer>)}
            </CardContent>
          </Card>
        </div>

        {/* Property Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Property Type Distribution</CardTitle>
            <CardDescription>Breakdown of all active listings by property type</CardDescription>
          </CardHeader>
          <CardContent>
            {byType.isLoading ? (<div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="rounded-lg border p-4 text-center space-y-3">
                    <Skeleton className="h-8 w-8 rounded-md mx-auto"/>
                    <Skeleton className="h-4 w-24 mx-auto"/>
                    <Skeleton className="h-7 w-12 mx-auto"/>
                    <Skeleton className="h-3 w-10 mx-auto"/>
                  </div>))}
              </div>) : (byType.data ?? []).length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">No property data available yet.</div>) : (<div className={`grid gap-4 ${(byType.data ?? []).length <= 4 ? "md:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-6"}`}>
                {(byType.data ?? []).map((item) => (<div key={item.type} className="rounded-lg border p-4 text-center">
                    <Building2 className="mx-auto h-8 w-8 text-primary"/>
                    <p className="mt-2 font-semibold text-sm line-clamp-2">{item.type}</p>
                    <p className="text-2xl font-bold text-primary">{item.count}</p>
                    <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>

      </div>
    </PermissionGate>);
}
