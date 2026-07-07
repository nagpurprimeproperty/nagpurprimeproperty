import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SearchBar() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSearch = () => {
    inputRef.current?.blur();
    router.push({
      pathname: "/(tabs)/search",
      params: query.trim() ? { search: query.trim() } : {},
    });
    setQuery("");
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(500).springify()}
      style={{ paddingHorizontal: 12, marginTop: 16 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.border + "60",
        }}
      >
        <TouchableOpacity onPress={handleSearch} activeOpacity={0.7}>
          <Ionicons name="search" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="Search location, property type..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 14,
            color: colors.text,
            fontWeight: "500",
            paddingVertical: 6,
          }}
        />

        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}