import { apiClient } from "@/api/apiClient";
import type { AuthUser } from "@/lib/authStorage";

export interface LoginPayload {
  mobile: string;
  name: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
  fcmToken?: string | null;
}

export interface AuthApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: AuthUser;
  token: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post<AuthApiResponse<string>>(
    "/auth/login",
    payload,
  );

  return response.data as LoginResponse;
};

export const verifyOTP = async (payload: VerifyOtpPayload) => {
  const response = await apiClient.post<AuthApiResponse<AuthUser> & { token: string }>(
    "/auth/verify-otp",
    payload,
  );

  return response.data as VerifyOtpResponse;
};

export const logout = async () => {
  const response = await apiClient.post<LogoutResponse>("/auth/logout");
  return response.data;
};