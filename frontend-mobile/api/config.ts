/**
 * api/config.ts
 *
 * Single source of truth for the API base URL.
 * Kept in its own file so it can be imported by both api/apiClient.ts
 * and lib/socket.ts without creating a circular dependency.
 *
 * Import chain before this file existed:
 *   apiClient → authStore → socket → apiClient  ← circular
 *
 * After:
 *   apiClient → config    (no cycle)
 *   socket    → config    (no cycle)
 */
import Constants from "expo-constants";

const expoExtra = (Constants.expoConfig as
  | { extra?: Record<string, string | undefined> }
  | undefined)?.extra;

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  expoExtra?.EXPO_PUBLIC_API_URL ||
  "https://api.nagpurprimeproperty.com/api/v1";
