// lib/query-client.js
import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes — no refetch within this window
        staleTime: 5 * 60 * 1000,
        // Keep unused cached data for 10 minutes so navigating back doesn't re-fetch
        gcTime: 10 * 60 * 1000,
        // Don't refetch just because a component mounted (back-navigation is free)
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: reuse the same client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
