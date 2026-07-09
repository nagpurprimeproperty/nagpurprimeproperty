import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator, ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import ScreenWrapper    from "@/shared/components/ScreenWrapper";
import SectionDivider   from "@/shared/components/SectionDivider";
import {
  PropertyCard,
  useProperties,
  useSearchSuggestions,
  useTogglePropertySave,
  useCreateCallEnquiry,
  type SearchSuggestion,
} from "@/features/property";
import { FilterModal }  from "@/components/search/FilterModal";
import { usePagination } from "@/shared/hooks/usePagination";
import { SearchHeader } from "@/components/search/SearchHeader";
import { useAuthStore } from "@/features/auth";
import colors           from "@/theme/colors";
import ScreenHeader     from "@/shared/components/ScreenHeader";
import { useTheme }     from "@/hooks/useTheme";
import { useDebounce }  from "@/shared/hooks/useDebounce";
import SearchScreenSkeleton from "@/components/skeleton/SearchScreenSkeleton";
import Shimmer          from "@/shared/components/Shimmer";

// ── Type maps ─────────────────────────────────────────────────────────────────
const API_TO_CHIP: Record<string, string> = {
  "Flat/Apartment":         "Flat",
  "Villa/Independent House":"Villa",
  "Residential Plot":       "Plot",
  "Office Space":           "Commercial",
};
const CHIP_TO_API: Record<string, string> = {
  Flat:       "Flat/Apartment",
  Villa:      "Villa/Independent House",
  Plot:       "Residential Plot",
  Commercial: "Office Space",
};

