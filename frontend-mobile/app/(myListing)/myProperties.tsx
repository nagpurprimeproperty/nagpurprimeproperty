import ConfirmationOverlay from "@/components/ui/ConformationOverlay";
import colors from "@/theme/colors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Plus } from "lucide-react-native";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  RefreshControl,
} from "react-native";
import { toast } from 'react-hot-toast/headless';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import ScreenHeader from "@/components/common/ScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { useAddPropertyStore } from "@/store/addPropertyStore";
import { apiClient } from "@/api/apiClient";
import Shimmer from "@/components/common/Shimmer";
import {
  useMyProperties,
  useDeleteMyProperty,
  useToggleFeaturedMyProperty,
  useUpdateMyPropertyStatus,
} from "@/hooks/usePropertyHook";
import PropertyImageCarousel from "@/components/property/PropertyImageCarousel";
import { usePagination } from "@/hooks/usePagination";
import LoadMoreButton from "@/components/common/LoadMoreButton";

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── SKELETONS ─────────────────────────────────────────────────────────────────

function ShimmerBox({
  width = "100%",
  height,
  radius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  radius?: number;
  style?: any;
}) {
  const shimmerColors = ["#E2E8F0", "#F8FAFC", "#E2E8F0"] as [string, string, string];
  return (
    <Shimmer
      shimmerColors={shimmerColors}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: "#F1F5F9",
        },
        style,
      ]}
    />
  );
}

function PortfolioCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.carouselContainer}>
        <ShimmerBox height={280} radius={0} />
      </View>
      <View style={styles.infoSection}>
        <ShimmerBox width="30%" height={12} radius={4} style={{ marginBottom: 8 }} />
        <View className="flex-row justify-between items-start">
          <ShimmerBox width="60%" height={20} radius={6} />
          <ShimmerBox width="25%" height={24} radius={6} />
        </View>
        <View className="flex-row justify-between mt-5">
          <ShimmerBox width="28%" height={32} radius={6} />
          <ShimmerBox width="28%" height={32} radius={6} />
          <ShimmerBox width="28%" height={32} radius={6} />
        </View>
        <View className="mt-5">
          <ShimmerBox width="100%" height={45} radius={10} />
        </View>
        <View className="flex-row mt-5 gap-2">
          <ShimmerBox width="42%" height={44} radius={12} />
          <ShimmerBox width="42%" height={44} radius={12} />
          <ShimmerBox width={48} height={44} radius={12} />
        </View>
      </View>
    </View>
  );
}

function PortfolioSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
      <View className="mb-5 flex-row gap-2 mt-4">
        {[80, 90, 80, 70].map((w, i) => (
          <ShimmerBox key={i} width={w} height={38} radius={14} />
        ))}
      </View>

      <View className="px-2">
        <PortfolioCardSkeleton />
        <PortfolioCardSkeleton />
      </View>
    </ScrollView>
  );
}

// ─── UTILS & DATA ─────────────────────────────────────────────────────────────

const DUMMY_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
];

function resolveImages(item: any): string[] {
  if (item.images?.length > 0) return item.images;
  if (item.image) return [item.image, ...DUMMY_IMAGES.slice(0, 2)];
  return DUMMY_IMAGES;
}

const FILTERS = ["ACTIVE", "INACTIVE", "SOLD", "FEATURED"];

// ─── PROPERTY CARD COMPONENT ───────────────────────────────────────────────────

interface PropertyCardProps {
  item: any;
  index: number;
  onView: (item: any) => void;
  onEdit: (item: any) => void;
  onFeature: (item: any) => void;
  onDelete: (item: any) => void;
  onStatusChange: (item: any) => void;
}

