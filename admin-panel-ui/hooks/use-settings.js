/**
 * Settings Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { settingsApi } from "@/lib/api/settings.api";

export const settingsKeys = {
    all: ["settings"],
};

/** Fetch current platform settings */
export function useSettings() {
    return useQuery({
        queryKey: settingsKeys.all,
        queryFn: async () => {
            const res = await settingsApi.getSettings();
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

/** Update platform settings */
export function useUpdateSettings() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: (payload) => settingsApi.updateSettings(payload),
        onSuccess: (res) => {
            queryClient.setQueryData(settingsKeys.all, res.data);
            toast({ title: "Settings updated successfully" });
        },
        onError: (err) => {
            toast({
                title: "Failed to update settings",
                description: err?.message ?? "Something went wrong",
                variant: "destructive",
            });
        },
    });
}
