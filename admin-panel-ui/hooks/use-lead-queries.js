import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { leadApi } from "@/lib/api/lead.api";
import { useLeadStore } from "@/lib/store/lead-store";
// ─── Query key factory ────────────────────────────────────────────────────────
export const leadKeys = {
    all: ["leads"],
    stats: () => [...leadKeys.all, "stats"],
    filterOptions: () => [...leadKeys.all, "filter-options"],
    list: (p) => [...leadKeys.all, "list", p],
    detail: (id) => [...leadKeys.all, "detail", id],
};
// ─── List (paginated, server-filtered) ───────────────────────────────────────
export function useLeadList(params) {
    const setPagination = useLeadStore((s) => s.setPagination);
    return useQuery({
        queryKey: leadKeys.list(params),
        queryFn: async () => {
            const res = await leadApi.list(params);
            const pagination = res.pagination ?? {
                total: (res.data ?? []).length,
                page: params.page ?? 1,
                limit: params.limit ?? 10,
                totalPages: 1,
            };
            setPagination(pagination);
            return { data: res.data ?? [], pagination };
        },
        staleTime: 30000,
        placeholderData: (prev) => prev,
    });
}
// ─── Filter options (property types + localities from active properties) ──────
export function useLeadFilterOptions() {
    return useQuery({
        queryKey: leadKeys.filterOptions(),
        queryFn: async () => {
            const res = await leadApi.getFilterOptions();
            return res.data ?? { propertyTypes: [], localities: [] };
        },
        staleTime: 120000,
    });
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export function useLeadStats() {
    return useQuery({
        queryKey: leadKeys.stats(),
        queryFn: async () => {
            const res = await leadApi.getStats();
            return res.data;
        },
        staleTime: 60000,
    });
}
// ─── Single lead detail ───────────────────────────────────────────────────────
export function useLeadDetail(id) {
    return useQuery({
        queryKey: leadKeys.detail(id),
        queryFn: async () => {
            const res = await leadApi.getOne(id);
            return res.data;
        },
        enabled: !!id,
    });
}
// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateLead(id) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => leadApi.update(id, payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.all });
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            toast({ title: "Lead updated", description: `${res.data.customerName} has been updated.` });
        },
        onError: (err) => {
            toast({
                title: "Update failed",
                description: err?.message ?? "Something went wrong",
                variant: "destructive",
            });
        },
    });
}
// ─── Update status ────────────────────────────────────────────────────────────
export function useUpdateLeadStatus() {
    const queryClient = useQueryClient();
    const { setUpdating } = useLeadStore();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ lead, status }) => {
            setUpdating(lead._id, true);
            const res = await leadApi.updateStatus(lead._id, status);
            return { res, lead, status };
        },
        onSuccess: ({ res, lead }) => {
            setUpdating(lead._id, false);
            queryClient.invalidateQueries({ queryKey: leadKeys.all });
            toast({
                title: `Lead marked as ${res.data.status}`,
                description: lead.customerName,
            });
        },
        onError: (err, { lead }) => {
            setUpdating(lead._id, false);
            toast({
                title: "Status update failed",
                description: err?.message ?? "Something went wrong",
                variant: "destructive",
            });
        },
    });
}
// ─── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteLead() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (lead) => leadApi.delete(lead._id).then(() => lead),
        onSuccess: (lead) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.all });
            toast({
                title: "Lead deleted",
                description: `${lead.customerName} has been removed.`,
                variant: "destructive",
            });
        },
        onError: (err) => {
            toast({
                title: "Deletion failed",
                description: err?.message ?? "Something went wrong",
                variant: "destructive",
            });
        },
    });
}
