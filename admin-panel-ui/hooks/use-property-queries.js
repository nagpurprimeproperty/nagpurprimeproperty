import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { propertyApi } from "@/lib/api/property.api";
import { usePropertyStore } from "@/lib/store/property.store";
// ─── Query key factory ────────────────────────────────────────────────────────
export const propertyKeys = {
    all: ["properties"],
    stats: () => [...propertyKeys.all, "stats"],
    localities: (status = "Active") => [...propertyKeys.all, "localities", status],
    list: (p) => [...propertyKeys.all, "list", p],
    detail: (id) => [...propertyKeys.all, "detail", id],
};
// ─── List ─────────────────────────────────────────────────────────────────────
export function usePropertyList(params) {
    const setPagination = usePropertyStore((s) => s.setPagination);
    return useQuery({
        queryKey: propertyKeys.list(params),
        queryFn: async () => {
            const res = await propertyApi.list(params);
            const dataArr = res.data ?? [];
            const pagination = res.pagination
                ? res.pagination
                : {
                    total: dataArr.length,
                    page: params.page ?? 1,
                    limit: params.limit ?? 12,
                    totalPages: Math.ceil(dataArr.length / (params.limit ?? 12)) || 1,
                };
            setPagination(pagination);
            return { data: dataArr, pagination };
        },
        staleTime: 30000,
        placeholderData: (prev) => prev,
    });
}
// ─── Distinct localities (from active properties) ─────────────────────────────
export function usePropertyLocalities(status = "Active") {
    return useQuery({
        queryKey: propertyKeys.localities(status),
        queryFn: async () => (await propertyApi.getLocalities(status)).data ?? [],
        staleTime: 120000,
    });
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export function usePropertyStats() {
    return useQuery({
        queryKey: propertyKeys.stats(),
        queryFn: async () => (await propertyApi.getStats()).data,
        staleTime: 60000,
    });
}
// ─── Single detail ────────────────────────────────────────────────────────────
export function useProperty(id) {
    return useQuery({
        queryKey: propertyKeys.detail(id),
        queryFn: async () => (await propertyApi.getOne(id)).data,
        enabled: !!id,
    });
}
// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateProperty() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => propertyApi.create(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
            toast({ title: "Property created", description: `"${res.data.title}" has been added.` });
        },
        onError: (err) => toast({ title: "Creation failed", description: err, variant: "destructive" }),
    });
}
// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateProperty(id) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => propertyApi.update(id, payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
            queryClient.setQueryData(propertyKeys.detail(id), res.data);
            toast({ title: "Property updated", description: `"${res.data.title}" saved.` });
        },
        onError: (err) => toast({ title: "Update failed", description: err, variant: "destructive" }),
    });
}
// ─── Update Status ────────────────────────────────────────────────────────────
export function useUpdatePropertyStatus() {
    const queryClient = useQueryClient();
    const { setUpdating } = usePropertyStore();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ id, ...payload }) => {
            setUpdating(id, true);
            const res = await propertyApi.updateStatus(id, payload);
            return { res, id };
        },
        onSuccess: ({ res, id }) => {
            setUpdating(id, false);
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
            queryClient.setQueryData(propertyKeys.detail(id), res.data);
            toast({ title: `Status updated to "${res.data.status}"` });
        },
        onError: (err, { id }) => {
            setUpdating(id, false);
            toast({ title: "Status update failed", description: err, variant: "destructive" });
        },
    });
}
// ─── Toggle Featured ──────────────────────────────────────────────────────────
export function useToggleFeatured() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: ({ id, featured }) => propertyApi.toggleFeatured(id, featured),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
            queryClient.setQueryData(propertyKeys.detail(res.data._id), res.data);
            toast({
                title: res.data.featured ? "Marked as Featured" : "Removed from Featured",
            });
        },
        onError: (err) => toast({ title: "Failed", description: err, variant: "destructive" }),
    });
}
// ─── Remove Photos ────────────────────────────────────────────────────────────
export function useRemovePhotos(id) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (photoUrls) => propertyApi.removePhotos(id, photoUrls),
        onSuccess: (res) => {
            queryClient.setQueryData(propertyKeys.detail(id), res.data);
            toast({ title: "Photos removed" });
        },
        onError: (err) => toast({ title: "Failed to remove photos", description: err, variant: "destructive" }),
    });
}
// ─── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteProperty() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (property) => propertyApi.delete(property._id).then(() => property),
        onSuccess: (property) => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.all });
            toast({ title: "Property deleted", description: `"${property.title}" removed.`, variant: "destructive" });
        },
        onError: (err) => toast({ title: "Deletion failed", description: err, variant: "destructive" }),
    });
}
