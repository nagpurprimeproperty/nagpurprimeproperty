import { Platform } from "react-native";
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "";

let isInitialized = false;

/**
 * Initialize RevenueCat SDK for iOS.
 */
export const initRevenueCat = async () => {
  if (Platform.OS !== "ios") return;
  if (isInitialized) return;

  if (!REVENUECAT_IOS_KEY) {
    console.warn("[RevenueCat] Missing EXPO_PUBLIC_REVENUECAT_IOS_KEY in environment");
    return;
  }

  try {
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    await Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
    isInitialized = true;
    console.log("[RevenueCat] Initialized successfully");
  } catch (err: any) {
    console.error("[RevenueCat] Initialization error:", err?.message || err);
  }
};

/**
 * Sync logged-in user ID with RevenueCat
 */
export const identifyUser = async (userId: string) => {
  if (Platform.OS !== "ios" || !isInitialized) return;
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (err: any) {
    console.error("[RevenueCat] Identify user error:", err?.message || err);
  }
};

/**
 * Log out user from RevenueCat
 */
export const resetUser = async () => {
  if (Platform.OS !== "ios" || !isInitialized) return;
  try {
    await Purchases.logOut();
  } catch (err: any) {
    console.error("[RevenueCat] Logout error:", err?.message || err);
  }
};

/**
 * Get current offerings configured in RevenueCat dashboard
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  if (Platform.OS !== "ios") return null;
  try {
    await initRevenueCat();
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current;
    }
    // Fallback: return any available offering in offerings.all
    const allOfferings = Object.values(offerings.all);
    if (allOfferings.length > 0 && allOfferings[0].availablePackages.length > 0) {
      return allOfferings[0];
    }
    return offerings.current || null;
  } catch (err: any) {
    console.error("[RevenueCat] Fetch offerings error:", err?.message || err);
    return null;
  }
};

/**
 * Purchase a specific package using Apple StoreKit via RevenueCat
 */
export const purchasePackage = async (
  pkg: PurchasesPackage
): Promise<CustomerInfo | null> => {
  if (Platform.OS !== "ios") return null;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (err: any) {
    if (err.userCancelled) {
      console.log("[RevenueCat] User cancelled purchase");
      return null;
    }
    throw err;
  }
};

/**
 * Purchase a product directly by Apple Product ID
 */
export const purchaseStoreKitProduct = async (
  productId: string
): Promise<CustomerInfo | null> => {
  if (Platform.OS !== "ios") return null;
  try {
    await initRevenueCat();
    const { customerInfo } = await Purchases.purchaseProduct(productId);
    return customerInfo;
  } catch (err: any) {
    if (err.userCancelled) {
      console.log("[RevenueCat] User cancelled purchase");
      return null;
    }
    throw err;
  }
};

/**
 * Restore previous Apple IAP purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (Platform.OS !== "ios") return null;
  try {
    await initRevenueCat();
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (err: any) {
    console.error("[RevenueCat] Restore purchases error:", err?.message || err);
    throw err;
  }
};
