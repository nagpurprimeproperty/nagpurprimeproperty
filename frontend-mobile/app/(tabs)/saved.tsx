import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Heart, Layers, LogIn } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenHeader from "@/components/common/ScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import SectionDivider from "@/components/common/SectionDivider";
import PropertyCard from "@/components/property/PropertyCard";
import { useProperties, useTogglePropertySave, useCreateCallEnquiry } from "@/hooks/usePropertyHook";
import { useAuthStore } from "@/store/authStore";
import colors from "@/theme/colors";
import { usePagination } from "@/hooks/usePagination";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import PropertyCardSkeleton from "@/components/skeleton/PropertyCardSkeleton";

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const openAuth = useAuthStore((s) => s.openAuth);

  const [page, setPage] = useState(1);
  const { mutate: toggleSave } = useTogglePropertySave();
  const { mutateAsync: createCall } = useCreateCallEnquiry();
  const {
    data: savedProperties = [],
    isLoading,
    isFetching,
    refetch,
    totalPages = 1,
  } = useProperties(
    isAuthenticated ? { isSaved: true, limit: 10, page } : undefined,
    isHydrated,
  );

  const {
    list: savedList,
    hasMore,
    isLoadingMore,
    initialLoading,
    refreshing,
    loadMore,
    handleRefresh,
  } = usePagination({
    data: savedProperties,
    totalPages,
    isLoading,
    isFetching,
    refetch,
    page,
    setPage,
  });

  // Shared header used in every branch
  const header = (
    <ScreenHeader
      title="Saved Properties"
      subtitle="Collection"
      showBack={false}
      rightIcon={<Layers size={18} color={colors.primary} />}
    />
  );

  const renderItem = React.useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 120)).duration(200)}>
        <PropertyCard
          item={item}
          isLiked={true}
          onToggleSave={toggleSave}
          onCreateCallEnquiry={createCall}
        />
      </Animated.View>
    ),
    [toggleSave, createCall]
  );

  const keyExtractor = React.useCallback(
    (item: any, index: number) => (item.id || item._id || index).toString(),
    []
  );

  // ─── Hydration skeleton (auth store not ready yet) ─────────────────────────
  if (!isHydrated) {
    return (
      <ScreenWrapper>
        {header}
        <View style={{ paddingHorizontal: 12, paddingTop: 20 }}>
          <PropertyCardSkeleton count={3} />
        </View>
      </ScreenWrapper>
    );
  }

  // ─── Unauthenticated state ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <ScreenWrapper>
        {header}
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-24 h-24 rounded-[30px] bg-orange-50 border border-orange-100 items-center justify-center mb-6">
            <LogIn size={40} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text className="text-xl font-black text-slate-900 text-center tracking-tight">
            Sign in to view saves
          </Text>
          <Text className="text-sm font-medium text-slate-400 mt-2 text-center leading-5">
            Log in to see your saved properties and never lose track of your
            favourites.
          </Text>
          <TouchableOpacity
            onPress={() => openAuth("saveProperty")}
            className="mt-8 bg-orange-500 px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  // ─── Authenticated — show list or skeleton while loading ──────────────────

  return (
    <ScreenWrapper>
      {header}

      {/* Show skeleton while the first fetch is in-flight */}
      {initialLoading ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 20 }}>
          <PropertyCardSkeleton count={3} />
        </View>
      ) : (
        <FlatList
          data={savedList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          removeClippedSubviews={true}
          getItemLayout={(_: any, index: number) => ({
            length: 396,
            offset: 396 * index,
            index,
          })}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: (insets?.bottom ?? 0) + 100,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListHeaderComponent={() => (
            <View className="mb-5 mt-2 ml-1">
              <SectionDivider label="Saved Properties" />
            </View>
          )}
          ListFooterComponent={() => (
            <View>
              {isLoadingMore && <PropertyCardSkeleton count={1} />}
              <LoadMoreButton
                onPress={loadMore}
                loading={isLoadingMore}
                hasMore={hasMore}
              />
            </View>
          )}
          ListEmptyComponent={
            // Only shown after loading finishes and the list is genuinely empty
            <View className="items-center justify-center mt-32 px-10">
              <View className="w-24 h-24 rounded-[30px] bg-white border border-slate-100 items-center justify-center shadow-sm mb-6">
                <Heart
                  size={40}
                  color={colors.textPlaceholder}
                  strokeWidth={1.5}
                />
              </View>

              <Text className="text-xl font-black text-slate-900 text-center tracking-tight">
                Empty Collection
              </Text>

              <Text className="text-sm font-medium text-slate-400 mt-2 text-center leading-5">
                Tap the heart icon on properties to curate your personal dream
                list here.
              </Text>

              <TouchableOpacity
                onPress={() => router.replace("/")}
                className="mt-8 bg-orange-500 px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-black text-xs uppercase tracking-widest">
                  Start Exploring
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}
