import { categories } from "@/constants/mockData";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Listing-category chips shown in the same row after a divider
const LISTING_CATEGORIES = [
  { id: "Resale",  label: "Resale",       icon: "refresh-circle-outline" as const },
  { id: "Rental",  label: "Rental",        icon: "key-outline" as const },
  { id: "New",     label: "New Project",   icon: "sparkles-outline" as const },
];

type CategoryTabsProps = {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeListingCategory: string;
  onListingCategoryChange: (category: string) => void;
};

// Map icons for property-type chips
const ICON_MAP: Record<string, string> = {
  all: "grid-outline",
  plot: "crop-outline",
  flat: "business-outline",
  villa: "home-outline",
  commercial: "briefcase-outline",
};

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
  activeListingCategory,
  onListingCategoryChange,
}: CategoryTabsProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 6, paddingTop: 2, alignItems: "center" }}
      >
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          {/* — Property Type chips — */}
          {categories.map((item) => (
            <CategoryChip
              key={item.id}
              item={item}
              isActive={activeCategory === item.id}
              activeColor="#EA580C"
              iconName={ICON_MAP[item.id] || item.icon}
              onPress={() => onCategoryChange(item.id)}
            />
          ))}

          {/* — Thin vertical divider — */}
          <View style={{ width: 1.5, height: 24, backgroundColor: "#E2E8F0", marginHorizontal: 2 }} />

          {/* — Listing Category chips — */}
          {LISTING_CATEGORIES.map((item) => (
            <CategoryChip
              key={item.id}
              item={item}
              isActive={activeListingCategory === item.id}
              activeColor="#16A34A"
              iconName={item.icon}
              onPress={() => onListingCategoryChange(item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function CategoryChip({
  item,
  isActive,
  activeColor,
  iconName,
  onPress,
}: {
  item: { id: string; label: string };
  isActive: boolean;
  activeColor: string;
  iconName: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.92); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        animStyle,
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 10,
          backgroundColor: isActive ? activeColor : "white",
          borderWidth: 1.5,
          borderColor: isActive ? activeColor : "#E2E8F0",
          gap: 5,
        },
      ]}
    >
      <Ionicons
        name={iconName as any}
        size={13}
        color={isActive ? "white" : "#64748B"}
      />
      <Text
        style={{
          color: isActive ? "white" : "#64748B",
          fontWeight: "700",
          fontSize: 11,
        }}
      >
        {item.label}
      </Text>
    </AnimatedPressable>
  );
}