// ── Inline suggestion dropdown ────────────────────────────────────────────────
function SuggestionDropdown({
  query,
  onSelect,
  colors,
  style,
}: {
  query: string;
  onSelect: (item: SearchSuggestion) => void;
  colors: any;
  style?: any;
}) {
  const { data, isLoading } = useSearchSuggestions(query, query.trim().length > 0);
  const suggestions = data?.data || [];
  const shimmer = ["#E2E8F0", "#F8FAFC", "#E2E8F0"] as [string, string, string];

  if (!query.trim() && suggestions.length === 0) return null;
  if (!isLoading && suggestions.length === 0) return null;

  const getIcon = (type: string) => {
    if (type === "property") return "home-outline";
    if (type === "locality") return "location-outline";
    if (type === "keyword")  return "time-outline";
    return "search-outline";
  };

  return (
    <View style={[
      dropStyle.container,
      { backgroundColor: colors.surface, borderColor: colors.border + "80" },
      style,
    ]}>
      {isLoading ? (
        [1, 2, 3].map((i) => (
          <View key={i} style={dropStyle.row}>
            <Shimmer shimmerColors={shimmer} style={{ width: 16, height: 16, borderRadius: 8 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Shimmer shimmerColors={shimmer} style={{ width: "60%", height: 13, borderRadius: 4, marginBottom: 6 }} />
              <Shimmer shimmerColors={shimmer} style={{ width: "40%", height: 10, borderRadius: 3 }} />
            </View>
          </View>
        ))
      ) : (
        <FlatList
          data={suggestions}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item, i) => `${item.type}-${item.title}-${i}`}
          style={{ maxHeight: 280 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
              style={[dropStyle.row, { borderBottomColor: colors.border + "30" }]}
            >
              <Ionicons
                name={getIcon(item.type) as any}
                size={16}
                color={item.type === "keyword" ? colors.textMuted : colors.primary}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 11, marginTop: 2, color: colors.textMuted }}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted + "60"} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const dropStyle = StyleSheet.create({
  container: {
    position: "absolute",
    top: 4,
    left: 12,
    right: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
});



// ── Main screen ───────────────────────────────────────────────────────────────
const SearchScreen = () => {
  const insets   = useSafeAreaInsets();
  const params   = useLocalSearchParams();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { colors: themeColors } = useTheme();

  const { mutate: toggleSave } = useTogglePropertySave();
  const { mutateAsync: createCall } = useCreateCallEnquiry();

  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [priceSort,      setPriceSort]      = useState("");
  const [page,           setPage]           = useState(1);
  const [filters, setFilters] = useState({
    listingCategory:   "All",
    propertyType:      "All",
    bhk:               "Any",
    budgetFrom:        "",
    budgetTo:          "",
    selectedAmenities: [] as string[],
  });

  const [headerHeight, setHeaderHeight] = useState(210);
  const headerHeightShared = useSharedValue(210);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedSuggestionsQuery = useDebounce(searchQuery, 300);
  const isAuthHydrated  = useAuthStore((s) => s.isHydrated);

  // ── Scroll Animation Values ──────────────────────────────────────────────────
  const lastScrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const insetsTop = insets?.top ?? 0;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const diff = currentY - lastScrollY.value;
      const hideOffset = -(headerHeightShared.value + insetsTop);

      if (currentY > 50) {
        if (diff > 10) {
          // Scrolling down: hide header
          headerTranslateY.value = withTiming(hideOffset, { duration: 250 });
        } else if (diff < -10) {
          // Scrolling up: show header
          headerTranslateY.value = withTiming(0, { duration: 250 });
        }
      } else {
        headerTranslateY.value = withTiming(0, { duration: 150 });
      }

      lastScrollY.value = currentY;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Apply navigation params (from home SearchBar or category cards)
  useEffect(() => {
    if (params.search !== undefined) setSearchQuery(String(params.search));

    setFilters((prev) => {
      const next = { ...prev };
      let changed = false;

      const trySet = (key: keyof typeof prev, val: string) => {
        if (val && val !== (prev[key] as string)) {
          (next as any)[key] = val;
          changed = true;
        }
      };

      if (params.listingCategory) {
        let v = String(params.listingCategory);
        if (v === "New Project") v = "New";
        trySet("listingCategory", v);
      }
      if (params.propertyType) {
        trySet("propertyType", API_TO_CHIP[String(params.propertyType)] ?? String(params.propertyType));
      }
      if (params.bhk) {
        const n = parseInt(String(params.bhk));
        if (!isNaN(n)) trySet("bhk", n >= 4 ? "4+ BHK" : `${n} BHK`);
      }
      if (params.budgetFrom) trySet("budgetFrom", String(params.budgetFrom));
      if (params.budgetTo)   trySet("budgetTo",   String(params.budgetTo));

      return changed ? next : prev;
    });
  }, [
    params.search,
    params.listingCategory,
    params.propertyType,
    params.bhk,
    params.budgetFrom,
    params.budgetTo,
  ]);



  const queryParams = useMemo(() => {
    const q: Record<string, any> = { limit: 20, page };

    if (debouncedSearch.trim()) q.search = debouncedSearch.trim();
    q.isRelevanceSorted = !priceSort;
    if (priceSort) q.priceSort = priceSort;

    if (filters.listingCategory !== "All")
      q.listingCategory = filters.listingCategory;

    if (filters.propertyType !== "All")
      q.propertyType = CHIP_TO_API[filters.propertyType] || filters.propertyType;

    if (filters.bhk !== "Any") {
      const n = parseInt(filters.bhk);
      if (!isNaN(n)) q.bhk = n;
    }

    if (filters.budgetFrom) q.budgetFrom = Number(filters.budgetFrom);
    if (filters.budgetTo)   q.budgetTo   = Number(filters.budgetTo);

    filters.selectedAmenities.forEach((a, i) => { q[`amenities[${i}]`] = a; });

    return q;
  }, [debouncedSearch, priceSort, filters, page]);

  const {
    data: properties = [],
    isLoading,
    isFetching,
    totalPages = 1,
  } = useProperties(queryParams, isAuthHydrated);

  const {
    list: propertiesList,
    hasMore,
    isLoadingMore: isLoadingNext,
    initialLoading,
    loadMore,
  } = usePagination({
    data: properties,
    totalPages,
    isLoading,
    isFetching,
    refetch: async () => {},
    page,
    setPage,
    resetDeps: [debouncedSearch, priceSort, filters],
  });

  // Suggestion selected — locality → text search, property → navigate
  const handleSuggestionSelect = useCallback((item: SearchSuggestion) => {
    if (item.type === "property" && item.propertyId) {
      router.push({ pathname: "/propertyDetail/[id]", params: { id: item.propertyId } });
      return;
    }
    // keyword or locality → just search by name
    setSearchQuery(item.title);
  }, []);

  const showSkeleton  = !isAuthHydrated || initialLoading;
  const isDebouncing  = searchQuery !== debouncedSearch;

  const snapPoints  = useMemo(() => ["90%"], []);
  const openFilters = useCallback(() => sheetRef.current?.present(), []);
  const closeFilters= useCallback(() => sheetRef.current?.dismiss(),  []);

  const handleApply = useCallback((f: typeof filters) => {
    setFilters(f);
    sheetRef.current?.dismiss();
  }, []);

  const handleClear = useCallback(() => {
    setFilters({ listingCategory: "All", propertyType: "All",
                 bhk: "Any", budgetFrom: "", budgetTo: "", selectedAmenities: [] });
    sheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback((p: any) => (
    <BottomSheetBackdrop {...p} disappearsAtIndex={-1} appearsAtIndex={0} opacity={0.6} />
  ), []);

  const renderItem = useCallback(({ item }: { item: any }) =>
    <PropertyCard
      item={item}
      variant="searchList"
      onToggleSave={toggleSave}
      onCreateCallEnquiry={createCall}
    />, [toggleSave, createCall]);

  const keyExtractor = useCallback(
    (item: any, index: number) => String(item._id ?? item.id ?? index),
    [],
  );

  return (
    <ScreenWrapper>
      {/* Absolute positioned animated header container */}
      <Animated.View 
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          if (height > 0) {
            setHeaderHeight(height);
            headerHeightShared.value = height;
          }
        }}
        style={[
          styles.headerContainer,
          { top: insets.top, backgroundColor: themeColors.surface },
          headerAnimatedStyle
        ]}
      >
        <ScreenHeader
          title="Search Properties"
          subtitle="Find the right place in Nagpur"
          showBack={true}
        />

        {/* Search header passes the suggestion handler down */}
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSuggestionSelect={handleSuggestionSelect}
          priceSort={priceSort}
          onSortChange={setPriceSort}
          onFilterPress={openFilters}
          resultCount={propertiesList.length}
          isSearching={isDebouncing || (isLoading && page === 1)}
          onFocusChange={setSearchFocused}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {searchFocused && (
          <SuggestionDropdown
            query={debouncedSuggestionsQuery}
            onSelect={handleSuggestionSelect}
            colors={themeColors}
            style={{ top: 110 }}
          />
        )}
      </Animated.View>

      <View style={{ flex: 1, position: "relative" }}>
        {showSkeleton ? (
          <ScrollView contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
            <SearchScreenSkeleton />
          </ScrollView>
        ) : propertiesList.length === 0 ? (
          <View style={[styles.empty, { paddingTop: headerHeight }]}>
            <Ionicons name="search-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySub}>
              Try different keywords or adjust your filters.
            </Text>
          </View>
        ) : (
          <AnimatedFlashList
            data={propertiesList}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            keyboardDismissMode="on-drag"
            keyExtractor={keyExtractor}
            removeClippedSubviews={true}
            estimatedItemSize={187}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingTop: headerHeight,
              paddingBottom: (insets?.bottom ?? 0) + 160,
            }}
            ListHeaderComponent={
              <View style={{ marginBottom: 16, marginTop: 8, marginLeft: 4 }}>
                <SectionDivider label="Verified Results" />
              </View>
            }
            renderItem={renderItem}
            ListFooterComponent={
              isLoadingNext ? <SearchScreenSkeleton count={2} /> :
              hasMore ? (
                <View style={styles.loadMoreWrap}>
                  <TouchableOpacity
                    onPress={loadMore}
                    style={styles.loadMoreBtn}
                  >
                    <Text style={styles.loadMoreTxt}>Load More</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        )}
      </View>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.primary, width: 40 }}
        backgroundStyle={{ borderRadius: 40, backgroundColor: colors.white }}
        enablePanDownToClose
      >
        <View style={{ flex: 1 }}>
          <FilterModal
            initialValues={filters}
            onApply={handleApply}
            onClear={handleClear}
            onClose={closeFilters}
          />
        </View>
      </BottomSheetModal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  empty:       { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 },
  emptyTitle:  { fontSize: 18, fontWeight: "900", color: "#0F172A", marginTop: 16 },
  emptySub:    { fontSize: 14, color: "#94A3B8", marginTop: 6,
                 textAlign: "center", paddingHorizontal: 32 },
  loadMoreWrap:{ paddingVertical: 24, alignItems: "center" },
  loadMoreBtn: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FFEDD5",
                 paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16,
                 minWidth: 180, alignItems: "center" },
  loadMoreTxt: { color: "#F97316", fontWeight: "900", fontSize: 12,
                 textTransform: "uppercase", letterSpacing: 1.5 },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});

export default SearchScreen;
