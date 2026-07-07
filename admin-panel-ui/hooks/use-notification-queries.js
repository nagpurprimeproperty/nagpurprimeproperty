"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification.api";
const NOTIFICATION_KEY = "notifications";
const NOTIFICATION_STATS_KEY = "notification-stats";
export function useNotifications(params = {}) {
    return useQuery({
        queryKey: [NOTIFICATION_KEY, params],
        queryFn: async () => {
            const res = await notificationApi.list(params);
            return res.data;
        },
        staleTime: 30000,
        placeholderData: (prev) => prev,
    });
}
export function useNotificationStats() {
    return useQuery({
        queryKey: [NOTIFICATION_STATS_KEY],
        queryFn: async () => {
            const res = await notificationApi.getStats();
            return res.data;
        },
        staleTime: 60000,
        placeholderData: (prev) => prev,
    });
}
export function useCreateNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_KEY] });
            qc.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
        },
    });
}
export function useUpdateNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => notificationApi.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_KEY] });
            qc.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
        },
    });
}
export function useDeleteNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.delete,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_KEY] });
            qc.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
        },
    });
}
export function useMarkAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_KEY] });
            qc.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
        },
    });
}
export function useMarkAllAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_KEY] });
            qc.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
        },
    });
}
export function useSendPush() {
    return useMutation({
        mutationFn: notificationApi.sendPush,
    });
}
// ── User notifications ─────────────────────────────────────────────
const USER_NOTIFICATION_KEY = "user-notifications";
const USER_NOTIFICATION_STATS_KEY = "user-notification-stats";
export function useUserNotifications(params = {}) {
    return useQuery({
        queryKey: [USER_NOTIFICATION_KEY, params],
        queryFn: async () => {
            const res = await notificationApi.userList(params);
            return res.data;
        },
        staleTime: 30000,
        placeholderData: (prev) => prev,
    });
}
export function useUserNotificationStats() {
    return useQuery({
        queryKey: [USER_NOTIFICATION_STATS_KEY],
        queryFn: async () => {
            const res = await notificationApi.userGetStats();
            return res.data;
        },
        staleTime: 60000,
        placeholderData: (prev) => prev,
    });
}
export function useMarkUserNotificationAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.userMarkAsRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [USER_NOTIFICATION_KEY] });
            qc.invalidateQueries({ queryKey: [USER_NOTIFICATION_STATS_KEY] });
        },
    });
}
