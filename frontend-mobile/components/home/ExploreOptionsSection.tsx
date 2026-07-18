import { router } from "expo-router";
import { memo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Home, Key, TrendingUp, ArrowRight, BadgeCheck } from "lucide-react-native";
import SectionDivider from "@/shared/components/SectionDivider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 12;
const GAP = 10;
const SMALL_CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;

// ─── Config ───────────────────────────────────────────────────────────────────
const HERO_CARD = {
  id: "buy",
  eyebrow: "MOST POPULAR",
  title: "Buy Property",
  subtitle: "1000+ verified homes in Nagpur",
  cta: "Browse Listings",
  gradient: ["#7C3AED", "#4F46E5", "#312E81"] as [string, string, string],
  image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  Icon: Home,
  onPress: () => router.push("/(tabs)/search"),
};

const MINI_CARDS = [
  {
    id: "rent",
    eyebrow: "FREE",
    title: "Post Rental",
    cta: "List Now",
    gradient: ["#059669", "#10B981"] as [string, string],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
    Icon: Key,
    onPress: () => router.push("/(tabs)/addProperty"),
  },
  {
    id: "sell",
    eyebrow: "FREE",
    title: "Sell Fast",
    cta: "Post Ad",
    gradient: ["#EA580C", "#F97316"] as [string, string],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    Icon: TrendingUp,
    onPress: () => router.push("/(tabs)/addProperty"),
  },
];

// ─── Press scale hook ─────────────────────────────────────────────────────────
function usePressScale(toValue = 0.95) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  return { scale, onPressIn, onPressOut };
}

// ─── Hero Card ────────────────────────────────────────────────────────────────
const HeroCard = memo(function HeroCard() {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);
  const { Icon } = HERO_CARD;

  return (
    <Pressable
      onPress={HERO_CARD.onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={HERO_CARD.title}
    >
      <Animated.View style={[styles.heroCard, { transform: [{ scale }] }]}>
        {/* Background image */}
        <Image
          source={{ uri: HERO_CARD.image }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        {/* Rich gradient overlay — left-heavy so text stays readable */}
        <LinearGradient
          colors={HERO_CARD.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.88 }]}
        />

        {/* Bottom fade for text area */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top-left icon badge */}
        <View style={styles.heroIconBadge}>
          <Icon size={18} color="#FFFFFF" strokeWidth={2.2} />
        </View>

        {/* Top-right eyebrow pill */}
        <View style={styles.heroPill}>
          <BadgeCheck size={10} color="#7C3AED" strokeWidth={2.5} />
          <Text style={styles.heroPillText}>{HERO_CARD.eyebrow}</Text>
        </View>

        {/* Bottom content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{HERO_CARD.title}</Text>
          <Text style={styles.heroSubtitle}>{HERO_CARD.subtitle}</Text>

          <View style={styles.heroCTA}>
            <Text style={styles.heroCTAText}>{HERO_CARD.cta}</Text>
            <ArrowRight size={13} color="#7C3AED" strokeWidth={2.8} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

// ─── Mini Card ────────────────────────────────────────────────────────────────
const MiniCard = memo(function MiniCard({
  card,
  delay,
}: {
  card: (typeof MINI_CARDS)[number];
  delay: number;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  const { Icon } = card;

  return (
    <Reanimated.View
      entering={FadeInDown.delay(delay).duration(450).springify()}
      style={{ flex: 1 }}
    >
      <Pressable
        onPress={card.onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={card.title}
      >
        <Animated.View style={[styles.miniCard, { transform: [{ scale }] }]}>
          {/* Background image */}
          <Image
            source={{ uri: card.image }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="memory-disk"
          />

          {/* Gradient overlay */}
          <LinearGradient
            colors={card.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.85 }]}
          />

          {/* Bottom fade */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Free badge */}
          <View style={styles.miniPill}>
            <Text style={[styles.miniPillText, { color: card.gradient[0] }]}>
              ✦ {card.eyebrow}
            </Text>
          </View>

          {/* Icon */}
          <View style={styles.miniIconWrap}>
            <Icon size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>

          {/* Bottom text */}
          <View style={styles.miniContent}>
            <Text style={styles.miniTitle}>{card.title}</Text>
            <View style={styles.miniCTA}>
              <Text style={styles.miniCTAText}>{card.cta}</Text>
              <ArrowRight size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Reanimated.View>
  );
});

// ─── Main Section ─────────────────────────────────────────────────────────────
const ExploreOptionsSection = memo(function ExploreOptionsSection() {
  return (
    <Reanimated.View
      entering={FadeInDown.delay(350).duration(500).springify()}
      style={styles.container}
    >
      <SectionDivider label="EXPLORE OPTIONS" />

      {/* Hero card */}
      <Reanimated.View entering={FadeInDown.delay(380).duration(450).springify()}>
        <HeroCard />
      </Reanimated.View>

      {/* Mini cards row */}
      <View style={styles.miniRow}>
        {MINI_CARDS.map((card, i) => (
          <MiniCard key={card.id} card={card} delay={430 + i * 80} />
        ))}
      </View>
    </Reanimated.View>
  );
});

export default ExploreOptionsSection;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: H_PAD,
    marginTop: 24,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  heroCard: {
    height: 175,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: GAP,
    // Shadow
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIconBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPill: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#7C3AED",
    letterSpacing: 0.5,
  },
  heroContent: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
    marginTop: 2,
    marginBottom: 10,
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  heroCTAText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#7C3AED",
  },

  // ── Mini row ────────────────────────────────────────────────────────────────
  miniRow: {
    flexDirection: "row",
    gap: GAP,
  },
  miniCard: {
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  miniPill: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  miniPillText: {
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  miniIconWrap: {
    position: "absolute",
    top: 12,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  miniContent: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  miniCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  miniCTAText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
