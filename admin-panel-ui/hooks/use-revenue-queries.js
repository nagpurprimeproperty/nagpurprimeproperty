import { useQuery } from "@tanstack/react-query";
import { revenueApi } from "@/lib/api/revenue.api";
export const revenueKeys = {
    all: ["revenue"],
    stats: () => [...revenueKeys.all, "stats"],
    monthly: () => [...revenueKeys.all, "monthly"],
    byPlan: () => [...revenueKeys.all, "by-plan"],
    planBreakdown: () => [...revenueKeys.all, "plan-breakdown"],
    transactionStats: () => [...revenueKeys.all, "transaction-stats"],
    transactions: (p) => [...revenueKeys.all, "transactions", p],
};
export function useRevenueStats() {
    return useQuery({
        queryKey: revenueKeys.stats(),
        queryFn: async () => (await revenueApi.getStats()).data,
        staleTime: 60000,
    });
}
export function useMonthlyRevenue() {
    return useQuery({
        queryKey: revenueKeys.monthly(),
        queryFn: async () => (await revenueApi.getMonthlyRevenue()).data,
        staleTime: 60000,
    });
}
export function useSubscriptionsByPlan() {
    return useQuery({
        queryKey: revenueKeys.byPlan(),
        queryFn: async () => (await revenueApi.getSubscriptionsByPlan()).data,
        staleTime: 60000,
    });
}
export function usePlanBreakdown() {
    return useQuery({
        queryKey: revenueKeys.planBreakdown(),
        queryFn: async () => (await revenueApi.getPlanBreakdown()).data,
        staleTime: 60000,
    });
}
export function useTransactionStats() {
    return useQuery({
        queryKey: revenueKeys.transactionStats(),
        queryFn: async () => (await revenueApi.getTransactionStats()).data,
        staleTime: 60000,
    });
}
export function useTransactions(params) {
    return useQuery({
        queryKey: revenueKeys.transactions(params),
        queryFn: async () => {
            const res = await revenueApi.getTransactions(params);
            return { data: res.data ?? [], pagination: res.pagination };
        },
        staleTime: 30000,
        placeholderData: (prev) => prev,
    });
}
