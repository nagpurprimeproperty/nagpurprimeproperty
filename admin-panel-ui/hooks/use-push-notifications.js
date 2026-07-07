"use client"

import { useEffect, useState, useCallback } from "react";
import { requestFcmToken, onForegroundMessage } from "@/lib/firebase-client";
import { useToast } from "@/hooks/use-toast";
export function usePushNotifications() {
    const { toast } = useToast();
    const [fcmToken, setFcmToken] = useState(null);
    const [permission, setPermission] = useState("default");
    const requestPermission = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window))
            return;
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === "granted") {
            try {
                const token = await requestFcmToken();
                if (token) {
                    setFcmToken(token);
                    // Optionally send token to your backend here
                    // await apiClient.post("/v1/admin/profile/fcm-token", { token })
                    toast({ title: "Push notifications enabled" });
                }
                else {
                    toast({ title: "Could not get push token", variant: "destructive" });
                }
            }
            catch (err) {
                console.error("requestFcmToken error:", err);
                toast({ title: "Could not get push token", variant: "destructive" });
            }
        }
        else {
            toast({ title: "Push permission denied", variant: "destructive" });
        }
    }, [toast]);
    // Initialize permission and token on mount
    useEffect(() => {
        if (typeof window === "undefined" || !("Notification" in window))
            return;
        setPermission(Notification.permission);
        if (Notification.permission === "granted") {
            requestFcmToken()
                .then((token) => {
                if (token)
                    setFcmToken(token);
            })
                .catch((err) => {
                console.error("requestFcmToken error:", err);
            });
        }
    }, []);
    // Listen for foreground messages
    useEffect(() => {
        if (typeof window === "undefined" || !("Notification" in window))
            return;
        const unsubscribe = onForegroundMessage((payload) => {
            toast({
                title: payload.notification?.title || "New notification",
                description: payload.notification?.body || "",
            });
        });
        return () => {
            if (typeof unsubscribe === "function")
                unsubscribe();
        };
    }, [toast]);
    return { fcmToken, permission, requestPermission };
}
