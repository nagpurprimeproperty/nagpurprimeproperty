"use client"

import Link from "next/link";
import { useMemo } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, CreditCard, TrendingUp, UserCheck, Clock, ArrowRight, IndianRupee, } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
import { useUserStats, useUserList, } from "@/hooks/use-user-queries";
import { usePropertyStats, usePropertyList, } from "@/hooks/use-property-queries";
import { useRevenueStats, useMonthlyRevenue, } from "@/hooks/use-revenue-queries";
import { usePropertyTypeDistribution } from "@/hooks/use-analytics-queries";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { formatInr } from "@/lib/formatters";
// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(value) {
    return formatInr(value);
}
const PIE_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b"];

function ChartBarsSkeleton({ bars = 7 }) {
    return (<div className="h-[250px] w-full rounded-lg border bg-muted/10 p-4">
      <div className="flex h-full items-end gap-2">
        {Array.from({ length: bars }).map((_, i) => (<Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${35 + (i % 4) * 12}%` }}/>))}
      </div>
    </div>);
}

function DonutChartSkeleton() {
    return (<div className="space-y-4">
      <div className="mx-auto h-[180px] w-[180px] rounded-full border border-muted flex items-center justify-center">
        <Skeleton className="h-[90px] w-[90px] rounded-full"/>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full"/>
              <Skeleton className="h-3 w-24"/>
            </div>
            <Skeleton className="h-3 w-10"/>
          </div>))}
      </div>
    </div>);
}
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const userStats = useUserStats();
    const propertyStats = usePropertyStats();
    const revenueStats = useRevenueStats();
    const monthly = useMonthlyRevenue();
    const typeDist = usePropertyTypeDistribution();
    const recentUsersParams = useMemo(() => ({ limit: 4 }), []);
    const recentPropsParams = useMemo(() => ({ limit: 4 }), []);
    const recentUsers = useUserList(recentUsersParams);
    const recentProps = usePropertyList(recentPropsParams);
    const isLoadingStats = useMemo(() => userStats.isLoading || propertyStats.isLoading || revenueStats.isLoading, [userStats.isLoading, propertyStats.isLoading, revenueStats.isLoading]);
    const firstError = useMemo(() => userStats.error || propertyStats.error || revenueStats.error || monthly.error || typeDist.error || recentUsers.error || recentProps.error, [userStats.error, propertyStats.error, revenueStats.error, monthly.error, typeDist.error, recentUsers.error, recentProps.error]);
    const dashboardRefreshing = useMemo(() => userStats.isFetching || propertyStats.isFetching || revenueStats.isFetching || monthly.isFetching || typeDist.isFetching || recentUsers.isFetching || recentProps.isFetching, [userStats.isFetching, propertyStats.isFetching, revenueStats.isFetching, monthly.isFetching, typeDist.isFetching, recentUsers.isFetching, recentProps.isFetching]);
    const refreshDashboard = () => {
        userStats.refetch();
        propertyStats.refetch();
        revenueStats.refetch();
        monthly.refetch();
        typeDist.refetch();
        recentUsers.refetch();
        recentProps.refetch();
    };
    return (<div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of users, listings, revenue, and recent activity"
        onRefresh={refreshDashboard}
        isFetching={dashboardRefreshing}
      />
      {firstError && (<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Something went wrong loading dashboard data.</p>
          <p className="mt-1 text-muted-foreground">{firstError instanceof Error ? firstError.message : String(firstError)}</p>
        </div>)}
      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={userStats.data?.total ?? 0} icon={UserCheck} subtitle={`${userStats.data?.active ?? 0} active`} isLoading={userStats.isLoading}/>
        <StatCard title="Active Listings" value={propertyStats.data?.active ?? 0} icon={Building2} subtitle={`${propertyStats.data?.pending ?? 0} pending review`} isLoading={propertyStats.isLoading}/>
        <StatCard title="Monthly Revenue" value={fmtCurrency(revenueStats.data?.monthlyRevenue ?? 0)} icon={CreditCard} isLoading={revenueStats.isLoading}/>
        <StatCard title="Total Revenue" value={fmtCurrency(revenueStats.data?.totalRevenue ?? 0)} icon={IndianRupee} isLoading={revenueStats.isLoading}/>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-semibold">Revenue Overview</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/revenue">View Report</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {monthly.isLoading ? (<ChartBarsSkeleton bars={6}/>) : (<ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthly.data ?? []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }}/>
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}/>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      color: "#000000",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "#000000", fontWeight: 600 }}
                    itemStyle={{ color: "#000000" }}
                    formatter={(v) => [fmtCurrency(v), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>)}
          </CardContent>
        </Card>

        {/* Property Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            {typeDist.isLoading ? (<DonutChartSkeleton />) : (typeDist.data ?? []).length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">No data yet.</div>) : (
              <div className="flex flex-col gap-3">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={typeDist.data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="count" nameKey="type">
                      {(typeDist.data ?? []).map((_, i) => (<Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]}/>))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#000000",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      labelStyle={{ color: "#000000", fontWeight: 600 }}
                      itemStyle={{ color: "#000000" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                  {(typeDist.data ?? []).map((item, i) => (
                    <div key={item.type} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}/>
                        <span className="truncate">{item.type}</span>
                      </div>
                      <span className="font-medium shrink-0 ml-2">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-semibold">Recent Users</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-primary justify-start sm:justify-center" asChild>
              <Link href="/admin/users">
                View All <ArrowRight className="h-4 w-4"/>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentUsers.isLoading ? (<div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((i) => (<div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border p-3 sm:p-4 gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0"/>
                      <div className="min-w-0 space-y-2">
                        <Skeleton className="h-4 w-40"/>
                        <Skeleton className="h-3 w-24"/>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Skeleton className="h-5 w-16 rounded-full"/>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-3 w-16 ml-auto"/>
                        <Skeleton className="h-3 w-20 ml-auto"/>
                      </div>
                    </div>
                  </div>))}
              </div>) : (recentUsers.data?.data ?? []).length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">No users yet.</div>) : (<div className="space-y-3 sm:space-y-4">
                {(recentUsers.data?.data ?? []).map((user) => (<div key={user._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border p-3 sm:p-4 gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.area ?? user.city ?? "Nagpur"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="text-right text-xs sm:text-sm">
                        <p className="font-medium">{user.plan ?? "Free"}</p>
                        <p className="text-muted-foreground">{user.city ?? "Nagpur"}</p>
                      </div>
                    </div>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>

        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Property Listings</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
              <Link href="/admin/properties">
                View All <ArrowRight className="h-4 w-4"/>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentProps.isLoading ? (<div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (<div key={i} className="flex items-center justify-between rounded-lg border border-border p-4 gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-56"/>
                        <Skeleton className="h-5 w-20 rounded-full"/>
                      </div>
                      <Skeleton className="h-3 w-44"/>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full shrink-0"/>
                  </div>))}
              </div>) : (recentProps.data?.data ?? []).length === 0 ? (<div className="py-8 text-center text-muted-foreground text-sm">No properties yet.</div>) : (<div className="space-y-4">
                {(recentProps.data?.data ?? []).map((property) => (<div key={property._id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium line-clamp-1">{property.title}</p>
                        {property.featured && (<Badge variant="outline" className="border-primary text-primary">
                            Featured
                          </Badge>)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {property.location?.city ?? "Nagpur"} &bull; {property.propertyType}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={property.status === "Active" ? "default" : "secondary"}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary"/>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <div className="text-2xl font-bold">
                {isLoadingStats ? <Skeleton className="h-8 w-16"/> : revenueStats.data?.activeSubscriptions ?? 0}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-600"/>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <div className="text-2xl font-bold">
                {isLoadingStats ? <Skeleton className="h-8 w-16"/> : revenueStats.data?.expiringSoon ?? 0}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-500/10 p-3">
              <CreditCard className="h-6 w-6 text-green-600"/>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <div className="text-2xl font-bold">
                {isLoadingStats ? <Skeleton className="h-8 w-24"/> : fmtCurrency(revenueStats.data?.totalRevenue ?? 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
