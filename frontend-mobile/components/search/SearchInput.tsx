import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SearchSuggestion } from "@/features/property/services/propertyService";

const styles = StyleSheet.create({
  root: { position: "relative", zIndex: 999 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    height: 48,
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    // height: "100%" causes a TS/layout warning on some RN versions; use flex instead
  },
  separator: { width: 1.5, height: 20, backgroundColor: "#E2E8F0", marginHorizontal: 8 },
  filterBtn: { position: "relative" },
  badgeWrap: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "white",
  },
  badgeText: { color: "white", fontSize: 8, fontWeight: "900", lineHeight: 11 },
});

export function SearchInput({
  value,
  onChange,
  onSuggestionSelect,
  isSearching,
  colors,
  onFocusChange,
  onFilterPress,
  activeFiltersCount = 0,
}: {
  value: string;
  onChange: (t: string) => void;
  onSuggestionSelect: (item: SearchSuggestion) => void;
  isSearching: boolean;
  colors: any;
  onFocusChange?: (focused: boolean) => void;
  onFilterPress?: () => void;
  activeFiltersCount?: number;
}) {
  const [focused, setFocused] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showDrop = focused && value.trim().length > 0;

  useEffect(() => {
    onFocusChange?.(showDrop);
  }, [showDrop, onFocusChange]);

  // Clean up blur timer on unmount to prevent setState on unmounted component.
  useEffect(() => {
    return () => {
      if (blurTimerRef.current !== null) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  const handleFocus = useCallback(() => {
    if (blurTimerRef.current !== null) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => {
      blurTimerRef.current = null;
      setFocused(false);
    }, 200);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search by locality, project, property..."
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          style={styles.textInput}
        />
        {isSearching && (
          <ActivityIndicator size="small" color={colors?.primary || "#F97316"} style={{ marginRight: 8 }} />
        )}
        {onFilterPress && (
          <>
            <View style={styles.separator} />
            <TouchableOpacity onPress={onFilterPress} activeOpacity={0.7} style={styles.filterBtn}>
              <Ionicons name="options-outline" size={18} color="#94A3B8" />
              {activeFiltersCount > 0 && (
                <View style={styles.badgeWrap}>
                  <Text style={styles.badgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
