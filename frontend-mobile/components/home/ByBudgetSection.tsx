import { useTheme } from "@/hooks/useTheme";
import { useProperties } from "@/features/property/hooks/useProperties";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState, useEffect, useCallback } from "react";
import { Dimensions, ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import SectionDivider from "@/shared/components/SectionDivider";
import SectionHeader from "@/shared/components/SectionHeader";

const { width } = Dimensions.get("window");
const SIDE_PADDING = 12;
const CARD_WIDTH = width - SIDE_PADDING * 2;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

// ─── Animated Dot ────────────────────────────────────────────────────────────
function Dot({
  active,
  color,
  borderColor,
}: {
  active: boolean;
  color: string;
  borderColor: string;
}) {
  const widthVal = useSharedValue(active ? 24 : 8);
  const opacity = useSharedValue(active ? 1 : 0.4);

  useEffect(() => {
    widthVal.value = withTiming(active ? 24 : 8, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
    opacity.value = withTiming(active ? 1 : 0.4, { duration: 300 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: widthVal.value,
    height: 8,
    borderRadius: 4,
    backgroundColor: active ? color : borderColor,
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const budgetCardTemplates = [
  {
    id: 1,
    label: "STARTER HOMES & AFFORDABLE PLOTS",
    title: "Under ₹20 Lakh",
    minPrice: 0,
    maxPrice: 2000000,
    badgeText: "🔥 Popular",
    gradientColors: ["#FB923C", "#EA580C"], // orange to deep orange
    badgeColor: "#EA580C",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  },
  {
    id: 2,
    label: "2 BHK FLATS & APARTMENTS",
    title: "Under ₹50 Lakh",
    minPrice: 2000001,
    maxPrice: 5000000,
    badgeText: "⚡ Trending",
    gradientColors: ["#3B82F6", "#1D4ED8"], // blue to deep blue
    badgeColor: "#1D4ED8",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  },
  {
    id: 3,
    label: "SPACIOUS 3 BHK RESIDENCES",
    title: "Under ₹70 Lakh",
    minPrice: 5000001,
    maxPrice: 7000000,
    badgeText: "💎 Prime",
    gradientColors: ["#10B981", "#047857"], // emerald to green
    badgeColor: "#047857",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  },
  {
    id: 4,
    label: "LUXURY VILLAS & PENTHOUSES",
    title: "Under ₹1 Crore",
    minPrice: 7000001,
    maxPrice: 10000000,
    badgeText: "👑 Premium",
    gradientColors: ["#8B5CF6", "#6D28D9"], // purple to royal violet
    badgeColor: "#6D28D9",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  },
];

export default function ByBudgetSection({ enabled = true }: { enabled?: boolean }) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<ScrollView>(null);

  // Parallel React Query hooks to fetch live counts for each bracket
  const { total: total20 } = useProperties({ budgetTo: 2000000, limit: 1 }, enabled);
  const { total: total50 } = useProperties({ budgetFrom: 2000001, budgetTo: 5000000, limit: 1 }, enabled);
  const { total: total70 } = useProperties({ budgetFrom: 5000001, budgetTo: 7000000, limit: 1 }, enabled);
  const { total: total1cr } = useProperties({ budgetFrom: 7000001, budgetTo: 10000000, limit: 1 }, enabled);

  const counts: Record<number, number> = {
    1: total20 ?? 0,
    2: total50 ?? 0,
    3: total70 ?? 0,
    4: total1cr ?? 0,
  };

  const handleCardPress = useCallback((card: typeof budgetCardTemplates[0]) => {
    router.push({
      pathname: "/(tabs)/search",
      params: {
        budgetFrom: card.minPrice,
        budgetTo: card.maxPrice,
      },
    });
  }, []);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const i = Math.round(offsetX / SNAP_INTERVAL);
    setActiveIndex(Math.max(0, Math.min(i, budgetCardTemplates.length - 1)));
  };

  const renderItem = useCallback(({ item, index }: { item: typeof budgetCardTemplates[0]; index: number }) => {
    const count = counts[item.id] ?? 0;
    const countText = `${count} ${count === 1 ? "Property" : "Properties"} Available`;

    return (
      <AnimatedPressable
        key={item.id.toString()}
        onPress={() => handleCardPress(item)}
        entering={FadeInDown.delay(700 + index * 100).duration(400).springify()}
        style={{
          width: CARD_WIDTH,
          height: 175,
          marginRight: CARD_GAP,
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Base Gradient Background */}
        <LinearGradient
          colors={item.gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Blended Background Image */}
        <Image
          source={{ uri: item.image }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          contentPosition="right center"
        />

        {/* Horizontal Overlay to blend image seamlessly */}
        <LinearGradient
          colors={[
            item.gradientColors[0],          // Solid first color on the left
            item.gradientColors[0] + "F8",   // Mostly solid first color
            item.gradientColors[1] + "C0",   // Translucent second color in middle
            item.gradientColors[1] + "50",   // Transparent second color towards right
            "rgba(0, 0, 0, 0)",              // Completely transparent on right
          ] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top Right Popularity Status Badge */}
        <View
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            zIndex: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text
            style={{
              color: item.badgeColor,
              fontSize: 10,
              fontWeight: "900",
            }}
          >
            {item.badgeText}
          </Text>
        </View>

        {/* Content overlay */}
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            padding: 20,
            zIndex: 3,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "900",
                color: "rgba(255, 255, 255, 0.85)",
                letterSpacing: 1.2,
              }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: -0.5,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "rgba(255, 255, 255, 0.95)",
              }}
            >
              {countText}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: item.badgeColor,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                Explore Now
              </Text>
              <Text
                style={{
                  color: item.badgeColor,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                →
              </Text>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    );
  }, [counts, handleCardPress]);

  return (
    <Animated.View
      entering={FadeInDown.delay(600).duration(500).springify()}
      style={{ paddingHorizontal: 12, marginTop: 24 }}
    >
      <SectionDivider label="BY BUDGET" />
      <SectionHeader
        title="Properties that fit your pocket"
        subtitle="Hand-picked listings under popular price brackets."
      />

      <ScrollView
        ref={flatListRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: SIDE_PADDING - CARD_GAP,
          paddingVertical: 4,
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {budgetCardTemplates.map((item, index) => renderItem({ item, index }))}
      </ScrollView>

      {/* Pagination Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 14,
          gap: 6,
        }}
      >
        {budgetCardTemplates.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => {
              flatListRef.current?.scrollTo({
                x: i * SNAP_INTERVAL,
                animated: true,
              });
              setActiveIndex(i);
            }}
          >
            <Dot
              active={activeIndex === i}
              color={colors.primary}
              borderColor={colors.border}
            />
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}