const PropertyCard = React.memo(function PropertyCard({
  item,
  index,
  onView,
  onEdit,
  onFeature,
  onDelete,
  onStatusChange,
}: PropertyCardProps) {
    const cardScale = useSharedValue(1);
    const cardAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    const images = useMemo(() => resolveImages(item), [item]);

    const isNegotiable = useMemo(() => {
      return Boolean(
        item.priceNegotiable ??
        item.rentNegotiable ??
        (item.pricing && (item.pricing.priceNegotiable ?? item.pricing.rentNegotiable)) ??
        false
      );
    }, [item]);

    const statusStyle = useMemo(() => {
      const s = item.status?.toLowerCase() || '';
      if (s.includes('active')) return { bg: '#E6F4EA', text: '#137333' }; // Green
      if (s.includes('pending')) return { bg: '#FFF4E5', text: '#B06000' }; // Amber
      if (s.includes('draft')) return { bg: '#F1F5F9', text: '#475569' }; // Slate
      if (s.includes('sold')) return { bg: '#FCE8E6', text: '#C5221F' }; // Red
      if (s.includes('rented')) return { bg: '#E8F0FE', text: '#1A73E8' }; // Blue
      if (s.includes('expired')) return { bg: '#FCE8E6', text: '#C5221F' }; // Red
      return { bg: '#F1F5F9', text: '#475569' }; // Fallback
    }, [item.status]);

    const featuredBadgeLabel = useMemo(() => {
      if (!item.featured) return null;
      if (item.badge) return item.badge;
      if (item.badges && item.badges.length > 0) return item.badges[0];
      
      const price = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9]/g, "")) || 0;
      if (price >= 10000000) return "Premium";
      if (price >= 5000000) return "Boosted";
      return "Featured";
    }, [item]);

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
        const area = item.area && item.area !== "N/A" ? item.area : "N/A";
        const displayType = type || "Property";
        const isGated = Boolean(details.gatedLayout ?? details.gatedSociety ?? item.gatedSociety ?? item.gatedLayout ?? true);
        return [
          { icon: "crop-outline" as const, value: area, label: "Area" },
          { icon: "business-outline" as const, value: displayType, label: "Property Type" },
          { icon: "shield-checkmark-outline" as const, value: isGated ? "Gated Project" : "Security", label: "Security" },
        ];
      }
    }, [item]);

    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(220)}>
        <Animated.View
          style={[cardAnimStyle, styles.card]}
        >
        {/* Image Container */}
        <View style={styles.carouselContainer}>
          <PropertyImageCarousel
            images={images}
            width={SCREEN_WIDTH - 24}
            height={280}
            rounded
          />

          {/* Badges Overlays */}
          <View className="absolute top-3.5 left-3.5 flex-row gap-2" pointerEvents="none">
            <View style={{ backgroundColor: statusStyle.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: statusStyle.text, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.status}
              </Text>
            </View>
            <View style={styles.badgeGlass}>
              <Text style={styles.badgeText}>{item.listingCategory || item.type}</Text>
            </View>
            {featuredBadgeLabel && (
              <View style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }} className="flex-row items-center gap-1">
                <Ionicons name="star" size={10} color="white" />
                <Text className="text-white text-[9px] font-black uppercase tracking-wide">
                  {featuredBadgeLabel}
                </Text>
              </View>
            )}
          </View>

          {/* Location Badge */}
          {Boolean(item.location || item.address) && (
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
                {item.location || item.address}
              </Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <TouchableOpacity
          onPress={() => onView(item)}
          activeOpacity={1}
          onPressIn={() => {
            cardScale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
          }}
          onPressOut={() => {
            cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
          }}
          style={styles.infoSection}
        >
          {/* Row: Title & Price */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-3">
              <Text className="text-orange-500 font-extrabold text-xs uppercase tracking-wider">
                {item.propertyType || item.type}
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
                {typeof item.price === "number" ? `₹${item.price.toLocaleString("en-IN")}` : item.price}
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

          {/* Analytics Block */}
          <View className="flex-row items-center justify-between mt-5 bg-slate-50 border border-slate-100 rounded-xl p-3 gap-2">
            <View className="flex-1 flex-row items-center justify-center gap-2">
              <Ionicons name="eye-outline" size={14} color="#FA4A0C" />
              <View>
                <Text className="text-slate-900 font-black text-xs">{item.views || 0}</Text>
                <Text className="text-slate-400 text-[9px] font-extrabold uppercase">Views</Text>
              </View>
            </View>
            <View className="w-[1px] h-6 bg-slate-200" />
            <View className="flex-1 flex-row items-center justify-center gap-2">
              <Ionicons name="trending-up-outline" size={14} color="#FA4A0C" />
              <View>
                <Text className="text-slate-900 font-black text-xs">{item.leads || item.inquiries || 0}</Text>
                <Text className="text-slate-400 text-[9px] font-extrabold uppercase">Leads</Text>
              </View>
            </View>
            <View className="w-[1px] h-6 bg-slate-200" />
            <View className="flex-1 flex-row items-center justify-center gap-2">
              <Ionicons name="image-outline" size={14} color="#FA4A0C" />
              <View>
                <Text className="text-slate-900 font-black text-xs">{item.images?.length || 0}</Text>
                <Text className="text-slate-400 text-[9px] font-extrabold uppercase">Photos</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Buttons Action Footer — 2 rows */}
        <View style={styles.actionButtonsWrap}>
          {/* Row 1: View · Edit · Delete */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => onView(item)}
              activeOpacity={0.72}
              style={[styles.actionBtn, { backgroundColor: "#FA4A0C", borderColor: "#FA4A0C", flex: 1 }]}
            >
              <Ionicons name="eye-outline" size={14} color="white" />
              <Text className="text-white font-extrabold text-xs ml-1.5">View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onEdit(item)}
              activeOpacity={0.72}
              style={[styles.actionBtn, { borderColor: "#E2E8F0", backgroundColor: "#FFFFFF", flex: 1 }]}
            >
              <Ionicons name="create-outline" size={14} color="#0F172A" />
              <Text className="text-slate-900 font-extrabold text-xs ml-1.5">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDelete(item)}
              activeOpacity={0.72}
              style={[styles.actionBtn, { backgroundColor: "#FEF2F2", borderColor: "#FEE2E2", flex: 1 }]}
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text style={{ color: '#EF4444' }} className="font-extrabold text-xs ml-1.5">Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Feature · Mark Sold */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => onFeature(item)}
              activeOpacity={0.72}
              style={[
                styles.actionBtn,
                {
                  borderColor: item.featured ? "#F59E0B" : "#E2E8F0",
                  backgroundColor: item.featured ? "#FFF9DB" : "#FFFFFF",
                  flex: 1
                }
              ]}
            >
              <Ionicons name={item.featured ? "star" : "star-outline"} size={14} color={item.featured ? "#F59E0B" : "#0F172A"} />
              <Text style={{ color: item.featured ? "#B45309" : "#0F172A" }} className="font-extrabold text-xs ml-1.5">
                {item.featured ? "Featured" : "Feature"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onStatusChange(item)}
              activeOpacity={0.72}
              style={[
                styles.actionBtn,
                {
                  borderColor: item.status?.toLowerCase() === 'sold' ? '#10B981' : '#E2E8F0',
                  backgroundColor: item.status?.toLowerCase() === 'sold' ? '#ECFDF5' : '#FFFFFF',
                  flex: 1
                }
              ]}
            >
              <Ionicons
                name={item.status?.toLowerCase() === 'sold' ? "checkmark-circle" : "pricetag-outline"}
                size={14}
                color={item.status?.toLowerCase() === 'sold' ? '#10B981' : '#0F172A'}
              />
              <Text
                style={{ color: item.status?.toLowerCase() === 'sold' ? '#059669' : '#0F172A' }}
                className="font-extrabold text-xs ml-1.5"
              >
                {item.status?.toLowerCase() === 'sold' ? 'Sold' : 'Mark Sold'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      </Animated.View>
    );
  }
);

