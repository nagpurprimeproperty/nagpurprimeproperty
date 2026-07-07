import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { plansApi } from "@/lib/api/plans.api";
// ─── Query keys ───────────────────────────────────────────────────────────────
export const planKeys = {
    all: ["plans"],
    stats: () => [...planKeys.all, "stats"],
    list: (p) => [...planKeys.all, "list", p],
    detail: (id) => [...planKeys.all, "detail", id],
};
// ─── List ─────────────────────────────────────────────────────────────────────
export function usePlanList(params = {}) {
    return useQuery({
        queryKey: planKeys.list(params),
        queryFn: async () => {
            const res = await plansApi.list(params);
            return { data: res.data ?? [], pagination: res.pagination };
        },
        staleTime: 30000,
        placeholderData: (prev) => prev,
    });
}
// in hooks/use-plan-queries.ts — add this at the bottom
export function usePlanOptions() {
    return useQuery({
        queryKey: [...planKeys.all, "options"],
        queryFn: async () => {
            const res = await plansApi.list({ isActive: "true" });
            return res.data ?? [];
        },
        staleTime: 60000,
    });
}
// ─── Stats ────────────────────────────────────────────────────────────────────
export function usePlanStats() {
    return useQuery({
        queryKey: planKeys.stats(),
        queryFn: async () => (await plansApi.getStats()).data,
        staleTime: 60000,
    });
}
// ─── Single ───────────────────────────────────────────────────────────────────
export function usePlanDetail(id) {
    return useQuery({
        queryKey: planKeys.detail(id),
        queryFn: async () => (await plansApi.getOne(id)).data,
        enabled: !!id,
    });
}
// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreatePlan() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => plansApi.create(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
            toast({ title: "Plan created", description: `"${res.data.name}" is now live.` });
        },
        onError: (err) => toast({ title: "Failed to create", description: err?.message, variant: "destructive" }),
    });
}
// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdatePlan(id) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => plansApi.update(id, payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
            queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
            toast({ title: "Plan updated", description: `"${res.data.name}" saved.` });
        },
        onError: (err) => toast({ title: "Failed to update", description: err?.message, variant: "destructive" }),
    });
}
// ─── Toggle status ────────────────────────────────────────────────────────────
export function useTogglePlanStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (plan) => plansApi.toggleStatus(plan._id).then(r => ({ res: r, plan })),
        onSuccess: ({ res, plan }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
            toast({
                title: res.data.isActive
                    ? `"${plan.name}" activated`
                    : `"${plan.name}" deactivated`,
            });
        },
        onError: (err) => toast({ title: "Failed", description: err?.message, variant: "destructive" }),
    });
}
// ─── Delete ───────────────────────────────────────────────────────────────────
export function useDeletePlan() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (plan) => plansApi.delete(plan._id).then(() => plan),
        onSuccess: (plan) => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
            toast({ title: `"${plan.name}" deleted`, variant: "destructive" });
        },
        onError: (err) => toast({ title: "Deletion failed", description: err?.message, variant: "destructive" }),
    });
}
