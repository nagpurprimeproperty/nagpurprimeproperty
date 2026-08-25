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
import { subscriptionKeys } from "@/api/keys/subscriptionKeys";

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
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine() });
    },
  });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const useUpdateMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<PropertyDetailResponse, Error, { id: string; payload: Record<string, unknown> }>({
    mutationFn: ({ id, payload }) => updateMyProperty(id, payload),
    onSuccess: (data, variables) => {
      const { id } = variables;

      // 1. Invalidate owner-scoped caches (my listings list + my detail)
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.all });
      queryClient.invalidateQueries({ queryKey: myPropertyKeys.detail(id) });

      // 2. Invalidate public detail cache — this is what PropertyDetailsScreen
      //    reads via usePropertyDetail(id). Without this the page serves the
      //    old cached data for up to 1 minute even after a successful update.
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });

      // 3. Invalidate public browse lists so they also show updated data
      //    (e.g. title / price changes reflected in search results)
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });

      // 4. Optimistic: push fresh data into the public detail cache immediately
      //    so the detail page renders new values before the refetch resolves.
      if (data?.data) {
        queryClient.setQueryData(propertyKeys.detail(id), data);
      }
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
