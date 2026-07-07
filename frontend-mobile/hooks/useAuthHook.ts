import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  login,
  logout,
  verifyOTP,
  type LoginPayload,
  type LoginResponse,
  type LogoutResponse,
  type VerifyOtpPayload,
  type VerifyOtpResponse,
} from "@/services/authService";
import { getDevicePushToken } from "@/lib/pushNotifications";
import { initSocket, disconnectSocket } from "@/lib/socket";

export const useSendOtpMutation = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: login,
  });
};

export const useVerifyOtpMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<VerifyOtpResponse, Error, Omit<VerifyOtpPayload, "fcmToken">>({
    mutationFn: async (variables) => {
      // Attempt to get FCM token (non-blocking — null if denied or unavailable)
      const fcmToken = await getDevicePushToken();
      return verifyOTP({ ...variables, fcmToken });
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
  });
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
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.setQueryData(["profile"], null);
    },
  });
};