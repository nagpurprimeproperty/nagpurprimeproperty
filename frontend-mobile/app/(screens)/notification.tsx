import React, { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import {
  Bell,
  Users,
  Home,
  TrendingDown,
  BellOff,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenHeader from "@/components/common/ScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import SectionDivider from "@/components/common/SectionDivider";
import {
  useNotifications,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "@/hooks/useNotification";
import colors from "@/theme/colors";
import { usePagination } from "@/hooks/usePagination";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import NotificationSkeleton from "@/components/skeleton/NotificationSkeleton";

type NotificationItem = {
  id: string;
  title: string;
  desc: string;
  date: string;
  type: "enquiry" | "listing" | "price" | "system";
  unread: boolean;
};

const getNotificationType = (type: string): NotificationItem["type"] => {
  switch (type?.toLowerCase()) {
    case "enquiry":
      return "enquiry";
    case "listing":
      return "listing";
    case "price":
      return "price";
    case "info":
      return "system";
    default:
      return "system";
  }
};

const NotificationCard = React.memo(({
  item,
  onPress,
  index,
}: {
  item: NotificationItem;
  onPress: (id: string) => void;
  index: number;
}) => {
  const getIcon = () => {
    switch (item.type) {
      case "enquiry":
        return {
          icon: Users,
          bg: item.unread ? "bg-orange-50" : "bg-slate-100",
          color: item.unread ? colors.primary : "#94A3B8",
        };

      case "listing":
        return {
          icon: Home,
          bg: item.unread ? "bg-emerald-50" : "bg-slate-100",
          color: item.unread ? colors.success : "#94A3B8",
        };

      case "price":
        return {
          icon: TrendingDown,
          bg: item.unread ? "bg-orange-50" : "bg-slate-100",
          color: item.unread ? colors.primary : "#94A3B8",
        };

      default:
        return {
          icon: Bell,
          bg: "bg-slate-100",
          color: colors.textMuted,
        };
    }
  };

  const config = getIcon();
  const Icon = config.icon;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(220)}
      className="mb-3"
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (item.unread) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPress(item.id);
        }}
        style={{
          borderWidth: 1,
          borderColor: item.unread ? "#E5E7EB" : "#F1F5F9",
          backgroundColor: item.unread ? "#FFFFFF" : "#FAFAFA",
        }}
        className={`flex-row rounded-2xl overflow-hidden ${
          item.unread
            ? "border-l-[3px] border-l-orange-500"
            : "border-l-[3px] border-l-transparent"
        }`}
      >
        <View className="flex-row flex-1 p-4">
          <View
            className={`w-12 h-12 rounded-2xl items-center justify-center ${config.bg}`}
          >
            <Icon size={20} color={config.color} strokeWidth={2.4} />
          </View>

          <View className="flex-1 ml-3.5 min-w-0">
            <View className="flex-row items-start justify-between">
              <Text
                className={`text-[15px] flex-1 pr-2 tracking-tight ${
                  item.unread
                    ? "font-black text-slate-900"
                    : "font-semibold text-slate-600"
                }`}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {item.unread && (
                <View className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
              )}
            </View>

            <Text
              className={`text-[13px] mt-2 leading-6 ${
                item.unread
                  ? "text-slate-500 font-medium"
                  : "text-slate-400"
              }`}
              numberOfLines={3}
            >
              {item.desc}
            </Text>

            <Text
              className={`text-[11px] font-bold mt-3 ${
                item.unread ? "text-slate-400" : "text-slate-300"
              }`}
            >
              {item.date}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const { notifications, unreadCount, isLoading, isFetching, totalPages, isError, refetch, error } =
    useNotifications(page, 10);

  const {
    list: notificationsList,
    hasMore,
    isLoadingMore,
    initialLoading,
    refreshing,
    loadMore,
    handleRefresh,
  } = usePagination({
    data: notifications,
    totalPages,
    isLoading,
    isFetching,
    refetch,
    page,
    setPage,
  });

  const readMutation = useMarkNotificationAsReadMutation();
  const readAllMutation = useMarkAllNotificationsAsReadMutation();

  const list: NotificationItem[] = notificationsList.map((notification) => ({
    id: notification._id,
    title: notification.title,
    desc: notification.message,
    date: notification.createdAt,
    type: getNotificationType(notification.type),
    unread: !notification.isRead,
  }));

  const markAllRead = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    readAllMutation.mutate();
  };

  const markRead = useCallback((id: string) => {
    readMutation.mutate(id);
  }, [readMutation]);

  const renderListEmpty = () => {
    if (initialLoading) {
      return <NotificationSkeleton count={4} />;
    }

    if (isError) {
      return (
        <View className="items-center justify-center mt-24 px-8">
          <BellOff size={32} color={colors.textPlaceholder} />
          <Text className="text-slate-900 font-black text-lg mt-4">
            Could not load notifications
          </Text>
          <Text className="text-slate-400 text-center mt-2 font-medium leading-6">
            {error?.message ?? "Please try again."}
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center mt-24 px-8">
        <View className="w-20 h-20 bg-white rounded-3xl items-center justify-center border border-slate-100 mb-5">
          <BellOff size={32} color={colors.textPlaceholder} />
        </View>

        <Text className="text-slate-900 font-black text-xl tracking-tight">
          All caught up
        </Text>

        <Text className="text-slate-400 text-center mt-2 font-medium leading-6">
          You have no notifications right now.
        </Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item, index }: { item: NotificationItem; index: number }) => (
    <NotificationCard
      item={item}
      index={index}
      onPress={markRead}
    />
  ), [markRead]);

  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);

  const renderItemSeparator = useCallback(() => <View style={{ height: 4 }} />, []);

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Notifications"
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={markAllRead}
              className="py-1 px-1"
              disabled={readAllMutation.isPending}
            >
              <Text className="text-orange-500 font-bold text-[13px]">
                {readAllMutation.isPending ? "Updating…" : "Mark all read"}
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={list}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: insets.bottom + 40,
        }}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
        ListHeaderComponent={() => (
          <View className="mb-4">
            {unreadCount > 0 && (
              <View className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-5 border border-slate-100">
                <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                  <Bell
                    size={18}
                    color={colors.primary}
                    strokeWidth={2.5}
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-slate-900 font-black text-sm">
                    {unreadCount} unread notifications
                  </Text>

                  <Text className="text-slate-500 text-xs mt-1 leading-5">
                    Tap a notification to mark it as read.
                  </Text>
                </View>
              </View>
            )}

            <SectionDivider label="Recent Activity" />
          </View>
        )}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={() => (
          <View>
            {isLoadingMore && <NotificationSkeleton count={1} />}
            <LoadMoreButton
              onPress={loadMore}
              loading={isLoadingMore}
              hasMore={hasMore}
            />
          </View>
        )}
      />
    </ScreenWrapper>
  );
}