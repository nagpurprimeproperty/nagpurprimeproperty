"use client"

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/store/query-client";
import { Toaster } from "@/components/ui/toaster";
/**
 * AppProvider wraps the admin area with:
 * - React Query (for any future queries)
 * - Toaster (toast notifications)
 *
 * Auth state lives in Zustand (useAuthStore) — no context provider needed.
 * Profile state lives in Zustand (useAdminProfileStore) — no context provider needed.
 */
export function AppProvider({ children }) {
    return (<QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
    </QueryClientProvider>);
}