// ─── MAIN SCREEN COMPONENT ─────────────────────────────────────────────────────

export default function MyPropertiesScreen() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState("ACTIVE");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [featureConfirmItem, setFeatureConfirmItem] = useState<any | null>(null);
  const [statusConfirmItem, setStatusConfirmItem] = useState<any | null>(null);


  // Status mapping
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'SOLD': 'Sold',
  };

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (activeFilter === 'FEATURED') {
      params.featured = true;
      params.status = 'Active';
    } else if (statusMap[activeFilter]) {
      params.status = statusMap[activeFilter];
    }
    return params;
  }, [activeFilter]);

  const [page, setPage] = useState(1);
  // TanStack Query for loading properties
  const { data: properties = [], isLoading: loading, isFetching, totalPages = 1, refetch } = useMyProperties(
    useMemo(() => ({
      ...queryParams,
      page,
      limit: 5,
    }), [queryParams, page]),
  );

  const {
    list: propertiesList,
    hasMore,
    isLoadingMore,
    initialLoading,
    refreshing,
    loadMore,
    handleRefresh,
  } = usePagination({
    data: properties,
    totalPages,
    isLoading: loading,
    isFetching,
    refetch,
    page,
    setPage,
    resetDeps: [activeFilter],
  });

  // Mutations
  const deleteMutation = useDeleteMyProperty();
  const toggleFeaturedMutation = useToggleFeaturedMyProperty();
  const updateStatusMutation = useUpdateMyPropertyStatus();

  const openDetails = useCallback((property: any) => {
    router.push({ pathname: "/propertyDetail/[id]", params: { id: property.id } });
  }, [router]);

  const handleBack = () => {
    try {
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/profile");
    } catch {
      router.replace("/(tabs)/profile");
    }
  };

  const handleEdit = useCallback(async (item: any) => {
    try {
      const response = await apiClient.get(`/properties/me/${item.id}`);
      if (response.data?.success && response.data.data) {
        useAddPropertyStore.getState().loadPropertyForEdit(response.data.data, '/(myListing)/myProperties');
        router.push("/(tabs)/addProperty");
      } else {
        throw new Error("Failed to load details");
      }
    } catch (err: any) {
      if (__DEV__) {
        console.error("[handleEdit] Error:", err);
      }
      toast.error("Could not load property details for editing.");
    }
  }, [router]);

  const handleFeature = useCallback((item: any) => {
    setFeatureConfirmItem(item);
  }, []);

  const handleStatusChange = useCallback((item: any) => {
    setStatusConfirmItem(item);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId) return;
    try {
      const response = await deleteMutation.mutateAsync(deleteConfirmId);
      if (response && response.success) {
        toast.success("Listing deleted successfully.");
      }
    } catch (err) {
      if (__DEV__) {
        console.error("[handleDelete] Error:", err);
      }
      toast.error("Could not delete property listing.");
    } finally {
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, deleteMutation]);

  const handleDelete = useCallback((item: any) => {
    setDeleteConfirmId(item.id);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <PropertyCard
        item={item}
        index={index}
        onView={openDetails}
        onEdit={handleEdit}
        onFeature={handleFeature}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    ),
    [openDetails, handleEdit, handleFeature, handleDelete, handleStatusChange],
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderFilterChip = useCallback(
    ({ item }: { item: string }) => {
      const isActive = activeFilter === item;
      return (
        <TouchableOpacity
          onPress={() => setActiveFilter(item)}
          style={[styles.filterChip, isActive && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
            {item}
          </Text>
        </TouchableOpacity>
      );
    },
    [activeFilter],
  );

  const filterKeyExtractor = useCallback((item: string) => item, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View className="mb-5 mt-4">
        <FlatList
          data={FILTERS}
          renderItem={renderFilterChip}
          keyExtractor={filterKeyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          nestedScrollEnabled
        />
      </View>
    ),
    [renderFilterChip, filterKeyExtractor],
  );

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="My Properties"
        subtitle="Manage Listings"
        onBack={handleBack}
        rightElement={
          <TouchableOpacity
            onPress={() => {
              useAddPropertyStore.getState().resetAll();
              router.push("/(tabs)/addProperty");
            }}
            className="w-12 h-12 bg-orange-500 rounded-xl items-center justify-center"
          >
            <Plus size={24} color={colors.white} strokeWidth={3} />
          </TouchableOpacity>
        }
      />

      {initialLoading ? (
        <PortfolioSkeleton />
      ) : (
        <FlatList
          data={propertiesList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          initialNumToRender={4}
          windowSize={7}
          getItemLayout={(_, index) => ({
            length: 450,
            offset: 450 * index,
            index,
          })}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
          ListFooterComponent={() => (
            <View>
              {isLoadingMore && <PortfolioCardSkeleton />}
              <LoadMoreButton
                onPress={loadMore}
                loading={isLoadingMore}
                hasMore={hasMore}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <Text className="text-slate-400 font-bold text-sm">No properties listed yet.</Text>
            </View>
          }
        />
      )}

      <ConfirmationOverlay
        visible={Boolean(deleteConfirmId)}
        title="Delete Property?"
        message="This listing will be permanently removed and cannot be recovered."
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
        variant="danger"
      />

      <ConfirmationOverlay
        visible={Boolean(featureConfirmItem)}
        title={featureConfirmItem?.featured ? "Remove Featured Status?" : "Feature Property?"}
        message={
          featureConfirmItem?.featured
            ? "Are you sure you want to remove this property from featured listings?"
            : "Are you sure you want to mark this property as featured? This will highlight it on the platform."
        }
        confirmLabel={featureConfirmItem?.featured ? "Remove" : "Feature"}
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!featureConfirmItem) return;
          const item = featureConfirmItem;
          setFeatureConfirmItem(null);
          try {
            const response = await toggleFeaturedMutation.mutateAsync(item.id);
            if (response && response.success) {
              toast.success(
                response.data?.featured
                  ? "Listing has been successfully marked as featured!"
                  : "Listing has been removed from featured."
              );
            }
          } catch (err: any) {
            if (__DEV__) {
              console.error("[handleFeature] Error:", err);
            }
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              "Could not update featured status. Please check your subscription limits.";
            toast.error(msg);
          }
        }}
        onCancel={() => setFeatureConfirmItem(null)}
        variant={featureConfirmItem?.featured ? "danger" : "warning"}
      />

      <ConfirmationOverlay
        visible={Boolean(statusConfirmItem)}
        title={
          statusConfirmItem?.status?.toLowerCase() === 'sold'
            ? 'Reactivate Property?'
            : 'Mark as Sold?'
        }
        message={
          statusConfirmItem?.status?.toLowerCase() === 'sold'
            ? 'This will reactivate the property and make it visible to buyers again.'
            : 'This will mark the property as sold and hide it from active listings.'
        }
        confirmLabel={
          statusConfirmItem?.status?.toLowerCase() === 'sold'
            ? 'Reactivate'
            : 'Mark Sold'
        }
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!statusConfirmItem) return;
          const item = statusConfirmItem;
          setStatusConfirmItem(null);
          try {
            const isSold = item.status?.toLowerCase() === 'sold';
            const newStatus = isSold ? 'Active' : 'Sold';
            const response = await updateStatusMutation.mutateAsync({ id: item.id, status: newStatus });
            if (response && response.success) {
              toast.success(
                isSold
                  ? 'Property has been reactivated successfully!'
                  : 'Property has been marked as sold.'
              );
            }
          } catch (err: any) {
            if (__DEV__) {
              console.error('[handleStatusChange] Error:', err);
            }
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              'Could not update property status.';
            toast.error(msg);
          }
        }}
        onCancel={() => setStatusConfirmItem(null)}
        variant={
          statusConfirmItem?.status?.toLowerCase() === 'sold'
            ? 'warning'
            : 'danger'
        }
      />
    </ScreenWrapper>
  );
}

// ─── STYLESHEET ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 54,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  carouselContainer: {
    height: 280,
    position: "relative",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  infoSection: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  actionButtonsWrap: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteBtn: {
    width: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeGlass: {
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#1E293B",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    elevation: 4,
  },
  filterChipText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  filterChipTextActive: {
    color: "#fff",
  },
});
