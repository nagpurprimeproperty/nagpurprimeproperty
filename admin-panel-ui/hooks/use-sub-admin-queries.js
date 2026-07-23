/**
 * Sub-Admin Query Hooks (TanStack Query)
 *
 * All server-state for sub-admins lives here.
 * Zustand (useSubAdminStore) is used only for UI state
 * (toggling spinner, cached pagination meta).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { subAdminApi } from "@/lib/api/sub-admin.api";
import { useSubAdminStore } from "@/lib/store/sub-admin-store";
// ─── Query key factory ─────────────────────────────────────────────────────────
export const subAdminKeys = {
    all: ['sub-admins'],
    stats: () => [...subAdminKeys.all, 'stats'],
    list: (params) => [...subAdminKeys.all, 'list', params],
    detail: (id) => [...subAdminKeys.all, id],
};
// ─── Paginated list ────────────────────────────────────────────────────────────
export function useSubAdminList(params) {
    const setPagination = useSubAdminStore((s) => s.setPagination);
    return useQuery({
        queryKey: subAdminKeys.list(params),
        queryFn: async () => {
            const res = await subAdminApi.list(params);
            // Sync pagination meta into Zustand for global access
            if (res.pagination) {
                setPagination(res.pagination);
            }
            return {
                data: res.data ?? [],
                pagination: res.pagination ?? {
                    total: (res.data ?? []).length,
                    page: params.page ?? 1,
                    limit: params.limit ?? 10,
                    totalPages: 1,
                },
            };
        },
        staleTime: 30000,
        // Keep previous data visible while fetching next page (no layout jump)
        placeholderData: (prev) => prev,
    });
}
// ─── Stats cards ───────────────────────────────────────────────────────────────
export function useSubAdminStats() {
    return useQuery({
        queryKey: subAdminKeys.stats(),
        queryFn: async () => {
            const res = await subAdminApi.getStats();
            return res.data;
        },
        staleTime: 60000,
    });
}
// ─── Single detail ─────────────────────────────────────────────────────────────
export function useSubAdminDetail(id) {
    return useQuery({
        queryKey: subAdminKeys.detail(id),
        queryFn: async () => {
            const res = await subAdminApi.getOne(id);
            return res.data;
        },
        enabled: !!id,
    });
}
// ─── Create ────────────────────────────────────────────────────────────────────
export function useCreateSubAdmin() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => subAdminApi.create(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: subAdminKeys.all });
            toast({
                title: 'Sub-admin created',
                description: `${res.data.firstName} ${res.data.lastName} has been added.`,
            });
        },
        onError: (err) => {
            toast({
                title: 'Creation failed',
                description: err,
                variant: 'destructive',
            });
        },
    });
}
// ─── Toggle status ─────────────────────────────────────────────────────────────
export function useToggleSubAdminStatus() {
    const queryClient = useQueryClient();
    const { setToggling } = useSubAdminStore();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (sa) => {
            setToggling(sa._id, true);
            const res = await subAdminApi.toggleStatus(sa._id);
            return { res, sa };
        },
        onSuccess: ({ res, sa }) => {
            setToggling(sa._id, false);
            queryClient.invalidateQueries({ queryKey: subAdminKeys.all });
            toast({
                title: res.data.isActive ? 'Sub-admin activated' : 'Sub-admin deactivated',
                description: `${sa.firstName} ${sa.lastName}`,
            });
        },
        onError: (err, sa) => {
            setToggling(sa._id, false);
            toast({
                title: 'Status update failed',
                description: err,
                variant: 'destructive',
            });
        },
    });
}
// ─── Delete ────────────────────────────────────────────────────────────────────
export function useDeleteSubAdmin() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (sa) => subAdminApi.delete(sa._id).then(() => sa),
        onSuccess: (sa) => {
            queryClient.invalidateQueries({ queryKey: subAdminKeys.all });
            toast({
                title: 'Sub-admin deleted',
                description: `${sa.firstName} ${sa.lastName} has been removed.`,
                variant: 'destructive',
            });
        },
        onError: (err) => {
            toast({
                title: 'Deletion failed',
                description: err,
                variant: 'destructive',
            });
        },
    });
}
// ─── Update permissions ────────────────────────────────────────────────────────
export function useUpdatePermissions(subAdminId) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => subAdminApi.updatePermissions(subAdminId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subAdminKeys.detail(subAdminId) });
            queryClient.invalidateQueries({ queryKey: subAdminKeys.all });
        },
        onError: (err) => {
            toast({
                title: 'Save failed',
                description: err,
                variant: 'destructive',
            });
        },
    });
}
