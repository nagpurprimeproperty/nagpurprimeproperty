"use client"

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { ArrowLeft, Search, Filter, CreditCard, Download, } from "lucide-react";
import { useTransactions, useTransactionStats } from "@/hooks/use-revenue-queries";
import { useToast } from "@/hooks/use-toast";
import { revenueApi } from "@/lib/api/revenue.api";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { ServerPagination } from "@/components/admin/common/server-pagination";
import { useAdminListState } from "@/hooks/use-admin-list-state";
import { PermissionGate, Unauthorized } from "@/components/utils/permission-gate";
import { formatInr } from "@/lib/formatters";

export default function TransactionsPage() {
  const { toast } = useToast();
  const { searchInput, debouncedSearch, currentPage, setCurrentPage, handleSearchChange, withResetPage, } = useAdminListState();
  const [filterStatus, setFilterStatus] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);
  const itemsPerPage = 10;
  const txParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    status: filterStatus,
  }), [currentPage, itemsPerPage, debouncedSearch, filterStatus]);
  const { data: transactionResponse, isLoading, isFetching, refetch } = useTransactions(txParams);
  const transactions = transactionResponse?.data ?? [];
  const pagination = transactionResponse?.pagination;
  const { data: txStats } = useTransactionStats();
  const formatCurrency = (value) => formatInr(value);
  const handleExport = async () => {
    setExportLoading(true);
    toast({ title: "Export Started", description: "Fetching all transactions..." });
    try {
      const allRows = [];
      const pageSize = 500;
      let page = 1;
      const maxCap = 10000;
      let truncated = false;
      while (allRows.length < maxCap) {
        const res = await revenueApi.getTransactions({
          search: debouncedSearch || undefined,
          status: filterStatus,
          page,
          limit: pageSize,
        });
        const batch = res.data ?? [];
        if (batch.length === 0)
          break;
        allRows.push(...batch);
        if (batch.length < pageSize)
          break;
        page++;
        if (allRows.length >= maxCap) {
          truncated = true;
          allRows.length = maxCap;
          break;
        }
      }
      if (!allRows.length) {
        toast({ title: "Nothing to export", description: "No transactions match the current filters.", variant: "destructive" });
        return;
      }
      if (truncated) {
        toast({ title: "Export Truncated", description: `Only ${maxCap} transactions could be exported.`, variant: "destructive" });
      }
      const escape = (v) => {
        const s = String(v ?? "");
        if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      const headers = ["Order ID", "User", "Email", "Mobile", "Plan", "Amount", "Method", "Status", "Start Date", "End Date", "Created At"];
      const csv = [
        headers.join(","),
        ...allRows.map((t) => [
          escape(t.paymentDetails?.orderId || t._id),
          escape(t.user?.name ?? "N/A"),
          escape(t.user?.email ?? "N/A"),
          escape(t.user?.mobile ?? "N/A"),
          escape(t.plan?.name ?? "N/A"),
          escape(t.paymentDetails?.amountPaid ?? t.plan?.price ?? 0),
          escape(t.paymentDetails?.method ?? "N/A"),
          escape(t.status),
          escape(t.startDate ? new Date(t.startDate).toLocaleDateString("en-IN") : "N/A"),
          escape(t.endDate ? new Date(t.endDate).toLocaleDateString("en-IN") : "N/A"),
          escape(t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "N/A"),
        ].join(",")),
      ].join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export Complete", description: `${allRows.length} transactions downloaded.` });
    }
    catch (err) {
      toast({ title: "Export Failed", description: "Could not generate CSV.", variant: "destructive" });
    }
    finally {
      setExportLoading(false);
    }
  };
  const stats = {
    total:       txStats?.total        ?? 0,
    completed:   txStats?.active       ?? 0,
    pending:     txStats?.pending      ?? 0,
    failed:      txStats?.failed       ?? 0,
    totalAmount: txStats?.totalAmount  ?? 0,
  };
  return (<PermissionGate module="revenue" action="read" fallback={<Unauthorized />}>
    <div className="space-y-6">
      <AdminPageHeader
        leading={(<Button variant="ghost" size="sm" className="gap-2 shrink-0" asChild>
          <Link href="/admin/revenue">
            <ArrowLeft className="h-4 w-4" />
            Back to Revenue
          </Link>
        </Button>)}
        title="Transactions"
        description="Search, filter, and export payment history"
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalAmount)}</p>
          </CardContent>
        </Card>
      </div>


      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={exportLoading}>
            <Download className="h-4 w-4" />
            {exportLoading ? "Exporting..." : "Export"}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by broker name..." value={searchInput} onChange={handleSearchChange} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={withResetPage(setFilterStatus)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs sm:text-sm">Transaction ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">Broker</TableHead>
                  <TableHead className="text-xs sm:text-sm">Plan</TableHead>
                  <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (<TableRow><TableCell colSpan={6} className="h-24 text-center">Loading transactions...</TableCell></TableRow>) : transactions.length === 0 ? (<TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>) : (transactions.map((transaction) => (<TableRow key={transaction._id} className="hover:bg-muted/30">
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs">{transaction.paymentDetails?.orderId?.slice(0, 10).toUpperCase() || transaction._id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{transaction.user.name}</TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Badge variant="outline" className="text-xs">{transaction.plan.name}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                    {formatCurrency(transaction.paymentDetails?.amountPaid ?? transaction.plan.price ?? 0)}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                    {new Date(transaction.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Badge variant={transaction.status === "Active"
                      ? "default"
                      : transaction.status === "Pending"
                        ? "secondary"
                        : "destructive"} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>)))}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (<ServerPagination className="mt-4" currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} itemsPerPage={pagination.limit} onPageChange={setCurrentPage} countSuffix=" entries" />)}
        </CardContent>
      </Card>
    </div>
  </PermissionGate>);
}
