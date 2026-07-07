import { apiClient } from "@/api/apiClient";
import type { AxiosRequestConfig } from "axios";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PlanLimits {
  propertyUploads: number;
  isPropertyUploadUnlimited: boolean;
  featuredProperties: number;
  isFeaturedPropertiesUnlimited: boolean;
  leadAccessCount: number;
  isLeadAccessUnlimited: boolean;
  prioritySupport: boolean;
  analyticsAccess: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  isFree: boolean;
  price: number;
  duration: number;
  durationUnit: string;
  isDurationUnlimited: boolean;
  limits: PlanLimits;
  description: string;
  features: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlansResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlanDetailResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan;
}

export interface PurchaseOrder {
  free: boolean;
  paymentLinkId: string;
  paymentLinkUrl: string;
  amount: number;
  currency: string;
  keyId: string;
  subscriptionId: string;
  planName: string;
}

export interface PurchaseOrderResponse {
  success: boolean;
  message: string;
  data: PurchaseOrder;
}

export interface PaymentDetails {
  paymentLinkId?: string;
  paymentLinkUrl?: string;
  amountPaid: number;
  method?: string;
  paymentId?: string;
}

export interface UsageStats {
  propertiesPosted: number;
  leadsUnlocked: number;
  featuredPropertiesUsed: number;
}

export interface ActiveSubscription {
  _id: string;
  userId: string;
  planId: SubscriptionPlan;
  planName: string;
  startDate: string;
  endDate?: string;
  status: string;
  paymentDetails?: PaymentDetails;
  isFree: boolean;
  price: number;
  duration: number;
  durationUnit: string;
  isDurationUnlimited: boolean;
  limits: PlanLimits;
  usage: UsageStats;
  createdAt: string;
  updatedAt: string;
}

export interface MySubscriptionResponse {
  success: boolean;
  message: string;
  data: ActiveSubscription;
}

export interface HistoryItem {
  _id: string;
  userId: string;
  planId: { _id: string; name: string; price: number };
  planName: string;
  startDate?: string;
  endDate?: string;
  status: string;
  paymentDetails?: PaymentDetails;
  isFree: boolean;
  price: number;
  duration: number;
  durationUnit: string;
  isDurationUnlimited: boolean;
  limits: PlanLimits;
  usage: UsageStats;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  success: boolean;
  message: string;
  data: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseDetailResponse {
  success: boolean;
  data: ActiveSubscription;
}

// ─── API functions ──────────────────────────────────────────────────────────────

export const getPlans = async (config?: AxiosRequestConfig): Promise<PlansResponse> => {
  const res = await apiClient.get<PlansResponse>("/subscriptions", config);
  return res.data;
};

export const getPlanById = async (id: string, config?: AxiosRequestConfig): Promise<PlanDetailResponse> => {
  const res = await apiClient.get<PlanDetailResponse>(`/subscriptions/${id}`, config);
  return res.data;
};

export const purchasePlan = async (id: string, config?: AxiosRequestConfig): Promise<PurchaseOrderResponse> => {
  const res = await apiClient.post<PurchaseOrderResponse>(`/subscriptions/purchase/${id}`, {}, config);
  return res.data;
};

export const getMySubscription = async (config?: AxiosRequestConfig): Promise<MySubscriptionResponse> => {
  const res = await apiClient.get<MySubscriptionResponse>("/subscriptions/purchase/my", config);
  return res.data;
};

export const getPurchaseHistory = async (
  page = 1,
  limit = 10,
  config?: AxiosRequestConfig,
): Promise<HistoryResponse> => {
  const res = await apiClient.get<HistoryResponse>("/subscriptions/purchase/history", {
    params: { page, limit },
    ...config,
  });
  return res.data;
};

export const getPurchaseById = async (id: string, config?: AxiosRequestConfig): Promise<PurchaseDetailResponse> => {
  const res = await apiClient.get<PurchaseDetailResponse>(`/subscriptions/purchase/${id}`, config);
  return res.data;
};
