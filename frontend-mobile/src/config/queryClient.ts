import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 1, // 1 minute
      gcTime: 1000 * 60 * 2, // 2 minutes — mobile-optimised (covers back-nav within ~60s)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
