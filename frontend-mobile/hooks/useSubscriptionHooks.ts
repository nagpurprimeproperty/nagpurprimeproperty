import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPlans,
  getPlanById,
  purchasePlan,
  getMySubscription,
  getPurchaseHistory,
  getPurchaseById,
} from "@/services/subscriptionService";
import type {
  PlansResponse,
  PlanDetailResponse,
  PurchaseOrderResponse,
  MySubscriptionResponse,
  HistoryResponse,
  PurchaseDetailResponse,
} from "@/services/subscriptionService";
import { subscriptionKeys } from "@/api/keys/subscriptionKeys";

// ─── Plans ─────────────────────────────────────────────────────────────────────

export const usePlans = (enabled = true) => {
  return useQuery<PlansResponse, Error>({
    queryKey: subscriptionKeys.plans(),
    queryFn:  () => getPlans(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const usePlanDetail = (id?: string, enabled = true) => {
  return useQuery<PlanDetailResponse, Error>({
    queryKey: subscriptionKeys.plan(id),
    queryFn:  () => getPlanById(id!),
    staleTime: 5 * 60 * 1000,
    enabled:   enabled && Boolean(id),
  });
};

// ─── Purchase ──────────────────────────────────────────────────────────────────

export const usePurchasePlan = () => {
  const queryClient = useQueryClient();
  return useMutation<PurchaseOrderResponse, Error, string>({
    mutationFn: (planId) => purchasePlan(planId),
    onSuccess:  () => {
      // Refresh active plan and history after a purchase
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.history() });
    },
  });
};

// ─── Active subscription ───────────────────────────────────────────────────────

export const useMySubscription = (enabled = true) => {
  return useQuery<MySubscriptionResponse, Error>({
    queryKey:  subscriptionKeys.mine(),
    queryFn:   () => getMySubscription(),
    staleTime: 60 * 1000, // 1 min — active plan data can change
    enabled,
    retry: false, // 404 means no active plan, don't retry
  });
};

// ─── History ───────────────────────────────────────────────────────────────────

export const usePurchaseHistory = (page = 1, limit = 10, enabled = true) => {
  return useQuery<HistoryResponse, Error>({
    queryKey:  subscriptionKeys.historyPage(page, limit),
    queryFn:   () => getPurchaseHistory(page, limit),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const usePurchaseDetail = (id?: string, enabled = true) => {
  return useQuery<PurchaseDetailResponse, Error>({
    queryKey:  subscriptionKeys.purchase(id),
    queryFn:   () => getPurchaseById(id!),
    staleTime: 5 * 60 * 1000,
    enabled:   enabled && Boolean(id),
  });
};
