import { create, type AxiosRequestHeaders } from "axios";
import { useAuthStore } from "@/features/auth/store/authStore";
import { API_BASE_URL } from "@/api/config";

// Re-export so existing consumers that import API_BASE_URL from apiClient
// continue to work without changes.
export { API_BASE_URL } from "@/api/config";

if (__DEV__) {
  console.log("[apiClient] Using API_BASE_URL:", API_BASE_URL);
}

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }

  if (
    config.data &&
    (config.data instanceof FormData ||
      config.data.constructor?.name === "FormData" ||
      typeof config.data.append === "function")
  ) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
    if (config.headers.set) {
      config.headers.set("Content-Type", undefined);
    } else {
      (config.headers as any)["Content-Type"] = undefined;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Extract the server's human-readable message so catch blocks across
    // the app get the real reason (e.g. "OTP expired", "Invalid OTP") 
    // instead of Axios's generic "Request failed with status code 4xx".
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong. Please try again.";

    const rejectedError = new Error(serverMessage);
    if (error?.response) {
      (rejectedError as any).response = error.response;
    }

    return Promise.reject(rejectedError);
  },
);
