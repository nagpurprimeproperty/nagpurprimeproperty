"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAdminProfileStore } from "@/lib/store/admin-profile-store";
/** Decode a JWT and return its payload, or null if malformed. */
function decodeJwtPayload(token) {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url)
            return null;
        // Replace URL-safe chars and pad to a multiple of 4
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
/** Returns true when the JWT token is expired (or cannot be decoded). */
function isTokenExpired(token) {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number")
        return false; // no exp claim → treat as valid
    // exp is in seconds, Date.now() is ms
    return Date.now() >= payload.exp * 1000;
}
export function useAuthGuard() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const logout = useAuthStore((s) => s.logout);
    const profile = useAdminProfileStore((s) => s.profile);
    const fetchProfile = useAdminProfileStore((s) => s.fetchProfile);
    // Wait for the component to mount so Zustand persist has time to
    // rehydrate from localStorage before we make any auth decisions.
    const [hasMounted, setHasMounted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        setHasMounted(true);
    }, []);
    
    useEffect(() => {
        if (!hasMounted)
            return;
        const checkAuth = async () => {
            setIsLoading(true);
            // No token at All → go to login
            if (!token) {
                router.replace("/login");
                return;
            }
            // Token exists but is expired → clear it and go to login
            if (isTokenExpired(token)) {
                logout();
                router.replace("/login");
                return;
            }
            // Token looks valid → fetch profile if not already loaded
            if (!profile) {
                await fetchProfile();
            }
            setIsReady(true);
            setIsLoading(false);
        };
        checkAuth();
    }, [hasMounted, token]); // eslint-disable-line react-hooks/exhaustive-deps
    
    return { isReady, isLoading };
}
