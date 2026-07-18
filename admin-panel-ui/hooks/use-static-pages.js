/**
 * Static Pages Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { staticPagesApi, } from "@/lib/api/static-pages.api";
export const staticPageKeys = {
    all: ["static-pages"],
    page: (slug) => [...staticPageKeys.all, slug],
};
/** Fetch a single static page */
export function useStaticPage(slug) {
    return useQuery({
        queryKey: staticPageKeys.page(slug),
        queryFn: async () => {
            const res = await staticPagesApi.getPage(slug);
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}
/** Update a static page */
export function useUpdateStaticPage(slug) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => staticPagesApi.updatePage(slug, payload),
        onSuccess: (res) => {
            // Update the cache immediately
            queryClient.setQueryData(staticPageKeys.page(slug), res.data);
            toast({ title: "Page saved successfully" });
        },
        onError: (err) => {
            toast({
                title: "Save failed",
                description: err,
                variant: "destructive",
            });
        },
    });
}
