import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore, type AuthUser } from "@/features/auth";
import { getProfile, updateProfile, type ProfileUpdatePayload } from "@/features/profile/services/profileService";
import { profileKeys } from "@/features/profile/keys/profileKeys";

export const useProfile = () => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  const query = useQuery<AuthUser | null, Error>({
    queryKey: profileKeys.all,
    queryFn: async () => {
      return getProfile();
    },
    enabled: isAuthenticated && Boolean(token),
  });

  const profile = query.data;

  useEffect(() => {
    if (profile) {
      updateUser(profile);
    }
  }, [profile, updateUser]);

  return {
    ...query,
    profile: profile ?? null,
  };
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<AuthUser | null, Error, ProfileUpdatePayload>({
    mutationFn: async (payload) => updateProfile(payload),
    onSuccess: (profile) => {
      if (profile) {
        updateUser(profile);
      }

      queryClient.setQueryData(profileKeys.all, profile);
    },
  });
};
