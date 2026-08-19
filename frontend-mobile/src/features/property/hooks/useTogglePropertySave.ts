import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  togglePropertySave,
  type PropertyListResponse,
  type PropertyDetailResponse,
} from "@/features/property/services/propertyService";
import { propertyKeys } from "@/features/property/keys/propertyKeys";

type MutationContext = { id: string; wasSaved: boolean } | undefined;

export const useTogglePropertySave = (hookId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    string | void,
    MutationContext
  >({
    mutationFn: async (mutateId) => {
      const id = hookId || mutateId;
      if (!id) throw new Error("Property ID is required");
      return togglePropertySave(id as string);
    },

    // ── Capture current isSaved state BEFORE the API call ─────────────────
    // This lets us know if the user is saving (false→true) or unsaving (true→false).
    onMutate: async (mutateId) => {
      const id = (hookId || mutateId) as string;
      if (!id) return undefined;

      let wasSaved = false;

      // Check detail cache first (most accurate)
      const detail = queryClient.getQueryData<PropertyDetailResponse>(
        propertyKeys.detail(id)
      );
      if (detail?.data?.isSaved !== undefined) {
        wasSaved = !!detail.data.isSaved;
      } else {
        // Fall back to any list cache
        const allLists = queryClient.getQueriesData<PropertyListResponse>({
          queryKey: propertyKeys.lists(),
        });
        for (const [, listData] of allLists) {
          const item = listData?.data?.find(
            (i) => (i._id || i.id) === id
          );
          if (item) {
            wasSaved = !!item.isSaved;
            break;
          }
        }
      }

      return { id, wasSaved };
    },

    onSuccess: (_data, mutateId, context) => {
      const id = (hookId || mutateId) as string;
      if (!id) return;
      const wasSaved = context?.wasSaved ?? false;

      // ── 1. UNSAVING: immediately remove from saved-list cache ─────────────
      // Bug fix: old code only toggled isSaved:false but left the item in the
      // array — it never disappeared until a manual refresh.
      if (wasSaved) {
        queryClient.setQueriesData<PropertyListResponse>(
          { queryKey: propertyKeys.saved() }, // fixed key — now actually matches
          (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.filter((item) => (item._id || item.id) !== id),
            };
          }
        );
      }

      // ── 2. Toggle isSaved flag on ALL list queries (browse, search, etc.) ─
      // This keeps the heart icon in sync on other screens.
      queryClient.setQueriesData<PropertyListResponse>(
        { queryKey: propertyKeys.all },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((item) => {
              const itemId = item._id || item.id;
              if (itemId === id) return { ...item, isSaved: !wasSaved };
              return item;
            }),
          };
        }
      );

      // ── 3. Toggle isSaved on the property detail cache ─────────────────────
      queryClient.setQueryData<PropertyDetailResponse>(
        propertyKeys.detail(id),
        (old) => {
          if (!old?.data) return old;
          return { ...old, data: { ...old.data, isSaved: !wasSaved } };
        }
      );

      // ── 4. Background refetch to sync with server ──────────────────────────
      queryClient.invalidateQueries({
        queryKey: propertyKeys.saved(), // now correctly matches the list query key
        exact: false,
      });
    },

    // ── On error: refetch to restore the correct server state ─────────────
    onError: (_err, _mutateId, context) => {
      if (!context?.id) return;
      queryClient.invalidateQueries({
        queryKey: propertyKeys.lists(),
        exact: false,
      });
    },
  });
};
