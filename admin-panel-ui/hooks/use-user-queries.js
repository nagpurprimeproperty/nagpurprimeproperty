import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api/user.api";
import { useUserStore } from "@/lib/store/user-store";
// ─── Query key factory ────────────────────────────────────────────────────────
export const userKeys = {
    all: ["users"],
    stats: () => [...userKeys.all, "stats"],
    list: (p) => [...userKeys.all, "list", p],
    detail: (id) => [...userKeys.all, "detail", id],
    queries: (userId, page = 1, limit = 10) => [...userKeys.detail(userId), "queries", page, limit],
    leads: (userId, page = 1, limit = 10) => [...userKeys.detail(userId), "leads", page, limit],
    propLeadPlanQueryStats: (userId) => [...userKeys.detail(userId), "prop-lead-plan-query-stats"]
};
// ─── List (paginated, server-filtered) ───────────────────────────────────────
export function useUserList(params) {
    const setPagination = useUserStore((s) => s.setPagination);
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: async () => {
            const res = await userApi.list(params);
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
// ─── Stats ────────────────────────────────────────────────────────────────────
export function useUserStats() {
    return useQuery({
        queryKey: userKeys.stats(),
        queryFn: async () => {
            const res = await userApi.getStats();
            return res.data;
        },
        staleTime: 60000,
    });
}
// ─── Single user detail ───────────────────────────────────────────────────────
export function useUserDetail(id) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            const res = await userApi.getOne(id);
            return res.data;
        },
        enabled: !!id,
    });
}
// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => userApi.create(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({ title: "User created", description: `${res.data.name} has been added.` });
        },
        onError: (err) => {
            toast({
                title: "Creation failed",
                description: err?.message ?? "Something went wrong",
                variant: "destructive",
            });
        },
    });
}
// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateUser(id) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => userApi.update(id, payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
            toast({ title: "User updated", description: `${res.data.name} has been updated.` });
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
// ─── Toggle active / inactive ─────────────────────────────────────────────────
export function useToggleUserStatus() {
    const queryClient = useQueryClient();
    const { setToggling } = useUserStore();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (user) => {
            setToggling(user._id, true);
            const res = await userApi.toggleStatus(user._id);
            return { res, user };
        },
        onSuccess: ({ res, user }) => {
            setToggling(user._id, false);
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(user._id) });
            toast({
                title: res.data.isActive ? "User activated" : "User deactivated",
                description: user.name,
                variant: res.data.isActive ? "default" : "destructive",
            });
        },
        onError: (err, user) => {
            setToggling(user._id, false);
            toast({
                title: "Status update failed",
                description: err?.message ?? "Something went wrong",
                variant: "destructive",
            });
        },
    });
}
// ─── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (user) => userApi.delete(user._id).then(() => user),
        onSuccess: (user) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({
                title: "User deleted",
                description: `${user.name} has been removed.`,
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
export function usePropLeadPlanQueryStats(userId) {
    return useQuery({
        queryKey: userKeys.propLeadPlanQueryStats(userId),
        queryFn: async () => {
            const res = await userApi.propLeadPlanQueryStats(userId);
            return res.data ?? null;
        },
        enabled: !!userId,
        staleTime: 30000,
    });
}
// ─── User Queries (leads created BY user) ──────────────────────────────────────
export function useUserQueries(userId, page = 1, limit = 10) {
    return useQuery({
        queryKey: userKeys.queries(userId, page, limit),
        queryFn: async () => {
            const res = await userApi.getUserQueries(userId, page, limit);
            return {
                data: res.data ?? [],
                pagination: res.pagination ?? { total: 0, page, limit, totalPages: 1 },
            };
        },
        enabled: !!userId,
        staleTime: 30000,
    });
}
// ─── User Leads (leads received ON user's properties) ─────────────────────────
export function useUserLeads(userId, page = 1, limit = 10) {
    return useQuery({
        queryKey: userKeys.leads(userId, page, limit),
        queryFn: async () => {
            const res = await userApi.getUserLeads(userId, page, limit);
            return {
                data: res.data ?? [],
                pagination: res.pagination ?? { total: 0, page, limit, totalPages: 1 },
            };
        },
        enabled: !!userId,
        staleTime: 30000,
    });
}
