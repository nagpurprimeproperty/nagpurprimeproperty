import { apiClient } from "@/api/apiClient";
import type { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

// NOTE: expo-print and expo-sharing are intentionally NOT imported here at the
// top level. They require native modules (ExpoPrint) that crash the JS module
// graph during Expo Router route discovery if required statically.
// They are dynamically imported inside downloadInvoicePdf() — only when called.

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
  gst?: number;
  duration: number;
  durationUnit: string;
  isDurationUnlimited: boolean;
  limits: PlanLimits;
  description: string;
  features: string[];
  appleProductId?: string;
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
  basePrice?: number;
  gstRate?: number;
  gstAmount?: number;
  totalAmount?: number;
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
  gstRate?: number;
  gstAmount?: number;
  totalAmount?: number;
  invoiceNumber?: string;
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
  gstRate?: number;
  gstAmount?: number;
  totalAmount?: number;
  invoiceNumber?: string;
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

export const activateIapPlan = async (
  planId: string,
  transactionId?: string,
  config?: AxiosRequestConfig
): Promise<MySubscriptionResponse> => {
  const res = await apiClient.post<MySubscriptionResponse>(
    `/subscriptions/purchase/activate-iap`,
    { planId, transactionId },
    config
  );
  return res.data;
};

export const getInvoiceDownloadUrl = (subscriptionId: string): string => {
  const baseURL = apiClient.defaults.baseURL || "";
  return `${baseURL}/subscriptions/purchase/${subscriptionId}/invoice`;
};

export const fetchInvoiceHtml = async (
  subscriptionId: string,
  config?: AxiosRequestConfig
): Promise<string> => {
  const res = await apiClient.get<string>(
    `/subscriptions/purchase/${subscriptionId}/invoice`,
    {
      responseType: "text",
      ...config,
    }
  );
  return res.data;
};

export const downloadInvoicePdf = async (subscriptionId: string): Promise<void> => {
  const html = await fetchInvoiceHtml(subscriptionId);
  if (!html) {
    throw new Error("Invoice content is empty");
  }

  // Dynamic imports — loaded only when this function is called, NOT at module
  // load time. This prevents "Cannot find native module 'ExpoPrint'" crashing
  // the app on startup before the native module is available.
  const [Print, Sharing] = await Promise.all([
    import("expo-print"),
    import("expo-sharing"),
  ]);

  if (Platform.OS === "web") {
    await Print.printAsync({ html });
  } else {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: "Download Tax Invoice",
      });
    } else {
      await Print.printAsync({ html });
    }
  }
};
