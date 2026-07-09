import { apiClient } from "@/api/apiClient";

export type NotificationApiItem = {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
};

export type NotificationListResponse = {
  success: boolean;
  data: NotificationApiItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ReadNotificationResponse = {
  success: boolean;
  alreadyRead: boolean;
};

export type ReadAllNotificationsResponse = {
  success: boolean;
  modifiedCount: number;
};

export type FetchNotificationsParams = {
  page?: number;
  limit?: number;
};

export const getAllNotifications = async ({
  page = 1,
  limit = 10,
}: FetchNotificationsParams = {}) => {
  const response = await apiClient.get<NotificationListResponse>(
    "/notifications",
    {
      params: {
        page,
        limit,
      },
    },
  );

  return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await apiClient.patch<ReadNotificationResponse>(
    `/notifications/${notificationId}/read`,
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.patch<ReadAllNotificationsResponse>(
    "/notifications/read-all",
  );

  return response.data;
};

export type UnreadCountResponse = {
  success: boolean;
  count: number;
};

export const getUnreadNotificationCount = async () => {
  const response = await apiClient.get<UnreadCountResponse>(
    "/notifications/unread-count",
  );
  return response.data;
};