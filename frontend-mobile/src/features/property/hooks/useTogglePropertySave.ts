import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  togglePropertySave,
  type PropertyListResponse,
  type PropertyDetailResponse,
} from "@/features/property/services/propertyService";
import { propertyKeys } from "@/features/property/keys/propertyKeys";

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

      // 1. Optimistically toggle isSaved across all list queries
      queryClient.setQueriesData<PropertyListResponse>(
        { queryKey: propertyKeys.all },
        (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((item) => {
              const itemId = item._id || item.id;
              if (itemId === id) {
                return { ...item, isSaved: !item.isSaved };
              }
              return item;
            }),
          };
        }
      );

      // 2. Optimistically toggle isSaved on the property detail cache
      queryClient.setQueryData<PropertyDetailResponse>(
        propertyKeys.detail(id),
        (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: { ...old.data, isSaved: !old.data.isSaved },
          };
        }
      );

      // 3. Invalidate saved-properties queries so the saved tab stays fresh
      queryClient.invalidateQueries({
        queryKey: propertyKeys.saved(),
        exact: false,
      });
    },
  });
};
