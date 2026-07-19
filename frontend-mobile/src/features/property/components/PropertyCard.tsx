import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/features/auth";
import { useModal } from "@/context/ModalContext";
import React, { useCallback, useMemo, useState, useRef } from "react";
import { PropertyCardItem } from "@/features/property/types/property.types";
import { getLocationString } from "@/shared/utils/locationParser";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Share,
  Linking,
  Alert,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Image } from "expo-image";
import PropertyImageCarousel from "./PropertyImageCarousel";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DUMMY_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
];

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    // NOTE: overflow:"hidden" intentionally removed — on Android it clips touch
    // events for ALL children (including the action buttons below the image).
    // Image clipping is handled by carouselContainer instead.
    width: "100%",
  },
  horizontalContainer: {
    width: 200,
    marginRight: 14,
    borderRadius: 18,
    overflow: "hidden",
  },
  carouselContainer: {
    height: 280,
    position: "relative",
    // Clip the image to the card's top rounded corners only
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  horizontalCarousel: {
    height: 130,
    position: "relative",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  infoSection: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  whatsappButton: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#00B76A",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FA4A0C",
  },
});

export const PROPERTY_CARD_WIDTH_OFFSET = 24;

type Props = {
  item: PropertyCardItem;
  variant?: "vertical" | "horizontal" | "searchList";
  /** Fixed width for horizontal carousel rows (matches home feed cards). */
  width?: number;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onToggleSave?: (id: string) => void;
  onCreateCallEnquiry?: (id: string) => Promise<any>;
};

function resolveImages(item: PropertyCardItem): string[] {
  if (item.images && item.images.length > 0) return item.images;
  if (item.image) return [item.image, ...DUMMY_IMAGES.slice(0, 2)];
  return DUMMY_IMAGES;
}

