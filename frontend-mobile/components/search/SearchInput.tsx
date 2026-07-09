import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SearchSuggestion } from "@/features/property/services/propertyService";

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
  const showDrop = focused && value.trim().length > 0;

  useEffect(() => {
    onFocusChange?.(showDrop);
  }, [showDrop, onFocusChange]);

  return (
    <View style={{ position: "relative", zIndex: 999 }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        height: 48,
      }}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search by locality, project, property..."
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 10,
            fontSize: 14,
            fontWeight: "500",
            color: "#0F172A",
            height: "100%",
          }}
        />
        {isSearching && (
          <ActivityIndicator size="small" color={colors?.primary || "#F97316"} style={{ marginRight: 8 }} />
        )}
        {onFilterPress && (
          <>
            <View style={{ width: 1.5, height: 20, backgroundColor: "#E2E8F0", marginHorizontal: 8 }} />
            <TouchableOpacity onPress={onFilterPress} activeOpacity={0.7} style={{ position: "relative" }}>
              <Ionicons name="options-outline" size={18} color="#94A3B8" />
              {activeFiltersCount > 0 && (
                <View style={{
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
                }}>
                  <Text style={{ color: "white", fontSize: 8, fontWeight: "900", lineHeight: 11 }}>
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
