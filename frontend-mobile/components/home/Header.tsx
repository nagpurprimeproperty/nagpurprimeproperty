import { useTheme } from "@/hooks/useTheme";
import { useUnreadCount } from "@/features/notification/hooks/useNotification";
import { useLocalityStore } from "@/store/localityStore";
import { router } from "expo-router";
import { Bell, ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react-native";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Header() {
  const { colors } = useTheme();
  const bellScale = useSharedValue(1);
  const { data: unreadCount = 0 } = useUnreadCount();

  const selectedLocality = useLocalityStore((s) => s.selectedLocality);
  const setSelectedLocality = useLocalityStore((s) => s.setSelectedLocality);

  const bellAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
  }));

  const handleClearLocality = async () => {
    await setSelectedLocality(null);
  };

  return (
    <BlurView intensity={70} tint="light" style={styles.blurHeader}>
      <Animated.View
        entering={FadeInDown.duration(500).springify()}
        style={styles.row}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-xl overflow-hidden mr-3 bg-orange-500 items-center justify-center">
            <Image
              source={require("@/assets/images/nppicon.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              cachePolicy="memory"
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-black text-slate-900 tracking-tight">
              Nagpur Prime Property
            </Text>

            {/* Location row — tap to go to location screen */}
            <Pressable
              onPress={() => router.push("/location")}
              className="flex-row items-center mt-0.5"
              style={{ alignSelf: "flex-start" }}
            >
              <MapPin size={11} color={colors.primary} strokeWidth={2.5} />
              <Text
                className="font-bold text-[11px] ml-1"
                style={{ color: colors.primary }}
                numberOfLines={1}
              >
                {selectedLocality ?? "Set Location"}
              </Text>
              <ChevronDown size={11} color={colors.primary} strokeWidth={2.5} style={{ marginLeft: 2 }} />
            </Pressable>
          </View>

          {/* Clear pill — only when a locality is active */}
          {selectedLocality && (
            <Pressable
              onPress={handleClearLocality}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FEF2F2",
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginRight: 8,
                gap: 4,
              }}
            >
              <X size={10} color="#EF4444" strokeWidth={3} />
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 10,
                  fontWeight: "800",
                }}
              >
                Clear
              </Text>
            </Pressable>
          )}
        </View>

        <AnimatedPressable
          onPress={() => router.push("/notification")}
          style={bellAnimatedStyle}
          className="w-11 h-11 items-center justify-center relative"
          onPressIn={() => {
            bellScale.value = withSpring(0.88);
          }}
          onPressOut={() => {
            bellScale.value = withSpring(1);
          }}
        >
          <Bell size={24} color="#1E293B" strokeWidth={2} />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                backgroundColor: "#EF4444",
                borderRadius: 10,
                paddingHorizontal: 4,
                minWidth: 18,
                height: 18,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "#FFFFFF",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: "white",
                  fontSize: 9,
                  fontWeight: "900",
                  textAlign: "center",
                  includeFontPadding: false,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </AnimatedPressable>
      </Animated.View>

      {/* Search Bar Row */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        <Pressable
          onPress={() => router.push("/(tabs)/search")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderWidth: 1.5,
            borderColor: "#E2E8F0", // slate-200
            borderRadius: 14,
            paddingHorizontal: 16,
            height: 48,
          }}
        >
          <Search size={18} color="#94A3B8" strokeWidth={2.5} style={{ marginRight: 10 }} />
          <Text
            style={{
              flex: 1,
              color: "#94A3B8",
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Search by locality, project, property...
          </Text>
          <View style={{ width: 1.5, height: 20, backgroundColor: "#E2E8F0", marginHorizontal: 8 }} />
          <SlidersHorizontal size={18} color="#94A3B8" strokeWidth={2.5} />
        </Pressable>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurHeader: {
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