function getSearchListSpecs(item: PropertyCardItem) {
  const details = item.details || {};
  const type = item.propertyType || item.type || "";

  if (type === "Residential Plot" || type.toLowerCase().includes("plot")) {
    const plotArea = details.plotAreaSqFt ? `${details.plotAreaSqFt} sqft` : (item.sqft ? `${item.sqft} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A"));
    const isGated = details.gatedLayout === true ? "Gated Layout" : "Open Layout";
    const security = details.security || (details.gatedLayout === true ? "Secure" : "Open");
    return [
      { icon: "crop-outline" as const, value: plotArea, label: "Plot Area" },
      { icon: "compass-outline" as const, value: isGated, label: "Layout" },
      { icon: "shield-checkmark-outline" as const, value: security, label: "Security" },
    ];
  }

  const isResidential = type === "Flat/Apartment" || type === "Villa/Independent House" || type === "Builder Floor" || type === "Penthouse";
  if (isResidential) {
    const areaLabel = type === "Villa/Independent House" ? "Built-up Area" : (details.superBuiltUpArea ? "Super Area" : "Built-up Area");
    const areaVal = details.builtUpArea ? `${details.builtUpArea} sqft` : (details.superBuiltUpArea ? `${details.superBuiltUpArea} sqft` : (item.sqft ? `${item.sqft} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A")));
    const bedrooms = details.bhk ? `${details.bhk} BHK` : (item.bedrooms ? `${item.bedrooms} BHK` : "N/A");
    const bathrooms = details.bathrooms ? String(details.bathrooms) : (item.bathrooms ? String(item.bathrooms) : "N/A");
    return [
      { icon: "crop-outline" as const, value: areaVal, label: areaLabel },
      { icon: "bed-outline" as const, value: bedrooms, label: "Bedrooms" },
      { icon: "copy-outline" as const, value: bathrooms, label: "Bathrooms" },
    ];
  }

  const areaVal = item.sqft ? `${item.sqft} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A");
  const subType = type || "Property";
  const security = details.gatedLayout === true || details.dgBackup === true ? "Secure" : "Standard";
  return [
    { icon: "crop-outline" as const, value: areaVal, label: "Area" },
    { icon: "business-outline" as const, value: subType, label: "Type" },
    { icon: "shield-checkmark-outline" as const, value: security, label: "Security" },
  ];
}

const HeartButton = React.memo(({
  liked,
  onPress,
  heartAnimStyle,
  colors,
  size = 20,
  compact = false,
}: {
  liked: boolean;
  onPress: () => void;
  heartAnimStyle: any;
  colors: any;
  size?: number;
  compact?: boolean;
}) => (
  <AnimatedPressable
    onPress={onPress}
    style={[
      heartAnimStyle,
      {
        position: "absolute",
        top: compact ? 10 : 14,
        right: compact ? 10 : 14,
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: compact ? 6 : 10,
        borderRadius: compact ? 10 : 14,
        zIndex: 2,
      },
    ]}
    className="items-center justify-center"
  >
    <Ionicons
      name={liked ? "heart" : "heart-outline"}
      size={size}
      color={liked ? colors.error : colors.primary}
    />
  </AnimatedPressable>
));



const PropertyCard = ({
  item,
  variant = "vertical",
  width: widthProp,
  isLiked: externalLiked,
  onToggleLike,
  onToggleSave,
  onCreateCallEnquiry,
}: Props) => {


  const { colors } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openAuth } = useModal();
  const router = useRouter();

  const windowWidth = useWindowDimensions().width;
  const heartScale = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const propertyId =
    typeof item.id === "string"
      ? item.id
      : typeof item._id === "string"
        ? item._id
        : undefined;

  const cachedPhone = useRef<string | null>(null);

  // Sync prop changes to state in render phase instead of useEffect
  // We use a derived const 'liked' and a 'localLiked' optimistic override state
  // to avoid render-phase setState calls, which previously caused 2 extra re-renders
  // on every mount.
  const currentLiked = externalLiked ?? Boolean(item.isSaved ?? item.isLiked);
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);

  // Reset local override once props/cache catches up with the optimistic toggle.
  if (localLiked !== null && currentLiked === localLiked) {
    setLocalLiked(null);
  }

  const liked = localLiked !== null ? localLiked : currentLiked;

  const images = useMemo(
    () => resolveImages(item),
    [item.images, item.image],
  );

  const defaultVerticalWidth = Math.max(
    0,
    windowWidth - PROPERTY_CARD_WIDTH_OFFSET,
  );
  const cardWidth =
    widthProp ?? (variant === "horizontal" ? 200 : defaultVerticalWidth);
  const isScrollRow = widthProp != null && variant === "vertical";

  const isNegotiable = useMemo(() => {
    return Boolean(
      item.priceNegotiable ??
      item.rentNegotiable ??
      (item.pricing && (item.pricing.priceNegotiable ?? item.pricing.rentNegotiable)) ??
      false
    );
  }, [item.priceNegotiable, item.rentNegotiable, item.pricing]);

  const specs = useMemo(() => {
    const details = item.details || {};
    const type = item.propertyType || item.type || "";

    if (type === "Flat/Apartment" || type === "Penthouse" || type === "Builder Floor") {
      const superArea = item.area && item.area !== "N/A" ? item.area : (details.superBuiltUpArea ? `${details.superBuiltUpArea} sqft` : details.builtUpArea ? `${details.builtUpArea} sqft` : details.carpetArea ? `${details.carpetArea} sqft` : "N/A");
      const bedrooms = details.bhk ? `${details.bhk} BHK` : item.bedrooms ? `${item.bedrooms} BHK` : "N/A";
      const furnishing = details.furnishing ?? "N/A";
      return [
        { icon: "crop-outline" as const, value: superArea, label: details.superBuiltUpArea ? "Super Area" : "Area" },
        { icon: "bed-outline" as const, value: bedrooms, label: "Bedrooms" },
        { icon: "grid-outline" as const, value: furnishing, label: "Furnishing" },
      ];
    } else if (type === "Villa/Independent House") {
      const plotArea = details.plotArea ? `${details.plotArea} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A");
      const bedrooms = details.bhk ? `${details.bhk} BHK` : item.bedrooms ? `${item.bedrooms} BHK` : "N/A";
      const furnishing = details.furnishing ?? "N/A";
      return [
        { icon: "crop-outline" as const, value: plotArea, label: "Plot Area" },
        { icon: "bed-outline" as const, value: bedrooms, label: "Bedrooms" },
        { icon: "grid-outline" as const, value: furnishing, label: "Furnishing" },
      ];
    } else if (type === "Office Space") {
      const carpetArea = details.carpetArea ? `${details.carpetArea} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A");
      const capacity = details.cabinCount !== undefined && details.cabinCount > 0 ? `${details.cabinCount} Cabins` : details.openDesks !== undefined ? `${details.openDesks} Seats` : "N/A";
      const power = details.dgBackup === true ? "DG Backup" : details.dgBackup === false ? "No Backup" : "N/A";
      return [
        { icon: "crop-outline" as const, value: carpetArea, label: "Carpet Area" },
        { icon: "briefcase-outline" as const, value: capacity, label: "Capacity" },
        { icon: "flash-outline" as const, value: power, label: "Power Backup" },
      ];
    } else if (type === "Shop") {
      const shopArea = item.area && item.area !== "N/A" ? item.area : "N/A";
      const floor = details.shopFloor ?? "N/A";
      const corner = details.cornerShop === true ? "Corner Shop" : "Regular";
      return [
        { icon: "crop-outline" as const, value: shopArea, label: "Shop Area" },
        { icon: "business-outline" as const, value: floor, label: "Floor Level" },
        { icon: "compass-outline" as const, value: corner, label: "Position" },
      ];
    } else if (type === "Showroom") {
      const showroomArea = details.showroomArea ? `${details.showroomArea} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A");
      const floors = details.numberOfShowroomFloors ? `${details.numberOfShowroomFloors} Floors` : "N/A";
      const parking = details.parkingAvailable === true ? "Available" : "N/A";
      return [
        { icon: "crop-outline" as const, value: showroomArea, label: "Showroom Area" },
        { icon: "business-outline" as const, value: floors, label: "Showroom Floors" },
        { icon: "car-outline" as const, value: parking, label: "Customer Parking" },
      ];
    } else if (type === "Warehouse/Godown") {
      const warehouseArea = details.warehouseArea ? `${details.warehouseArea} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A");
      const height = details.warehouseHeight ? `${details.warehouseHeight} ft` : "N/A";
      const midc = details.midc === true ? "MIDC Approved" : "Regular";
      return [
        { icon: "crop-outline" as const, value: warehouseArea, label: "Warehouse Area" },
        { icon: "resize-outline" as const, value: height, label: "Ceiling Height" },
        { icon: "shield-checkmark-outline" as const, value: midc, label: "Approval" },
      ];
    } else if (type === "Residential Plot" || type.toLowerCase().includes("plot")) {
      const plotArea = details.plotAreaSqFt ? `${details.plotAreaSqFt} sqft` : (item.area && item.area !== "N/A" ? item.area : "N/A");
      const dims = details.plotLength && details.plotWidth ? `${details.plotLength} × ${details.plotWidth} ft` : "N/A";
      const isGated = details.gatedLayout === true ? "Gated Layout" : "Open Layout";
      return [
        { icon: "crop-outline" as const, value: plotArea, label: "Plot Area" },
        { icon: "git-commit-outline" as const, value: dims, label: "Dimensions" },
        { icon: "shield-checkmark-outline" as const, value: isGated, label: "Security" },
      ];
    } else if (type === "Agricultural Land" || type.toLowerCase().includes("land")) {
      const landArea = details.areaAcres ? `${details.areaAcres} Acres` : (item.area && item.area !== "N/A" ? item.area : "N/A");
      const soil = details.soilType ?? "N/A";
      const access = details.roadAccess === true ? "Yes" : details.roadAccess === false ? "No" : "N/A";
      return [
        { icon: "crop-outline" as const, value: landArea, label: "Land Area" },
        { icon: "leaf-outline" as const, value: soil, label: "Soil Type" },
        { icon: "car-outline" as const, value: access, label: "Road Access" },
      ];
    } else {
      // Fallback
      const area = item.area && item.area !== "N/A" ? item.area : "N/A";
      const displayType = type || "Property";
      const isGated = Boolean(details.gatedLayout ?? details.gatedSociety ?? item.gatedSociety ?? item.gatedLayout ?? true);
      return [
        { icon: "crop-outline" as const, value: area, label: "Area" },
        { icon: "business-outline" as const, value: displayType, label: "Property Type" },
        { icon: "shield-checkmark-outline" as const, value: isGated ? "Gated Project" : "Security", label: "Security" },
      ];
    }
  }, [item.details, item.propertyType, item.type, item.area, item.sqft, item.bedrooms]);

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleCardPress = useCallback(() => {
    if (!propertyId) return;
    // Avoid stacking duplicate propertyDetail screens when already on one.
    // Read the current route name imperatively (zero re-render cost).
    const state = router.canGoBack();
    const isOnDetail =
      typeof (router as any).pathname === "string"
        ? (router as any).pathname.includes("/propertyDetail")
        : false;
    if (isOnDetail) {
      router.replace({ pathname: "/propertyDetail/[id]", params: { id: propertyId } });
    } else {
      router.push({ pathname: "/propertyDetail/[id]", params: { id: propertyId } });
    }
  }, [propertyId, router]);

  const handleLike = useCallback(() => {
    if (!isAuthenticated) {
      openAuth("saveProperty");
      return;
    }

    heartScale.value = withSpring(1.4, {}, () => {
      heartScale.value = withSpring(1);
    });

    const nextLiked = !liked;
    setLocalLiked(nextLiked);

    if (propertyId && onToggleSave) {
      onToggleSave(propertyId);
    }

    onToggleLike?.();
  }, [isAuthenticated, liked, propertyId, onToggleSave, onToggleLike, heartScale, openAuth]);

  const handleCall = useCallback(async () => {
    if (!isAuthenticated) {
      openAuth("viewContact");
      return;
    }

    let phone = cachedPhone.current || "";
    try {
      if (!phone && propertyId && onCreateCallEnquiry) {
        const res = await onCreateCallEnquiry(propertyId);
        phone = res.data?.brokerDetails?.mobile ?? "";
        if (phone) {
          cachedPhone.current = phone;
        }
      }
    } catch (e) {
      if (__DEV__) {
        console.log("Call enquiry error:", e);
      }
    }

    // Fallback to card data
    if (!phone) {
      const raw = item.broker?.mobile || item.broker?.phone || item.broker?.phoneFull || "";
      phone = raw.replace(/[^0-9]/g, "");
    } else {
      phone = phone.replace(/[^0-9]/g, "");
    }

    if (phone) {
      if (phone.length === 10) phone = `91${phone}`;
      try {
        await Linking.openURL(`tel:${phone}`);
      } catch {
        Alert.alert("Error", "Unable to make a call on this device");
      }
    }
  }, [isAuthenticated, propertyId, onCreateCallEnquiry, item.broker, openAuth]);

  const handleWhatsApp = useCallback(async () => {
    if (!isAuthenticated) {
      openAuth("viewContact");
      return;
    }

    let phone = cachedPhone.current || "";
    try {
      if (!phone && propertyId && onCreateCallEnquiry) {
        const res = await onCreateCallEnquiry(propertyId);
        phone = res.data?.brokerDetails?.mobile ?? "";
        if (phone) {
          cachedPhone.current = phone;
        }
      }
    } catch (e) {
      if (__DEV__) {
        console.log("WhatsApp enquiry error:", e);
      }
    }

    // Fallback to card data
    if (!phone) {
      const raw = item.broker?.mobile || item.broker?.phone || item.broker?.phoneFull || "";
      phone = raw.replace(/[^0-9]/g, "");
    } else {
      phone = phone.replace(/[^0-9]/g, "");
    }

    if (phone) {
      if (phone.length === 10) phone = `91${phone}`;
      const msg = encodeURIComponent(
        `Hi, I am interested in your property "${item.title}" listed on Nagpur Prime Property.`,
      );
      try {
        await Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
      } catch {
        Alert.alert("Error", "WhatsApp is not installed on this device");
      }
    }
  }, [isAuthenticated, propertyId, onCreateCallEnquiry, item.broker, item.title, openAuth]);

  const handleShare = useCallback(() => {
    const locStr = getLocationString(item.location);
    Share.share({
      message: `Check out this property on Nagpur Prime Property: ${item.title} at ${locStr}. Price: ₹${item.price}. More details: https://nagpurprimeproperty.com/propertyDetail/${propertyId}`,
    }).catch((error) => {
      if (__DEV__) {
        console.log("Error sharing:", error);
      }
    });
  }, [item.title, item.location, item.price, propertyId]);

  const handlePressIn = useCallback(() => {
    cardScale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
  }, [cardScale]);

  const handlePressOut = useCallback(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
  }, [cardScale]);

  if (variant === "horizontal") {
    return (
      <View
        style={styles.horizontalContainer}
        className="bg-white border border-slate-200"
      >
        <View style={styles.horizontalCarousel}>
          <PropertyImageCarousel
            images={images}
            width={cardWidth}
            height={130}
            rounded
          />
          <HeartButton
            liked={liked}
            onPress={handleLike}
            heartAnimStyle={heartAnimStyle}
            colors={colors}
            size={14}
            compact
          />
          {Boolean(item.badge) && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                backgroundColor: colors.primary,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                zIndex: 2,
              }}
              pointerEvents="none"
            >
              <Text className="text-white text-[9px] font-bold">
                {item.badge}
              </Text>
            </View>
          )}
        </View>

        <Pressable onPress={handleCardPress} className="p-3">
          <Text
            className="text-orange-500 font-black text-base"
            style={{ letterSpacing: -0.3 }}
          >
            ₹{item.price}
          </Text>
          <Text
            numberOfLines={1}
            className="text-slate-900 font-semibold text-xs mt-1"
          >
            {item.title}
          </Text>
          <View className="flex-row items-center mt-1 gap-1">
            <Ionicons name="location" size={9} color={colors.textMuted} />
            <Text className="text-slate-500 text-[9px]" numberOfLines={1}>
              {getLocationString(item.location, "")}
            </Text>
          </View>
          {(() => {
            const type = item.propertyType || item.type || "";
            const isResidential = type === "Flat/Apartment" || type === "Villa/Independent House" || type === "Builder Floor" || type === "Penthouse";
            const showBhkBadge = isResidential && (Number(item.bedrooms) > 0 || Number(item.details?.bhk) > 0);
            const showTypeBadge = !isResidential && Boolean(type);
            const displayBhk = item.bedrooms ? `${item.bedrooms} BHK` : item.details?.bhk ? `${item.details.bhk} BHK` : "";

            if (!showBhkBadge && !showTypeBadge && !item.area) return null;

            return (
              <View className="flex-row mt-2 gap-1.5">
                {showBhkBadge && (
                  <View className="flex-row items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded">
                    <Ionicons name="bed-outline" size={8} color={colors.primary} />
                    <Text className="text-orange-500 text-[8px] font-bold">
                      {displayBhk}
                    </Text>
                  </View>
                )}
                {showTypeBadge && (
                  <View className="flex-row items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded">
                    <Ionicons name="business-outline" size={8} color={colors.primary} />
                    <Text className="text-orange-500 text-[8px] font-bold">
                      {type}
                    </Text>
                  </View>
                )}
                {Boolean(item.area) && (
                  <View className="flex-row items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
                    <Ionicons
                      name="resize-outline"
                      size={8}
                      color={colors.secondary}
                    />
                    <Text className="text-slate-800 text-[8px] font-bold">
                      {item.area}
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}
        </Pressable>
      </View>
    );
  }

  if (variant === "searchList") {
    const showFeatured = Boolean(item.featured);
    const showNewLaunch = item.listingCategory === "New" || item.type === "New";
    const showVerified = item.status === "Active" || item.verified || item.details?.verified || true;
    
    const displayImgCount = images.length;
    const videoCount = Array.isArray(item.videos) ? item.videos.length : (item.video ? 1 : 0);
    const displayVideoCount = videoCount;

    const listSpecs = getSearchListSpecs(item);

    return (
      <View
        style={{
          flexDirection: "row",
          width: cardWidth,
          height: 175,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#F1F5F9",
          backgroundColor: "white",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        {/* Left Section: Image */}
        <View style={{ width: 130, height: 175, position: "relative" }}>
          <PropertyImageCarousel
            images={images}
            width={130}
            height={175}
          />

          {/* Top-Left Badges */}
          <View style={{ position: "absolute", top: 8, left: 8, gap: 4, zIndex: 10 }}>
            {showFeatured && (
              <View style={{ backgroundColor: "#F97316", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: "white", fontSize: 8, fontWeight: "900" }}>★ FEATURED</Text>
              </View>
            )}
            {showVerified && (
              <View style={{ backgroundColor: "#0D9488", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: "white", fontSize: 8, fontWeight: "900" }}>✔ VERIFIED</Text>
              </View>
            )}
            {showNewLaunch && !showFeatured && (
              <View style={{ backgroundColor: "#2563EB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: "white", fontSize: 8, fontWeight: "900" }}>NEW LAUNCH</Text>
              </View>
            )}
          </View>

          {/* Bottom-Left Media Indicators */}
          <View style={{ position: "absolute", bottom: 8, left: 8, flexDirection: "row", gap: 4, zIndex: 10 }}>
            <View style={{ backgroundColor: "rgba(0,0,0,0.6)", flexDirection: "row", alignItems: "center", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
              <Ionicons name="camera" size={10} color="white" />
              <Text style={{ color: "white", fontSize: 8, fontWeight: "800", marginLeft: 2 }}>{displayImgCount}</Text>
            </View>
            {displayVideoCount > 0 && (
              <View style={{ backgroundColor: "rgba(0,0,0,0.6)", flexDirection: "row", alignItems: "center", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
                <Ionicons name="videocam" size={10} color="white" />
                <Text style={{ color: "white", fontSize: 8, fontWeight: "800", marginLeft: 2 }}>{displayVideoCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right Section: Details */}
        <TouchableOpacity
          onPress={handleCardPress}
          activeOpacity={0.9}
          style={{ flex: 1, padding: 10, justifyContent: "space-between" }}
        >
          {/* Row 1: Category & Heart */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#F97316", fontSize: 9, fontWeight: "900", textTransform: "uppercase" }}>
              {item.type || "Property"}
            </Text>
            <TouchableOpacity onPress={handleLike} style={{ padding: 4 }} activeOpacity={0.7}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={18}
                color={liked ? "#EF4444" : "#94A3B8"}
              />
            </TouchableOpacity>
          </View>

          {/* Row 2: Title & Price */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 1 }}>
            <Text
              style={{ color: "#0F172A", fontSize: 13, fontWeight: "700", flex: 1, marginRight: 6, lineHeight: 16 }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={{ color: "#EA580C", fontSize: 15, fontWeight: "900" }}>
              ₹{item.price}
            </Text>
          </View>

          {/* Row 3: Location & Negotiable */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Ionicons name="location" size={11} color="#94A3B8" />
              <Text style={{ color: "#64748B", fontSize: 10, marginLeft: 2, flex: 1 }} numberOfLines={1}>
                {getLocationString(item.location, "")}
              </Text>
            </View>
            {isNegotiable && (
              <Text style={{ color: "#94A3B8", fontSize: 9, fontWeight: "500" }}>
                Negotiable
              </Text>
            )}
          </View>

          {/* Row 4: Specifications */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
              paddingTop: 6,
            }}
          >
            {listSpecs.map((spec: any, idx: number) => (
              <React.Fragment key={idx}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 2 }}>
                  <Ionicons name={spec.icon} size={12} color="#475569" style={{ marginRight: 4 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0F172A", fontSize: 9.5, fontWeight: "800" }} numberOfLines={1}>
                      {spec.value}
                    </Text>
                    <Text style={{ color: "#94A3B8", fontSize: 8, fontWeight: "700", marginTop: 1 }} numberOfLines={1}>
                      {spec.label}
                    </Text>
                  </View>
                </View>
                {idx < 2 && <View style={{ width: 1, height: 12, backgroundColor: "#E2E8F0" }} />}
              </React.Fragment>
            ))}
          </View>

          {/* Row 5: Action Buttons */}
          <View style={{ flexDirection: "row", gap: 5, marginTop: 8 }}>
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.72}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                backgroundColor: "white",
              }}
            >
              <Ionicons name="call" size={14} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.72}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                borderRadius: 8,
                backgroundColor: "#00B76A",
              }}
            >
              <Ionicons name="logo-whatsapp" size={15} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.72}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Ionicons name="share-social" size={15} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        cardAnimStyle,
        styles.container,
        isScrollRow && { width: cardWidth, marginBottom: 0 },
      ]}
      className={`bg-white border border-slate-200 ${isScrollRow ? "" : "mb-4"}`}
    >
      {/* Image + badges + heart */}
      <View style={styles.carouselContainer}>
        <PropertyImageCarousel
          images={images}
          width={cardWidth}
          height={280}
        />

        <View
          className="absolute top-3.5 left-3.5 flex-row gap-2"
          pointerEvents="none"
        >
          {Boolean(item.featured || item.badge) && (
            <View
              style={{ backgroundColor: colors.primary }}
              className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full"
            >
              <Ionicons name="star" size={12} color="white" />
              <Text className="text-white text-xs font-black uppercase tracking-wide">
                {item.badge || "Featured"}
              </Text>
            </View>
          )}
          {Array.isArray(item.badges) && item.badges.length > 1 && (
            <View className="bg-white/95 flex-row items-center px-3.5 py-1.5 rounded-full">
              <Text className="text-slate-900 text-xs font-black">
                {item.badges[1]}
              </Text>
            </View>
          )}
        </View>

        {/* Location Overlay Badge */}
        {Boolean(item.location) && (
          <View
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              zIndex: 2,
            }}
          >
            <Ionicons name="location" size={13} color="white" style={{ marginRight: 4 }} />
            <Text className="text-white text-xs font-bold" numberOfLines={1}>
              {getLocationString(item.location, "")}
            </Text>
          </View>
        )}

        <HeartButton
          liked={liked}
          onPress={handleLike}
          heartAnimStyle={heartAnimStyle}
          colors={colors}
        />
      </View>

      {/* Info — tapping navigates to detail */}
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={1}
        onPressIn={() => {
          cardScale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
        }}
        onPressOut={() => {
          cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
        }}
        style={styles.infoSection}
      >
        {/* Row 1 & 2 layout: Type, Title (Left) | Price, Negotiable (Right) */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="text-orange-500 font-extrabold text-xs uppercase tracking-wider">
              {item.type}
            </Text>
            <Text
              className="text-slate-900 font-black text-xl mt-1.5 leading-tight"
              numberOfLines={2}
              style={{ letterSpacing: -0.4 }}
            >
              {item.title}
            </Text>
          </View>
          <View className="items-end">
            <Text
              className="text-orange-600 font-black text-2xl"
              style={{ letterSpacing: -0.5 }}
            >
              ₹{item.price}
            </Text>
            <Text className="text-slate-500 text-xs font-semibold mt-1">
              {isNegotiable ? "Negotiable" : ""}
            </Text>
          </View>
        </View>

        {/* Specifications Row */}
        <View className="flex-row items-center justify-between mt-5">
          {specs.map((spec, index) => (
            <React.Fragment key={index}>
              <View className="flex-1 flex-row items-center justify-center px-1">
                <Ionicons
                  name={spec.icon}
                  size={20}
                  color="#1E293B"
                  style={{ marginRight: 8 }}
                />
                <View className="flex-1">
                  <Text
                    className="text-slate-900 font-black text-xs leading-tight"
                    numberOfLines={1}
                  >
                    {spec.value}
                  </Text>
                  <Text
                    className="text-slate-400 text-[10px] font-extrabold mt-0.5"
                    numberOfLines={1}
                  >
                    {spec.label}
                  </Text>
                </View>
              </View>
              {index < 2 && <View className="w-[1.5px] h-6 bg-slate-200" />}
            </React.Fragment>
          ))}
        </View>

        {/* Description Paragraph */}
        {Boolean(item.description) && (
          <Text
            className="text-slate-500 text-sm mt-4 leading-relaxed font-medium"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
      </TouchableOpacity>

      {/* Action buttons — siblings of info section, NOT nested inside it */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={handleCall}
          activeOpacity={0.72}
          style={[styles.callButton, { borderColor: colors.border }]}
        >
          <Ionicons name="call" size={15} color="#0F172A" />
          <Text className="text-slate-900 font-extrabold text-sm ml-2">Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWhatsApp}
          activeOpacity={0.72}
          style={styles.whatsappButton}
        >
          <Ionicons name="logo-whatsapp" size={16} color="white" />
          <Text className="text-white font-extrabold text-sm ml-2">WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.72}
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="share-social" size={16} color="white" />
          <Text className="text-white font-extrabold text-sm ml-2">Share</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default React.memo(PropertyCard, (prevProps, nextProps) => {
  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.width !== nextProps.width) return false;
  if (prevProps.isLiked !== nextProps.isLiked) return false;
  
  const prevItem = prevProps.item || {};
  const nextItem = nextProps.item || {};
  
  const id1 = prevItem._id || prevItem.id;
  const id2 = nextItem._id || nextItem.id;
  
  return (
    id1 === id2 &&
    prevItem.updatedAt === nextItem.updatedAt &&
    (prevItem.isSaved ?? prevItem.isLiked) === (nextItem.isSaved ?? nextItem.isLiked)
  );
});
