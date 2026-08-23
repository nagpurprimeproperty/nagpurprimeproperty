import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  login,
  logout,
  resendOTP,
  verifyOTP,
  type LoginPayload,
  type LoginResponse,
  type LogoutResponse,
  type ResendOtpPayload,
  type ResendOtpResponse,
  type VerifyOtpPayload,
  type VerifyOtpResponse,
} from "@/features/auth/services/authService";
import { getPlatformPushTokens } from "@/lib/pushNotifications";
import { initSocket, disconnectSocket } from "@/config/socket";


export const useSendOtpMutation = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: login,
  });
};

export const useResendOtpMutation = () => {
  return useMutation<ResendOtpResponse, Error, ResendOtpPayload>({
    mutationFn: resendOTP,
  });
};

export const useVerifyOtpMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<VerifyOtpResponse, Error, Omit<VerifyOtpPayload, "fcmToken" | "appleToken">>(
    {
      mutationFn: async (variables) => {
        // Get the correct native push token for this platform (non-blocking).
        // Android → { fcmToken: "<FCM>",   appleToken: null }
        // iOS     → { fcmToken: null,       appleToken: "<APNS>" }
        const { fcmToken, appleToken } = await getPlatformPushTokens();
        return verifyOTP({ ...variables, fcmToken, appleToken });
      },
      onSuccess: (response, variables) => {
        setSession({
          token: response.token,
          phone: variables.mobile,
          user: response.data,
        });

        // Connect socket with the newly issued JWT
        if (response.token) {
          initSocket(response.token);
        }
      },
    }
  );
};

export const useLogoutMutation = () => {
  const logoutFromStore = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: async () => logout(),
    onSuccess: () => {
      // Disconnect socket before clearing store so auth token is still valid
      // during the logout API call
      disconnectSocket();
      logoutFromStore();
      queryClient.clear();
    },
  });
};