import HomeSkeleton, { PropertyCardSkeleton } from "@/components/skeleton/HomeSkeleton";
import ScreenWrapper from "@/shared/components/ScreenWrapper";
import SectionDivider from "@/shared/components/SectionDivider";
import SectionHeader from "@/shared/components/SectionHeader";
import ByBudgetSection from "@/components/home/ByBudgetSection";
import TrendingLocalitiesSection from "@/components/home/TrendingLocalitiesSection";
import CategoryTabs from "@/components/home/CategoryTabs";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import Header from "@/components/home/Header";
import NearYouSection from "@/components/home/NearYouSection";
import RecommendedSection from "@/components/home/RecommendedSection";
import {
  PropertyCard,
  useProperties,
  useTogglePropertySave,
  useCreateCallEnquiry,
} from "@/features/property";
import { usePagination } from "@/shared/hooks/usePagination";
import { useLocalityStore } from "@/store/localityStore";
import { useAuthStore } from "@/features/auth";
import colors from "@/theme/colors";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState, useEffect, useMemo, memo, useRef } from "react";
import { FlatList, InteractionManager, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
const FlashListAny = FlashList as any;

const EMPTY_ARRAY: any[] = [];

export default function Home() {
  // ─── Read selected locality and hydration globally ─────────────────────────
  const selectedLocality = useLocalityStore((s) => s.selectedLocality);
  const selectedLatitude = useLocalityStore((s) => s.selectedLatitude);
  const selectedLongitude = useLocalityStore((s) => s.selectedLongitude);
  const isLocalityHydrated = useLocalityStore((s) => s.isHydrated);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);
  const isStoreHydrated = isLocalityHydrated && isAuthHydrated;

  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");

  const { mutate: toggleSave } = useTogglePropertySave();
  const { mutateAsync: createCall } = useCreateCallEnquiry();

  const CATEGORY_MAP = useMemo<Record<string, string>>(() => ({
    flat: "Flat/Apartment",
    villa: "Villa/Independent House",
    plot: "Residential Plot",
    commercial: "Office Space",
  }), []);

  const nearYouParams = useMemo(() => {
    const params: Record<string, unknown> = { limit: 8 };
    if (selectedLatitude && selectedLongitude) {
      params.latitude = selectedLatitude;
      params.longitude = selectedLongitude;
    } else if (selectedLocality) {
      params.locality = selectedLocality;
    }
    return params;
  }, [selectedLocality, selectedLatitude, selectedLongitude]);

  const feedParams = useMemo(() => {
    const params: Record<string, unknown> = {
      limit: 8,
      page,
      isRelevanceSorted: true,
    };
    if (selectedLatitude && selectedLongitude) {
      params.latitude = selectedLatitude;
      params.longitude = selectedLongitude;
    } else if (selectedLocality) {
      params.locality = selectedLocality;
    }
    if (activeCategory !== "all") {
      params.propertyType = CATEGORY_MAP[activeCategory];
    }
    return params;
  }, [selectedLocality, selectedLatitude, selectedLongitude, page, activeCategory, CATEGORY_MAP]);

  // ─── Main feed — filtered by locality when set ───────────────────────────────
  const {
    data: homeProperties = EMPTY_ARRAY,
    isLoading: homeLoading,
    isFetching: homeFetching,
    totalPages = 1,
    refetch: refetchHome,
    isFetched: homeFetched,
  } = useProperties(feedParams, isStoreHydrated);

  const [loadStage2, setLoadStage2] = useState(false);
  const [loadStage3, setLoadStage3] = useState(false);

  useEffect(() => {
    if (homeFetched) {
      setLoadStage2(true);
    }
  }, [homeFetched]);

  const shouldEnableStage2 = isStoreHydrated && (homeFetched || loadStage2);

  const handleScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 40 && !loadStage3) {
      setLoadStage3(true);
    }
  }, [loadStage3]);

  // ─── Featured & Recommended — always global, no locality filter ─────────────
  const {
    data: featuredProperties = EMPTY_ARRAY,
    isLoading: featuredLoading,
    refetch: refetchFeatured,
    isFetched: featuredFetched,
  } = useProperties({ featured: true, limit: 8 }, shouldEnableStage2);

  const {
    data: recommendedProperties = EMPTY_ARRAY,
    isLoading: recommendedLoading,
    refetch: refetchRecommended,
    isFetched: recommendedFetched,
  } = useProperties({ isRecommended: true, limit: 8 }, shouldEnableStage2);

  // ─── Near You — filtered by locality when set ────────────────────────────────
  const {
    data: nearYouProperties = EMPTY_ARRAY,
    isLoading: nearYouLoading,
    refetch: refetchNearYou,
    isFetched: nearYouFetched,
  } = useProperties(nearYouParams, shouldEnableStage2);

  const combinedRefetch = useCallback(async () => {
    const promises: Promise<any>[] = [refetchHome()];
    if (shouldEnableStage2) {
      promises.push(refetchFeatured(), refetchRecommended(), refetchNearYou());
    }
    await Promise.all(promises);
  }, [refetchHome, refetchFeatured, refetchRecommended, refetchNearYou, shouldEnableStage2]);

  const {
    list: homePropertiesList,
    hasMore,
    isLoadingMore: isLoadingNextPage,
    initialLoading: isLoadingFirstPage,
    refreshing,
    loadMore,
    handleRefresh: onRefresh,
  } = usePagination({
    data: homeProperties,
    totalPages,
    isLoading: homeLoading,
    isFetching: homeFetching,
    refetch: combinedRefetch,
    page,
    setPage,
    resetDeps: [selectedLocality, selectedLatitude, selectedLongitude, activeCategory],
  });

  const lengthsRef = useRef({
    featured: 0,
    recommended: 0,
    nearYou: 0,
    home: 0,
  });

  lengthsRef.current = {
    featured: featuredProperties.length,
    recommended: recommendedProperties.length,
    nearYou: nearYouProperties.length,
    home: homePropertiesList.length,
  };

  useFocusEffect(
    useCallback(() => {
      // Defer data fetching until AFTER the tab-switch animation completes.
      // This prevents JS-thread contention that causes stuttery transitions.
      const task = InteractionManager.runAfterInteractions(() => {
        const isLocalityHydrated = useLocalityStore.getState().isHydrated;
        const isAuthHydrated = useAuthStore.getState().isHydrated;
        if (!isLocalityHydrated || !isAuthHydrated) return;

        const { featured, recommended, nearYou, home } = lengthsRef.current;
        if (loadStage2) {
          if (featured === 0) refetchFeatured();
          if (recommended === 0) refetchRecommended();
          if (nearYou === 0) refetchNearYou();
        }
        if (home === 0) refetchHome();
      });
      return () => task.cancel();
    }, [refetchFeatured, refetchRecommended, refetchNearYou, refetchHome, loadStage2])
  );

  const user = useAuthStore((s) => s.user);

  const isLoading =
    !isStoreHydrated ||
    isLoadingFirstPage ||
    (shouldEnableStage2 && (!featuredFetched || !recommendedFetched || !nearYouFetched));

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.cardWrapper}>
        <PropertyCard
          item={item}
          onToggleSave={toggleSave}
          onCreateCallEnquiry={createCall}
        />
      </View>
    ),
    [toggleSave, createCall],
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => String(item._id ?? item.id ?? index),
    [],
  );

  // Memoize the ListHeaderComponent to prevent FlashList from unmounting and
  // remounting the entire HomeHeader (featured, recommended, near you) on every render.
  const listHeader = useMemo(() => (
    <HomeHeader
      featuredData={featuredProperties}
      recommendedData={recommendedProperties}
      nearYouData={nearYouProperties}
      selectedLocality={selectedLocality}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      loadStage3={loadStage3}
      onToggleSave={toggleSave}
      onCreateCallEnquiry={createCall}
    />
  ), [
    featuredProperties,
    recommendedProperties,
    nearYouProperties,
    selectedLocality,
    activeCategory,
    loadStage3,
    toggleSave,
    createCall,
  ]);

  return (
    <ScreenWrapper>
      <Header />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <FlashListAny
          data={homePropertiesList}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          estimatedItemSize={380}
          contentContainerStyle={styles.flatListContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={listHeader}
          renderItem={renderItem}
          ListFooterComponent={
            isLoadingNextPage ? (
              <View style={{ gap: 16, marginTop: 5 }}>
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </View>
            ) : hasMore ? (
              <View className="py-6 items-center">
                <TouchableOpacity
                  onPress={loadMore}
                  activeOpacity={0.8}
                  className="bg-orange-50 border border-orange-100 px-6 py-3.5 rounded-2xl flex-row items-center justify-center min-w-[180px]"
                >
                  <Text className="text-orange-500 font-black text-xs uppercase tracking-widest">
                    Load More
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flatListContent: { paddingBottom: 120 },
  sectionDivider: { paddingHorizontal: 12, marginTop: 24, marginBottom: 12 },
  cardWrapper: { paddingHorizontal: 12 },
});

const HomeHeader = memo(function HomeHeader({
  featuredData,
  recommendedData,
  nearYouData,
  selectedLocality,
  activeCategory,
  onCategoryChange,
  loadStage3,
  onToggleSave,
  onCreateCallEnquiry,
}: {
  featuredData: any[];
  recommendedData: any[];
  nearYouData: any[];
  selectedLocality: string | null;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  loadStage3: boolean;
  onToggleSave?: (id: string) => void;
  onCreateCallEnquiry?: (id: string) => Promise<any>;
}) {
  const fallbackRecommendedData =
    recommendedData.length > 0
      ? recommendedData
      : featuredData.length > 0
        ? featuredData
        : nearYouData;

  return (
    <View>
      <View className="mt-0 mb-2">
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      </View>

      {/* Featured Section */}
      {featuredData.length > 0 && <FeaturedCarousel data={featuredData} />}

      {/* Near You Section */}
      {nearYouData.length > 0 && (
        <NearYouSection
          data={nearYouData}
          locality={selectedLocality}
          onToggleSave={onToggleSave}
          onCreateCallEnquiry={onCreateCallEnquiry}
        />
      )}

      {/* Recommended Section */}
      {fallbackRecommendedData.length > 0 && (
        <RecommendedSection
          data={fallbackRecommendedData}
          onToggleSave={onToggleSave}
          onCreateCallEnquiry={onCreateCallEnquiry}
        />
      )}
      
      {loadStage3 && (
        <>
          <ByBudgetSection enabled={loadStage3} />
          <TrendingLocalitiesSection enabled={loadStage3} />
        </>
      )}
      
      <View style={styles.sectionDivider}>
        <SectionDivider
          label={
            selectedLocality
              ? `Listings in ${selectedLocality}`
              : "Verified Listings"
          }
        />
        <SectionHeader
          title={
            selectedLocality
              ? `${selectedLocality} Collection`
              : "Prime Collection"
          }
          subtitle={
            selectedLocality
              ? `Top properties in ${selectedLocality}`
              : "Handpicked properties for you"
          }
          onPressSeeAll={() => {
            router.push("/(tabs)/search");
          }}
        />
      </View>
    </View>
  );
});
