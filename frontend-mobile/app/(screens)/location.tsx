import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MapPin,
  Navigation,
  Map as MapIcon,
  ChevronRight,
  LocateFixed,
  Check,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenHeader from "@/shared/components/ScreenHeader";
import ScreenWrapper from "@/shared/components/ScreenWrapper";
import SectionDivider from "@/shared/components/SectionDivider";
import Shimmer from "@/shared/components/Shimmer";
import { usePopularLocalities } from "@/hooks/useLocalityHook";
import type { PopularLocalityItem } from "@/services/localityService";
import { useLocalityStore } from "@/store/localityStore";
import colors from "@/theme/colors";
import { toast } from 'react-hot-toast/headless';

export default function SetLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  // ─── Store ──────────────────────────────────────────────────────────────────
  const selectedLocality = useLocalityStore((s) => s.selectedLocality);
  const setSelectedLocality = useLocalityStore((s) => s.setSelectedLocality);
  const cachedLocalities = useLocalityStore((s) => s.popularLocalities);
  const setPopularLocalities = useLocalityStore((s) => s.setPopularLocalities);

  // display the currently selected locality or default to "Nagpur"
  const [displayLocation, setDisplayLocation] = useState(
    selectedLocality ?? "Nagpur",
  );

  const { data, isFetching, isError } = usePopularLocalities();

  useEffect(() => {
    if (data?.success && Array.isArray(data.data)) {
      setPopularLocalities(data.data);
    }
  }, [data, setPopularLocalities]);

  const popularAreas: PopularLocalityItem[] =
    data?.success && Array.isArray(data.data) && data.data.length > 0
      ? data.data
      : cachedLocalities;

  const areas = popularAreas.map((item: PopularLocalityItem, index: number) => ({
    id: `${item.locality}-${index}`,
    name: item.locality,
    count: item.count,
    latitude: item.latitude,
    longitude: item.longitude,
  }));

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)/home");
    }
  };

  /** Save locality and return home immediately */
  const handleSelectLocality = async (name: string, latitude?: number, longitude?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDisplayLocation(name);
    await setSelectedLocality(name, latitude, longitude);
    // small delay so the checkmark is briefly visible before leaving
    setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.push("/(tabs)/home");
    }, 220);
  };

  /** Clear the locality filter */
  const handleClearLocality = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDisplayLocation("Nagpur");
    await setSelectedLocality(null);
  };

  const getLocation = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      toast.error("Please enable location services.");
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(loc.coords);

      if (geo.length > 0) {
        const area = geo[0].district || geo[0].name || "Nagpur";
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setDisplayLocation(area);
        await setSelectedLocality(area, loc.coords.latitude, loc.coords.longitude);
        setTimeout(() => {
          if (router.canGoBack()) router.back();
          else router.push("/(tabs)/home");
        }, 300);
      }
    } catch {
      toast.error("Could not fetch your location.");
    }
    setLoading(false);
  };

  const openMap = () => {
    router.push("/(screens)/mapPicker?mode=search" as any);
  };

  // ─── UI helpers ─────────────────────────────────────────────────────────────

  const shimmerColors = ["#E2E8F0", "#F8FAFC", "#E2E8F0"] as [string, string, string];

  function SkeletonBlock({
    width = "100%",
    height = 14,
    borderRadius = 10,
    style,
  }: {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
  }) {
    return (
      <Shimmer
        shimmerColors={shimmerColors}
        style={[
          {
            width,
            height,
            borderRadius,
            backgroundColor: "#F1F5F9",
          },
          style,
        ]}
      />
    );
  }

  const LocationSkeleton = () => (
    <View className="bg-white rounded-xl border border-slate-200 p-5">
      <View className="mb-4">
        <SkeletonBlock width="45%" height={14} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="65%" height={12} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="80%" height={12} />
      </View>

      {[0, 1, 2].map((item) => (
        <View key={item} className="bg-white rounded-xl p-4 border border-slate-200 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <SkeletonBlock width="60%" height={16} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="70%" height={12} />
            </View>
            <SkeletonBlock width={32} height={32} borderRadius={999} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderAreaItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = item.name === selectedLocality;

    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(220)}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleSelectLocality(item.name, item.latitude, item.longitude)}
          style={{
            backgroundColor: isSelected ? "#FFF7ED" : "#FFFFFF",
            borderColor: isSelected ? colors.primary : "#E2E8F0",
            borderWidth: isSelected ? 1.5 : 1,
            borderRadius: 14,
            padding: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "900",
                fontSize: 16,
                color: isSelected ? colors.primary : "#0F172A",
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#64748B",
                marginTop: 3,
              }}
            >
              {item.count} listings available
            </Text>
          </View>

          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: isSelected ? colors.primary : "#F8FAFC",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSelected ? (
              <Check size={16} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <ChevronRight size={16} color="#94A3B8" />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const listHeader = (
    <>
      {/* ─── Current location card ─── */}
      <View className="bg-white/95 rounded-xl p-6 border border-slate-200 mb-4 mt-3">
        <View className="flex-row items-center gap-4 mb-4">
          <View className="w-14 h-14 rounded-3xl bg-orange-50 items-center justify-center">
            <Navigation size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
              Current location
            </Text>
            <Text className="text-2xl font-black text-slate-950 mt-2">
              {displayLocation}
            </Text>
          </View>

          {/* Clear button — only shown when a locality is set */}
          {selectedLocality && (
            <TouchableOpacity
              onPress={handleClearLocality}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FEE2E2",
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 10,
                gap: 4,
              }}
            >
              <X size={12} color="#EF4444" strokeWidth={3} />
              <Text style={{ color: "#EF4444", fontWeight: "800", fontSize: 11 }}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-sm leading-6 text-slate-500">
          Set a location to see the best listings near you with premium search
          results tailored for Nagpur.
        </Text>
      </View>

      {/* ─── Action buttons ─── */}
      <View className="flex-row gap-3 mb-8">
        <TouchableOpacity
          onPress={getLocation}
          activeOpacity={0.85}
          className="flex-1 bg-orange-500 rounded-xl p-5 items-center"
        >
          <LocateFixed size={22} color={colors.white} />
          <Text className="text-[12px] font-black text-white uppercase tracking-[0.22em] mt-3 text-center">
            {loading ? "Detecting..." : "Auto detect"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openMap}
          activeOpacity={0.85}
          className="flex-1 bg-white rounded-xl p-5 items-center border border-slate-200"
        >
          <MapIcon size={22} color={colors.primary} />
          <Text className="text-[12px] font-black text-slate-950 uppercase tracking-[0.22em] mt-3 text-center">
            Select on map
          </Text>
        </TouchableOpacity>
      </View>

      <SectionDivider label="Popular areas" className="mb-4" />
    </>
  );

  const listEmptyComponent =
    isFetching && areas.length === 0 ? (
      <LocationSkeleton />
    ) : (
      <View className="bg-white rounded-xl p-5 border border-slate-200">
        <Text className="text-sm font-semibold text-slate-700">
          {isError && areas.length === 0
            ? "Could not load popular localities right now."
            : "No popular localities available right now."}
        </Text>
      </View>
    );

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Set Location"
        subtitle="Explore Nagpur"
        onBack={handleBack}
        rightIcon={<MapPin size={18} color={colors.primary} />}
      />

      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 40,
        }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={renderAreaItem}
        ListFooterComponent={
          <View className="bg-slate-950 rounded-xl p-6 mt-8 overflow-hidden">
            <View className="absolute -top-12 -right-12 w-28 h-28 bg-orange-500/20 rounded-xl" />
            <Text className="text-white font-black text-lg tracking-tight">
              Still not seeing your area?
            </Text>
            <Text className="text-slate-400 text-sm leading-6 mt-2">
              Our Nagpur coverage is growing quickly. Stay tuned for new
              neighbourhoods and premium listings coming soon.
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
