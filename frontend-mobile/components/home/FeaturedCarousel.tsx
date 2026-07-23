import { useTheme } from "@/hooks/useTheme";
import { useTogglePropertySave } from "@/features/property/hooks/useTogglePropertySave";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useModal } from "@/context/ModalContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Dimensions, ScrollView, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const SIDE_PADDING = 12;
// Card width fills the visible screen minus side padding
const CARD_WIDTH = width - SIDE_PADDING * 2;
// Gap between cards
const CARD_GAP = 12;
// Each "step" the list moves when going to the next card
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

// Auto-scroll interval in ms
const AUTO_SCROLL_DELAY = 3000;

// ─── Animated Dot ────────────────────────────────────────────────────────────
const Dot = memo(function Dot({
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
});

// ─── Featured Heart Button ────────────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FeaturedHeartButton({ item }: { item: any }) {
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { openAuth } = useModal();
  const propertyId = typeof item.id === "string" ? item.id : item._id;
  const { mutate: toggleSave } = useTogglePropertySave(propertyId);
  const [liked, setLiked] = useState(Boolean(item.isSaved ?? item.isLiked));
  const heartScale = useSharedValue(1);

  useEffect(() => {
    setLiked(Boolean(item.isSaved ?? item.isLiked));
  }, [item.isSaved, item.isLiked]);

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePress = (e: any) => {
    e.stopPropagation?.();
    if (!isAuthenticated) {
      openAuth("saveProperty");
      return;
    }
    heartScale.value = withSpring(1.4, {}, () => {
      heartScale.value = withSpring(1);
    });
    setLiked((prev) => !prev);
    if (propertyId) toggleSave(undefined as never);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        heartAnimStyle,
        {
          position: "absolute",
          top: 14,
          right: 14,
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: 8,
          borderRadius: 12,
          zIndex: 2,
        },
      ]}
    >
      <Ionicons
        name={liked ? "heart" : "heart-outline"}
        size={18}
        color={liked ? "#EF4444" : colors.primary}
      />
    </AnimatedPressable>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type FeaturedCardProps = {
  item: any;
  width: number;
  gap: number;
  colors: any;
  getImageSource: (url: string) => string;
  handleImageError: (url: string) => void;
};

const FeaturedCard = memo(({
  item,
  width,
  gap,
  colors,
  getImageSource,
  handleImageError,
}: FeaturedCardProps) => {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/propertyDetail/[id]", params: { id: item.id } })
      }
    >
      <View
        style={{
          width: width,
          marginRight: gap,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#F3F4F6",
        }}
      >
        <Image
          source={{ uri: getImageSource(item.image) }}
          style={{ width: "100%", height: 210, backgroundColor: "#E5E7EB" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          onError={() => handleImageError(item.image)}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.75)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 130,
          }}
        />

        {/* Badge */}
        {item.badge && (
          <View
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons name="star" size={10} color={colors.white} />
            <Text
              style={{
                color: colors.white,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {item.badge}
            </Text>
          </View>
        )}

        {/* Heart */}
        <FeaturedHeartButton item={item} />

        {/* Info */}
        <View
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "800",
              letterSpacing: -0.3,
            }}
          >
            ₹{item.price}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: 14,
              fontWeight: "600",
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
              gap: 4,
            }}
          >
            <Ionicons
              name="location"
              size={12}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
              {item.location}
            </Text>
            {item.area && (
              <>
                <Text style={{ color: "rgba(255,255,255,0.5)" }}>•</Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                  }}
                >
                  {item.area}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.width === nextProps.width &&
    prevProps.gap === nextProps.gap &&
    prevProps.colors.primary === nextProps.colors.primary &&
    (prevProps.item.id || prevProps.item._id) === (nextProps.item.id || nextProps.item._id) &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.location === nextProps.item.location &&
    prevProps.item.area === nextProps.item.area &&
    prevProps.item.badge === nextProps.item.badge &&
    prevProps.item.image === nextProps.item.image &&
    prevProps.item.isSaved === nextProps.item.isSaved &&
    prevProps.item.isLiked === nextProps.item.isLiked
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const FeaturedCarousel = memo(({ data }: any) => {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoize filteredData so .filter() doesn't run on every render and
  // so that `total` is stable — preventing the auto-scroll interval from
  // being cleared and restarted every time the parent re-renders.
  const featuredData = useMemo(() => data.filter((item: any) => item.badge), [data]);
  const total = featuredData.length;

  const DUMMY_IMAGE =
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80";

  const getImageSource = useCallback((imgUrl: string) => {
    if (failedImages[imgUrl]) {
      return DUMMY_IMAGE;
    }
    return imgUrl;
  }, [failedImages]);

  const handleImageError = useCallback((imgUrl: string) => {
    setFailedImages((prev) => ({ ...prev, [imgUrl]: true }));
  }, []);

  // ── Auto-scroll logic ──────────────────────────────────────────────────────
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!flatListRef.current || total === 0) return;
      flatListRef.current.scrollTo({
        x: index * SNAP_INTERVAL,
        animated: true,
      });
      activeIndexRef.current = index;
      setActiveIndex(index);
    },
    [total],
  );

  const startAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      if (total === 0) return;
      const next = (activeIndexRef.current + 1) % total;
      activeIndexRef.current = next;
      setActiveIndex(next);
      flatListRef.current?.scrollTo({
        x: next * SNAP_INTERVAL,
        animated: true,
      });
    }, AUTO_SCROLL_DELAY);
  }, [total]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  // Start or stop auto-scroll based on both data availability and tab focus.
  // The interval is paused when the Home tab is not visible (isFocused = false),
  // preventing background CPU/battery drain while other tabs are active.
  useEffect(() => {
    if (total > 1 && isFocused) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    return () => stopAutoScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, isFocused]);

  // ── Snap / scroll tracking ─────────────────────────────────────────────────
  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const i = Math.round(offsetX / SNAP_INTERVAL);
    const clamped = Math.max(0, Math.min(i, total - 1));
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
    // Restart auto-scroll after manual swipe
    startAutoScroll();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(500).springify()}
      style={{ marginTop: 24 }}
    >
      {/* Section Title */}


      {/* Carousel */}
      <ScrollView
        ref={flatListRef}
        horizontal
        // Paging disabled — we use snapToInterval for precise per-card snapping
        pagingEnabled={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        // Only left padding so offset math stays clean (right padding via marginRight on cards)
        contentContainerStyle={{
          paddingLeft: SIDE_PADDING,
          paddingRight: SIDE_PADDING - CARD_GAP,
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        // Pause auto-scroll while user is dragging
        onScrollBeginDrag={stopAutoScroll}
        scrollEventThrottle={16}
      >
        {featuredData.map((item: any, index: number) => (
          <FeaturedCard
            key={item.id?.toString() || item._id?.toString() || index.toString()}
            item={item}
            width={CARD_WIDTH}
            gap={CARD_GAP}
            colors={colors}
            getImageSource={getImageSource}
            handleImageError={handleImageError}
          />
        ))}
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
        {featuredData.map((_: any, i: number) => (
          <Pressable
            key={i}
            onPress={() => {
              stopAutoScroll();
              scrollToIndex(i);
              startAutoScroll();
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
});

export default FeaturedCarousel;
