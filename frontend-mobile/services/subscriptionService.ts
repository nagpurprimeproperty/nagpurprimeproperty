import { apiClient } from "@/api/apiClient";
import type { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

// NOTE: expo-print and expo-sharing are intentionally NOT imported here at the
// top level. They require native modules (ExpoPrint) that crash the JS module
// graph during Expo Router route discovery if required statically.
// They are dynamically imported inside downloadInvoicePdf() — only when called.
//
// expo-file-system is a core Expo module (always available) so it IS safe to
// import statically. Dynamic import caused StorageAccessFramework === undefined
// due to Metro's CJS interop not always exposing named exports on the namespace.

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
  const Print = await import("expo-print");

  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  // Generate PDF to a temporary file first
  const { uri: tempUri } = await Print.printToFileAsync({ html });
  const fileName = `invoice_${subscriptionId}.pdf`;

  try {
    if (Platform.OS === "android") {
      // ── Android ──────────────────────────────────────────────────────────────
      // Use StorageAccessFramework to show the system "Save to folder" picker.
      // This is NOT a share sheet — it is the native Android file-save dialog.
      // We pre-seed it with the Downloads directory so the user only needs to
      // tap "Use this folder" to confirm saving there.
      //
      // FileSystem is imported statically at the top of this file — dynamic
      // import caused StorageAccessFramework === undefined due to Metro CJS interop.

      // Pre-open the picker at the device's primary Downloads directory.
      // The URI is the standard Android content URI for the Downloads tree;
      // requestDirectoryPermissionsAsync will silently ignore it on older APIs
      // and just show the root of the file manager instead.
      const DOWNLOADS_URI =
        "content://com.android.externalstorage.documents/tree/primary%3ADownload";

      const { granted, directoryUri } =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
          DOWNLOADS_URI
        );

      if (!granted) {
        // User cancelled the folder picker — treat as silent cancel (no error).
        return;
      }

      // Create the PDF file inside the chosen directory
      const destUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          fileName,
          "application/pdf"
        );

      // Read the temp PDF as base64 and write it to the destination
      const base64 = await FileSystem.readAsStringAsync(tempUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.writeAsStringAsync(destUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // ↑ File is now in the folder the user chose (typically Downloads) ✅
    } else {
      // ── iOS ──────────────────────────────────────────────────────────────────
      // iOS has no public "Downloads" folder accessible from JS.
      // The standard iOS approach is the share sheet with "Save to Files" —
      // this saves the PDF to the Files app (iCloud Drive / On My iPhone).
      const Sharing = await import("expo-sharing");
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempUri, {
          UTI: "com.adobe.pdf",
          mimeType: "application/pdf",
          dialogTitle: "Save Invoice",
        });
      } else {
        // Fallback: open the system print dialog so the user can still save
        await Print.printAsync({ html });
      }
    }
  } finally {
    // Always clean up the temp PDF regardless of success or failure
    try {
      await FileSystem.deleteAsync(tempUri, { idempotent: true });
    } catch {
      // Ignore cleanup errors — temp files are eventually evicted anyway
    }
  }
};
