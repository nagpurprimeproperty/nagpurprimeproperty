import React, { useMemo, useCallback } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "@/hooks/useTheme";
import { SearchSuggestion } from "@/features/property/services/propertyService";
import { SearchInput } from "./SearchInput";

type SearchHeaderProps = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  priceSort: string;
  onSortChange: (sort: string) => void;
  onFilterPress: () => void;
  resultCount: number;
  /** True while the debounced query hasn't caught up to what the user typed */
  isSearching?: boolean;
  onSuggestionSelect: (item: SearchSuggestion) => void;
  onFocusChange?: (focused: boolean) => void;
  filters: {
    listingCategory: string;
    propertyType: string;
    bhk: string;
    budgetFrom: string;
    budgetTo: string;
    selectedAmenities: string[];
  };
  onFiltersChange: (f: any) => void;
};

const SearchHeaderBase = ({
  searchQuery,
  onSearchChange,
  priceSort,
  onSortChange,
  onFilterPress,
  resultCount,
  isSearching = false,
  onSuggestionSelect,
  onFocusChange,
  filters,
  onFiltersChange,
}: SearchHeaderProps) => {
  const { colors } = useTheme();

  const categories = useMemo(() => [
    { label: "All", value: "All", icon: "grid-outline" as const },
    { label: "Plot", value: "Plot", icon: "crop-outline" as const },
    { label: "Villa", value: "Villa", icon: "home-outline" as const },
    { label: "Flat", value: "Flat", icon: "business-outline" as const },
    { label: "Commercial", value: "Commercial", icon: "briefcase-outline" as const },
  ], []);

  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; clear: () => void }[] = [];

    // Locality / Search query
    if (searchQuery.trim()) {
      chips.push({
        id: "search",
        label: searchQuery.trim(),
        clear: () => onSearchChange(""),
      });
    }

    // Budget
    if (filters.budgetFrom || filters.budgetTo) {
      let label = "";
      const fromL = filters.budgetFrom ? Number(filters.budgetFrom) / 100000 : 0;
      const toL = filters.budgetTo ? Number(filters.budgetTo) / 100000 : 0;
      if (fromL && toL) {
        label = `₹${fromL}L - ₹${toL}L`;
      } else if (fromL) {
        label = `> ₹${fromL}L`;
      } else if (toL) {
        label = `Under ₹${toL}L`;
      }
      if (label) {
        chips.push({
          id: "budget",
          label,
          clear: () => onFiltersChange({ ...filters, budgetFrom: "", budgetTo: "" }),
        });
      }
    }

    // Listing Category
    if (filters.listingCategory && filters.listingCategory !== "All") {
      let label = filters.listingCategory;
      if (label === "New") label = "New Launch";
      chips.push({
        id: "listingCategory",
        label,
        clear: () => onFiltersChange({ ...filters, listingCategory: "All" }),
      });
    }

    // BHK
    if (filters.bhk && filters.bhk !== "Any") {
      chips.push({
        id: "bhk",
        label: filters.bhk,
        clear: () => onFiltersChange({ ...filters, bhk: "Any" }),
      });
    }

    // Amenities
    if (filters.selectedAmenities && filters.selectedAmenities.length > 0) {
      filters.selectedAmenities.forEach((amenity) => {
        chips.push({
          id: `amenity-${amenity}`,
          label: amenity,
          clear: () => onFiltersChange({
            ...filters,
            selectedAmenities: filters.selectedAmenities.filter((a) => a !== amenity),
          }),
        });
      });
    }

    return chips;
  }, [searchQuery, filters, onSearchChange, onFiltersChange]);

  const handleCategoryPress = useCallback((val: string) => {
    onFiltersChange({
      ...filters,
      propertyType: val,
    });
  }, [filters, onFiltersChange]);

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      listingCategory: "All",
      propertyType: "All",
      bhk: "Any",
      budgetFrom: "",
      budgetTo: "",
      selectedAmenities: [],
    });
    onSearchChange("");
    onSortChange("");
  }, [onFiltersChange, onSearchChange, onSortChange]);

  const handleSortCycle = useCallback(() => {
    if (priceSort === "") {
      onSortChange("low_to_high");
    } else if (priceSort === "low_to_high") {
      onSortChange("high_to_low");
    } else {
      onSortChange("");
    }
  }, [priceSort, onSortChange]);

  const sortLabel = useMemo(() => {
    if (priceSort === "low_to_high") return "Sorted by Price: Low ▾";
    if (priceSort === "high_to_low") return "Sorted by Price: High ▾";
    return "Sorted by Relevance ▾";
  }, [priceSort]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.listingCategory !== "All") count++;
    if (filters.propertyType !== "All") count++;
    if (filters.bhk !== "Any") count++;
    if (filters.budgetFrom || filters.budgetTo) count++;
    if (filters.selectedAmenities.length > 0) {
      count += filters.selectedAmenities.length;
    }
    return count;
  }, [filters]);

  return (
    <BlurView intensity={70} tint="light" style={styles.blurHeader}>
      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, paddingTop: 6 }}>
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          onSuggestionSelect={onSuggestionSelect}
          isSearching={isSearching}
          colors={colors}
          onFocusChange={onFocusChange}
          onFilterPress={onFilterPress}
          activeFiltersCount={activeFiltersCount}
        />
      </View>

      {/* Category Chips Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          {categories.map((cat) => {
            const isSelected = filters.propertyType === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => handleCategoryPress(cat.value)}
                activeOpacity={0.8}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? { backgroundColor: "#EA580C", borderColor: "#EA580C" }
                    : { backgroundColor: "white", borderColor: "#E2E8F0" },
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isSelected ? "white" : "#64748B"}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: isSelected ? "white" : "#64748B" },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Active Filters Chips Row */}
      {activeChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, alignItems: "center" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {activeChips.map((chip) => (
              <View key={chip.id} style={styles.activeChip}>
                <Text style={styles.activeChipText}>{chip.label}</Text>
                <TouchableOpacity onPress={chip.clear} style={{ marginLeft: 4 }}>
                  <Ionicons name="close" size={13} color="#F97316" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={handleClearAll} style={{ marginLeft: 6 }}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Result Stats, Sort & View Toggle Row */}
      <View style={styles.statsRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.resultCountText}>
            {resultCount} Properties Found
          </Text>
          <TouchableOpacity onPress={handleSortCycle} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sortText}>{sortLabel}</Text>
          </TouchableOpacity>
        </View>

        
      </View>

      {/* Glass bottom spacer */}
      <View style={{ height: 4 }} />
    </BlurView>
  );
};

export const SearchHeader = React.memo(SearchHeaderBase);

const styles = StyleSheet.create({
  blurHeader: {
    zIndex: 100,
    overflow: "visible",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeChipText: {
    color: "#F97316",
    fontSize: 11,
    fontWeight: "700",
  },
  clearAllText: {
    color: "#EA580C",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCountText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
  },
  sortText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  listViewActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FFEDD5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  listViewText: {
    color: "#EA580C",
    fontSize: 11,
    fontWeight: "900",
  },
});