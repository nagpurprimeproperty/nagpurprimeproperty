import { useApiQuery, useApiMutation } from "@/hooks/useApiQuery";
import {
  normalizePropertyDetail,
  normalizePropertyItem,
  createCallEnquiry,
  deleteMyProperty,
  updateMyPropertyStatus,
  toggleFeaturedMyProperty,
  createMyProperty,
  updateMyProperty,
  getSearchSuggestions,
  togglePropertySave,
  type SearchSuggestion,
  type CallEnquiryResponse,
  type PropertyApiDetail,
  type PropertyApiItem,
  type PropertyDetailResponse,
  type PropertyListResponse,
} from "@/services/propertyService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export const useProperties = (params?: Record<string, unknown>, enabled = true) => {
  const query = useApiQuery<PropertyListResponse>(
    ["properties", params],
    "/properties",
    { params },
    params !== undefined && enabled,
    { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  );

  const normalizedData = useMemo(() => {
    return (query.data?.data ?? []).map((item: PropertyApiItem) =>
      normalizePropertyItem(item),
    );
  }, [query.data]);

  return {
    ...query,
    data: normalizedData,
    total: query.data?.total,
    page: query.data?.page,
    limit: query.data?.limit,
    totalPages: query.data?.totalPages,
  };
};


export const usePropertyDetail = (id?: string, enabled = true) => {
  const query = useApiQuery<PropertyDetailResponse>(
    ["property", id],
    `/properties/${id}`,
    undefined,
    Boolean(id) && enabled,
    { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  );

  const property = useMemo(() => {
    if (!query.data?.data) return undefined;
    return normalizePropertyDetail(query.data.data);
  }, [query.data]);

  return {
    ...query,
    data: property,
  };
};

export const useSimilarProperties = (
  id?: string,
  params?: Record<string, unknown>,
  enabled = true,
) => {
  const query = useApiQuery<PropertyListResponse>(
    ["property", id, "similar-properties", params],
    `/properties/${id}/similar-properties`,
    { params },
    Boolean(id) && enabled,
    { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  );

  const normalizedData = useMemo(() => {
    return (query.data?.data ?? []).map((item: PropertyApiItem) =>
      normalizePropertyItem(item),
    );
  }, [query.data]);

  return {
    ...query,
    data: normalizedData,
  };
};

export const useTogglePropertySave = (hookId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, string | void>({
    mutationFn: async (mutateId) => {
      const id = hookId || mutateId;
      if (!id) throw new Error("Property ID is required");
      return togglePropertySave(id);
    },
    onSuccess: (data, mutateId) => {
      const id = hookId || mutateId;
      if (!id) return;
      // 1. Update the cache for all queries starting with ["properties"]
      queryClient.setQueriesData<PropertyListResponse>(
        { queryKey: ["properties"] },
        (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((item) => {
              const itemId = item._id || item.id;
              if (itemId === id) {
                return {
                  ...item,
                  isSaved: !item.isSaved,
                };
              }
              return item;
            }),
          };
        }
      );

      // 2. Update the cache for the specific property detail
      queryClient.setQueryData<PropertyDetailResponse>(
        ["property", id],
        (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isSaved: !old.data.isSaved,
            },
          };
        }
      );

      // 3. Invalidate the saved properties queries specifically to keep them fresh
      queryClient.invalidateQueries({
        queryKey: ["properties", { isSaved: true }],
        exact: false,
      });
    },
  });
};

export const useCreatePropertyEnquiry = (id?: string) => {
  return useApiMutation(
    `/properties/${id}/create-enquiry`,
    "post",
    [["property", id], ["enquiries"]],
  );
};

/**
 * Logs a call/WhatsApp enquiry for a property.
 * Returns broker details (including mobile) from the API response.
 */
export const useCreateCallEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation<CallEnquiryResponse, Error, string>({
    mutationFn: (propertyId: string) => createCallEnquiry(propertyId),
    onSuccess: (data, propertyId) => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
    },
  });
};

export const useMyProperties = (params?: Record<string, unknown>, enabled = true) => {
  const query = useApiQuery<PropertyListResponse>(
    ["myProperties", params],
    "/properties/me",
    { params },
    enabled,
  );

  const normalizedData = useMemo(() => {
    return (query.data?.data ?? []).map((item: PropertyApiItem) =>
      normalizePropertyItem(item),
    );
  }, [query.data]);

  return {
    ...query,
    data: normalizedData,
    total: query.data?.total,
    page: query.data?.page,
    limit: query.data?.limit,
    totalPages: query.data?.totalPages,
  };
};

export const useMyPropertyDetail = (id?: string, enabled = true) => {
  const query = useApiQuery<PropertyDetailResponse>(
    ["myProperty", id],
    `/properties/me/${id}`,
    undefined,
    Boolean(id) && enabled,
  );

  const property = useMemo(() => {
    if (!query.data?.data) return undefined;
    return normalizePropertyDetail(query.data.data);
  }, [query.data]);

  return {
    ...query,
    data: property,
  };
};

export const useDeleteMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => deleteMyProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
    },
  });
};

export const useToggleFeaturedMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<PropertyDetailResponse, Error, string>({
    mutationFn: (id: string) => toggleFeaturedMyProperty(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
      queryClient.invalidateQueries({ queryKey: ["myProperty", id] });
    },
  });
};

export const useCreateMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<PropertyDetailResponse, Error, Record<string, unknown>>({
    mutationFn: (payload) => createMyProperty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
    },
  });
};

export const useUpdateMyProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<PropertyDetailResponse, Error, { id: string; payload: Record<string, unknown> }>({
    mutationFn: ({ id, payload }) => updateMyProperty(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
      queryClient.invalidateQueries({ queryKey: ["myProperty", variables.id] });
    },
  });
};

export const useUpdateMyPropertyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; data: unknown }, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) => updateMyPropertyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProperties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useSearchSuggestions = (query: string, enabled = true) => {
  return useApiQuery<{ success: boolean; data: SearchSuggestion[] }>(
    ["searchSuggestions", query],
    "/properties/search/suggestions",
    { params: { query } },
    enabled,
    { staleTime: 10 * 60 * 1000, gcTime: 15 * 60 * 1000 }
  );
};
