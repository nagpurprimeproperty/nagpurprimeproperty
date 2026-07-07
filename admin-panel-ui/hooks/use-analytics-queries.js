import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/analytics.api";
export const analyticsKeys = {
    all: ["analytics"],
    overview: () => [...analyticsKeys.all, "overview"],
    userActivity: (p) => [...analyticsKeys.all, "user-activity", p],
    subscriptionPlanDistribution: () => [...analyticsKeys.all, "subscription-plan-dist"],
    monthlyGrowth: () => [...analyticsKeys.all, "monthly-growth"],
    topBrokers: (n) => [...analyticsKeys.all, "top-brokers", n],
    propertiesByLocation: () => [...analyticsKeys.all, "properties-by-location"],
    propertyTypeDistribution: () => [...analyticsKeys.all, "property-type-dist"],
};
export function useAnalyticsOverview() {
    return useQuery({
        queryKey: analyticsKeys.overview(),
        queryFn: async () => (await analyticsApi.getOverview()).data,
        staleTime: 60000,
    });
}
export function useUserActivity(period) {
    return useQuery({
        queryKey: analyticsKeys.userActivity(period),
        queryFn: async () => (await analyticsApi.getUserActivity(period)).data,
        staleTime: 60000,
    });
}
export function useSubscriptionPlanDistribution() {
    return useQuery({
        queryKey: analyticsKeys.subscriptionPlanDistribution(),
        queryFn: async () => (await analyticsApi.getSubscriptionPlanDistribution()).data,
        staleTime: 120000,
    });
}
export function useMonthlyGrowth() {
    return useQuery({
        queryKey: analyticsKeys.monthlyGrowth(),
        queryFn: async () => (await analyticsApi.getMonthlyGrowth()).data,
        staleTime: 120000,
    });
}
export function useTopBrokers(limit = 5) {
    return useQuery({
        queryKey: analyticsKeys.topBrokers(limit),
        queryFn: async () => (await analyticsApi.getTopBrokers(limit)).data,
        staleTime: 120000,
    });
}
export function usePropertiesByLocation() {
    return useQuery({
        queryKey: analyticsKeys.propertiesByLocation(),
        queryFn: async () => (await analyticsApi.getPropertiesByLocation()).data,
        staleTime: 120000,
    });
}
export function usePropertyTypeDistribution() {
    return useQuery({
        queryKey: analyticsKeys.propertyTypeDistribution(),
        queryFn: async () => (await analyticsApi.getPropertyTypeDistribution()).data,
        staleTime: 120000,
    });
}
