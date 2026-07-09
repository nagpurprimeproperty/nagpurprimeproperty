import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteMyProperty,
  toggleFeaturedMyProperty,
  createMyProperty,
  updateMyProperty,
  updateMyPropertyStatus,
  type PropertyDetailResponse,
} from "@/features/property/services/propertyService";
import { propertyKeys, myPropertyKeys } from "@/features/property/keys/propertyKeys";

// ─── Delete ───────────────────────────────────────────────────────────────────

export const useDeleteMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => deleteMyProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.all });
    },
  });
};

// ─── Feature toggle ───────────────────────────────────────────────────────────

export const useToggleFeaturedMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<PropertyDetailResponse, Error, string>({
    mutationFn: (id: string) => toggleFeaturedMyProperty(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.all });
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.detail(id) });
    },
  });
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const useCreateMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<PropertyDetailResponse, Error, Record<string, unknown>>({
    mutationFn: (payload) => createMyProperty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.all });
    },
  });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const useUpdateMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<PropertyDetailResponse, Error, { id: string; payload: Record<string, unknown> }>({
    mutationFn: ({ id, payload }) => updateMyProperty(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.all });
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.detail(variables.id) });
    },
  });
};

// ─── Status change ────────────────────────────────────────────────────────────

export const useUpdateMyPropertyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; data: unknown }, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) => updateMyPropertyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
};
