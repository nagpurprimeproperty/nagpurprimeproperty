import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { userPlanApi } from "@/lib/api/user-plans.api";
export const userPlanKeys = {
    all: (userId) => ["user-plans", userId],
};
export function useUserPlans(userId) {
    return useQuery({
        queryKey: userPlanKeys.all(userId),
        queryFn: async () => {
            const res = await userPlanApi.list(userId);
            return res.data ?? [];
        },
        enabled: !!userId,
        staleTime: 30000,
        placeholderData: (prev) => prev,
    });
}
export function useCreateUserPlan(userId) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => userPlanApi.create(userId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userPlanKeys.all(userId) });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast({ title: "Plan assigned successfully" });
        },
        onError: (err) => toast({
            title: "Failed to assign plan",
            description: err?.message ?? "Something went wrong",
            variant: "destructive",
        }),
    });
}
export function useUpdateUserPlan(userId) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: ({ planId, payload }) => userPlanApi.update(userId, planId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userPlanKeys.all(userId) });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast({ title: "Plan updated successfully" });
        },
        onError: (err) => toast({
            title: "Failed to update plan",
            description: err?.message ?? "Something went wrong",
            variant: "destructive",
        }),
    });
}
export function useDeleteUserPlan(userId) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (planId) => userPlanApi.delete(userId, planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userPlanKeys.all(userId) });
            toast({ title: "Plan record deleted", variant: "destructive" });
        },
        onError: (err) => toast({
            title: "Failed to delete plan",
            description: err?.message ?? "Something went wrong",
            variant: "destructive",
        }),
    });
}
