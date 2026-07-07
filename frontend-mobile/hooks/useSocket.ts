import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import type { NotificationApiItem } from '@/services/notificationService';
import { useAuthStore } from '@/store/authStore';

const NOTIFICATIONS_KEY = ['notifications'];

/**
 * Subscribes to Socket.IO notification events and keeps the React Query
 * cache in sync. Attach this hook to your root layout once the user is authenticated.
 */
export const useSocket = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!token) return;

    // ── New notification received ────────────────────────────────────────────
    const onNotification = (notification: NotificationApiItem) => {
      if (!mountedRef.current) return;

      queryClient.setQueriesData(
        { queryKey: NOTIFICATIONS_KEY, exact: false },
        (old: any) => {
          if (!old) return old;
          const exists = old.data?.some((n: any) => n._id === notification._id);
          if (exists) return old;
          return {
            ...old,
            data: [{ ...notification, isRead: false }, ...(old.data || [])],
            total: (old.total ?? 0) + 1,
            unreadCount: (old.unreadCount ?? 0) + 1,
          };
        }
      );
    };

    // ── Unread count update ──────────────────────────────────────────────────
    const onNotificationCount = ({ count }: { count: number }) => {
      if (!mountedRef.current) return;

      queryClient.setQueriesData(
        { queryKey: NOTIFICATIONS_KEY, exact: false },
        (old: any) => (old ? { ...old, unreadCount: count } : old)
      );
    };

    // ── Notification marked as read ──────────────────────────────────────────
    const onNotificationRead = ({ notificationId }: { notificationId: string }) => {
      if (!mountedRef.current) return;

      queryClient.setQueriesData(
        { queryKey: NOTIFICATIONS_KEY, exact: false },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((n: NotificationApiItem) =>
              n._id === notificationId ? { ...n, isRead: true } : n
            ),
          };
        }
      );
    };

    let attachedSocket: ReturnType<typeof getSocket> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const attach = (socket: ReturnType<typeof getSocket>): boolean => {
      if (!socket) return false;
      if (__DEV__) {
        console.log('[useSocket] Attaching socket listeners.');
      }
      socket.on('notification', onNotification);
      socket.on('notification_count', onNotificationCount);
      socket.on('notification_read', onNotificationRead);
      attachedSocket = socket;
      return true;
    };

    const detach = () => {
      if (!attachedSocket) return;
      attachedSocket.off('notification', onNotification);
      attachedSocket.off('notification_count', onNotificationCount);
      attachedSocket.off('notification_read', onNotificationRead);
      attachedSocket = null;
    };

    if (!attach(getSocket())) {
      intervalId = setInterval(() => {
        const s = getSocket();
        if (s && attach(s)) {
          clearInterval(intervalId!);
          intervalId = null;
        }
      }, 300);
    }

    return () => {
      mountedRef.current = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      detach();
    };
  }, [token, queryClient]);
};
