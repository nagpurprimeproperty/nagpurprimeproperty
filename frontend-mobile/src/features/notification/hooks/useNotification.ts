import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type FetchNotificationsParams,
} from '@/features/notification/services/notificationService';
import { notificationKeys } from '@/features/notification/keys/notificationKeys';

export const useNotifications = (page = 1, limit = 10) => {
  const result = useQuery({
    // Key includes params so different pages cache separately,
    // but the base notificationKeys.all prefix lets setQueriesData find all of them
    queryKey: notificationKeys.list(page, limit),
    queryFn: () => getAllNotifications({ page, limit }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return {
    notifications: result.data?.data ?? [],
    unreadCount: result.data?.unreadCount ?? 0,
    total: result.data?.total ?? 0,
    totalPages: result.data?.totalPages ?? 1,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error as Error | null,
    refetch: result.refetch,
  };
};

export const useMarkNotificationAsReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    // Optimistically mark as read in cache immediately
    onMutate: async (notificationId: string) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const previous = qc.getQueriesData({ queryKey: notificationKeys.all });
      qc.setQueriesData(
        { queryKey: notificationKeys.all, exact: false },
        (old: any) => {
          if (!old?.data) return old;
          const wasUnread = old.data.find((n: any) => n._id === notificationId && !n.isRead);
          return {
            ...old,
            data: old.data.map((n: any) =>
              n._id === notificationId ? { ...n, isRead: true } : n
            ),
            unreadCount: wasUnread
              ? Math.max(0, (old.unreadCount ?? 1) - 1)
              : old.unreadCount,
          };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      // Roll back on failure
      context?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsAsReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const previous = qc.getQueriesData({ queryKey: notificationKeys.all });
      qc.setQueriesData(
        { queryKey: notificationKeys.all, exact: false },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((n: any) => ({ ...n, isRead: true })),
            unreadCount: 0,
          };
        }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.list(1, 10),
    queryFn: () => getAllNotifications({ page: 1, limit: 10 }),
    staleTime: 30_000,
    select: (data) => (data?.data || []).filter((n: any) => !n.isRead).length,
  });
};