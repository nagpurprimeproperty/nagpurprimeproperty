import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  getLeads,
  getLeadById,
  updateLeadStatus,
} from "@/services/leadService";
import type { LeadListResponse, LeadDetailResponse } from "@/services/leadService";

export const useLeads = (page = 1, limit = 10, enabled = true) => {
  return useApiQuery<LeadListResponse>(["leads", page, limit], "/leads", {
    params: { page, limit },
  }, enabled);
};

export const useLead = (id?: string, enabled = true) => {
  return useApiQuery<LeadDetailResponse>(
    ["lead", id],
    id ? `/leads/${id}` : "",
    undefined,
    enabled && Boolean(id),
  );
};

/**
 * Mutation that updates a lead's status and immediately refreshes:
 *  1. The individual lead detail query ["lead", id]
 *  2. The full leads list query ["leads", ...]
 *
 * Using refetchQueries (not just invalidateQueries) ensures the detail
 * screen reflects the new status right away, even if the query is
 * considered "inactive" at the moment the mutation resolves.
 */
export const useUpdateLeadStatusMutation = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { status: string }>({
    mutationFn: (payload) => {
      if (!id) return Promise.reject(new Error("Lead ID is required"));
      return updateLeadStatus(id, payload);
    },
    onSuccess: () => {
      // Immediately refetch the specific lead — forces detail page to update
      if (id) {
        queryClient.refetchQueries({
          queryKey: ["lead", id],
          exact: true,
        });
      }
      // Also invalidate the list so the status pill there is up to date
      queryClient.invalidateQueries({
        queryKey: ["leads"],
        exact: false,
      });
    },
  });
};
