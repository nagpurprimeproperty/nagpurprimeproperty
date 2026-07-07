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

type CategoryTabsProps = {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

// Map icons to match search screen icons
const ICON_MAP: Record<string, string> = {
  all: "grid-outline",
  plot: "crop-outline",
  flat: "business-outline",
  villa: "home-outline",
  commercial: "briefcase-outline",
};

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(500).springify()}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          {categories.map((item) => {
            const isActive = activeCategory === item.id;

            return (
              <CategoryChip
                key={item.id}
                item={item}
                isActive={isActive}
                colors={colors}
                onPress={() => onCategoryChange(item.id)}
              />
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function CategoryChip({
  item,
  isActive,
  colors,
  onPress,
}: {
  item: { id: string; label: string; icon: string };
  isActive: boolean;
  colors: any;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconName = ICON_MAP[item.id] || item.icon;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        animStyle,
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: isActive ? "#EA580C" : "white",
          borderWidth: 1.5,
          borderColor: isActive ? "#EA580C" : "#E2E8F0",
          gap: 6,
        },
      ]}
    >
      <Ionicons
        name={iconName as any}
        size={14}
        color={isActive ? "white" : "#64748B"}
      />
      <Text
        style={{
          color: isActive ? "white" : "#64748B",
          fontWeight: "700",
          fontSize: 12,
        }}
      >
        {item.label}
      </Text>
    </AnimatedPressable>
  );
}