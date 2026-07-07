import PropertyList from "@/components/property/PropertyList";
import { usePropertyDetail, useSimilarProperties, useTogglePropertySave, useCreatePropertyEnquiry, useCreateCallEnquiry, useDeleteMyProperty } from "@/hooks/usePropertyHook";
import { useAuthStore } from "@/store/authStore";
import colors from "@/theme/colors";
import { apiClient } from "@/api/apiClient";
import { useAddPropertyStore } from "@/store/addPropertyStore";
import ConfirmationOverlay from "@/components/ui/ConformationOverlay";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  ArrowLeft,
  Bed,
  Car,
  Compass,
  Droplets,
  Dumbbell,
  Heart,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  Pause,
  Phone,
  Play,
  Share2,
  Shield,
  Sofa,
  Star,
  Building,
  Ruler,
  Map,
  Briefcase,
  Zap,
  CircleDollarSign,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ScreenHeader from "@/components/common/ScreenHeader";
import Shimmer from "@/components/common/Shimmer";
import {
  Dimensions,
  FlatList,
  Linking,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackHeader from "@/components/common/BackHeader";
import { toast } from 'react-hot-toast/headless';
import { useNavigationState, useIsFocused } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 300;
const DUMMY_VIDEO_URI = "https://www.w3schools.com/html/mov_bbb.mp4";
const VIDEO_SLIDE_KEY = "__video__";

const AMENITY_ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Layers,
  Shield,
  Car,
  Dumbbell,
  Droplets,
  Sofa,
  Compass,
};

function getDynamicSpecs(type: string, details: any, area: string) {
  const specs: { label: string; value: string; icon: any }[] = [];

  if (type === "Flat/Apartment" || type === "Penthouse" || type === "Builder Floor") {
    specs.push({
      label: "Bedrooms",
      value: details.bhk !== undefined && details.bhk !== null ? `${details.bhk} BHK` : "N/A",
      icon: Bed,
    });
    specs.push({
      label: "Built-up Area",
      value: area && area !== "N/A" ? area : (details.superBuiltUpArea ? `${details.superBuiltUpArea} sqft` : details.builtUpArea ? `${details.builtUpArea} sqft` : details.carpetArea ? `${details.carpetArea} sqft` : "N/A"),
      icon: Layers,
    });
    specs.push({
      label: "Facing",
      value: details.facing ?? "N/A",
      icon: Compass,
    });
    specs.push({
      label: "Furnishing",
      value: details.furnishing ?? "N/A",
      icon: Sofa,
    });
  } else if (type === "Villa/Independent House") {
    specs.push({
      label: "Bedrooms",
      value: details.bhk !== undefined && details.bhk !== null ? `${details.bhk} BHK` : "N/A",
      icon: Bed,
    });
    specs.push({
      label: "Plot Area",
      value: details.plotArea ? `${details.plotArea} sqft` : area !== "N/A" ? area : "N/A",
      icon: Map,
    });
    specs.push({
      label: "Floors",
      value: details.numberOfFloors ? String(details.numberOfFloors) : "N/A",
      icon: Building,
    });
    specs.push({
      label: "Furnishing",
      value: details.furnishing ?? "N/A",
      icon: Sofa,
    });
  } else if (type === "Office Space") {
    specs.push({
      label: "Cabins",
      value: details.cabinCount !== undefined ? String(details.cabinCount) : "N/A",
      icon: Building,
    });
    specs.push({
      label: "Open Desks",
      value: details.openDesks !== undefined ? String(details.openDesks) : "N/A",
      icon: Briefcase,
    });
    specs.push({
      label: "Carpet Area",
      value: area !== "N/A" ? area : (details.carpetArea ? `${details.carpetArea} sqft` : "N/A"),
      icon: Layers,
    });
    specs.push({
      label: "Furnishing",
      value: details.furnishing ?? "N/A",
      icon: Sofa,
    });
  } else if (type === "Shop") {
    specs.push({
      label: "Shop Floor",
      value: details.shopFloor ?? "N/A",
      icon: Building,
    });
    specs.push({
      label: "Area",
      value: area !== "N/A" ? area : "N/A",
      icon: Layers,
    });
    specs.push({
      label: "Ceiling Height",
      value: details.ceilingHeight ? `${details.ceilingHeight} ft` : "N/A",
      icon: Ruler,
    });
    specs.push({
      label: "Footfall",
      value: details.footfallRating ?? "N/A",
      icon: Star,
    });
  } else if (type === "Showroom") {
    specs.push({
      label: "Showroom Area",
      value: details.showroomArea ? `${details.showroomArea} sqft` : area !== "N/A" ? area : "N/A",
      icon: Layers,
    });
    specs.push({
      label: "Total Floors",
      value: details.numberOfShowroomFloors ? String(details.numberOfShowroomFloors) : "N/A",
      icon: Building,
    });
    specs.push({
      label: "Glass Front",
      value: details.glassFront === true ? "Yes" : details.glassFront === false ? "No" : "N/A",
      icon: Shield,
    });
    specs.push({
      label: "AC Installed",
      value: details.acInstalled === true ? "Yes" : details.acInstalled === false ? "No" : "N/A",
      icon: Sofa,
    });
  } else if (type === "Warehouse/Godown") {
    specs.push({
      label: "Warehouse Area",
      value: details.warehouseArea ? `${details.warehouseArea} sqft` : area !== "N/A" ? area : "N/A",
      icon: Layers,
    });
    specs.push({
      label: "Height",
      value: details.warehouseHeight ? `${details.warehouseHeight} ft` : "N/A",
      icon: Ruler,
    });
    specs.push({
      label: "Loading Docks",
      value: details.numberOfDocks !== undefined ? String(details.numberOfDocks) : "N/A",
      icon: Car,
    });
    specs.push({
      label: "Truck Access",
      value: details.truckAccess === true ? "Yes" : details.truckAccess === false ? "No" : "N/A",
      icon: Car,
    });
  } else if (type === "Residential Plot" || type.toLowerCase().includes("plot")) {
    const dims = details.plotLength && details.plotWidth ? `${details.plotLength} × ${details.plotWidth} ft` : "N/A";
    specs.push({
      label: "Plot Area",
      value: details.plotAreaSqFt ? `${details.plotAreaSqFt} sqft` : area !== "N/A" ? area : "N/A",
      icon: Map,
    });
    specs.push({
      label: "Dimensions",
      value: dims,
      icon: Ruler,
    });
    specs.push({
      label: "Gated Layout",
      value: details.gatedLayout === true ? "Yes" : details.gatedLayout === false ? "No" : "N/A",
      icon: Shield,
    });
    specs.push({
      label: "Boundary Wall",
      value: details.boundaryWall === true ? "Yes" : details.boundaryWall === false ? "No" : "N/A",
      icon: Shield,
    });
  } else if (type === "Agricultural Land" || type.toLowerCase().includes("land")) {
    specs.push({
      label: "Land Area",
      value: details.areaAcres ? `${details.areaAcres} Acres` : area !== "N/A" ? area : "N/A",
      icon: Map,
    });
    specs.push({
      label: "Soil Type",
      value: details.soilType ?? "N/A",
      icon: Layers,
    });
    specs.push({
      label: "Water Source",
      value: Array.isArray(details.waterSource) ? details.waterSource.join(", ") : details.waterSource ?? "N/A",
      icon: Droplets,
    });
    specs.push({
      label: "Fencing",
      value: details.fencing === true ? "Yes" : details.fencing === false ? "No" : "N/A",
      icon: Shield,
    });
  } else {
    specs.push({
      label: "Property Type",
      value: type,
      icon: Building,
    });
    specs.push({
      label: "Area",
      value: area ?? "N/A",
      icon: Layers,
    });
    specs.push({
      label: "Facing",
      value: details.facing ?? "N/A",
      icon: Compass,
    });
    specs.push({
      label: "Furnishing",
      value: details.furnishing ?? "N/A",
      icon: Sofa,
    });
  }
  return specs;
}

function getDynamicMiniInfo(type: string, details: any, fallbackParking: string) {
  const mini: { label: string; value: string; icon: any }[] = [];
  if (type === "Flat/Apartment" || type === "Penthouse" || type === "Builder Floor") {
    mini.push({ label: "Property Type", value: type, icon: Layers });
    mini.push({ label: "Parking", value: details.parkingSlots ? `${details.parkingSlots} Slots` : fallbackParking, icon: Car });
  } else if (type === "Villa/Independent House") {
    mini.push({ label: "Property Type", value: type, icon: Layers });
    mini.push({ label: "Road Width", value: details.roadWidth ? `${details.roadWidth} ft` : "N/A", icon: Ruler });
  } else if (type === "Office Space") {
    mini.push({ label: "IT Ready", value: details.itReady === true ? "Yes" : "No", icon: Shield });
    mini.push({ label: "DG Backup", value: details.dgBackup === true ? "Yes" : "No", icon: Zap });
  } else if (type === "Shop") {
    mini.push({ label: "Mezzanine Floor", value: details.mezzanineFloor === true ? "Yes" : "No", icon: Layers });
    mini.push({ label: "Corner Shop", value: details.cornerShop === true ? "Yes" : "No", icon: Compass });
  } else if (type === "Showroom") {
    mini.push({ label: "Parking Available", value: details.parkingAvailable === true ? "Yes" : "No", icon: Car });
    mini.push({ label: "Glass Front", value: details.glassFront === true ? "Yes" : "No", icon: Shield });
  } else if (type === "Warehouse/Godown") {
    mini.push({ label: "MIDC Approved", value: details.midc === true ? "Yes" : "No", icon: Shield });
    mini.push({ label: "Office Space", value: details.officeSpaceInside === true ? "Yes" : "No", icon: Building });
  } else if (type === "Residential Plot" || type.toLowerCase().includes("plot")) {
    mini.push({ label: "Zone Type", value: details.zoneType ?? "Residential", icon: Map });
    mini.push({ label: "FSI Available", value: details.fsiAvailable ? String(details.fsiAvailable) : "N/A", icon: Ruler });
  } else if (type === "Agricultural Land" || type.toLowerCase().includes("land")) {
    mini.push({ label: "City Distance", value: (details.distanceFromCity !== undefined && details.distanceFromCity !== null && details.distanceFromCity !== '') ? `${details.distanceFromCity} km` : "N/A", icon: MapPin });
    mini.push({ label: "Road Access", value: details.roadAccess === true ? "Yes" : details.roadAccess === false ? "No" : "N/A", icon: Car });
  } else {
    mini.push({ label: "Property Type", value: type, icon: Layers });
    mini.push({ label: "Parking", value: fallbackParking, icon: Car });
  }
  return mini;
}

function getSecondarySpecsList(type: string, details: any) {
  const list: { label: string; value: string }[] = [];
  const add = (label: string, val: any) => {
    if (val !== undefined && val !== null && val !== "" && val !== "N/A" && val !== false) {
      if (typeof val === "boolean") {
        list.push({ label, value: val ? "Yes" : "No" });
      } else {
        list.push({ label, value: String(val) });
      }
    }
  };

  add("Bathrooms", details.bathrooms);
  add("Balconies", details.balconies);
  if (details.floorNumber !== undefined && details.floorNumber !== null && details.floorNumber !== "" &&
      details.totalFloors !== undefined && details.totalFloors !== null && details.totalFloors !== "") {
    list.push({ label: "Floor Level", value: `${details.floorNumber} of ${details.totalFloors}` });
  } else {
    add("Floor Number", details.floorNumber);
    add("Total Floors", details.totalFloors);
  }
  add("Furnishing Status", details.furnishing);
  add("Facing", details.facing);
  add("Age of Property", details.ageOfProperty);
  add("Floor Type", details.floorType);
  add("Water Supply Source", details.waterSupply);
  add("Electricity Status", details.electricityStatus);
  add("Ownership Type", details.ownershipType);
  add("Ready To Move", details.readyToMove);
  if (details.petFriendly !== undefined && details.petFriendly !== null && details.petFriendly !== "") {
    list.push({ label: "Pet Friendly", value: details.petFriendly ? "Yes" : "No" });
  }
  if (details.nonVegAllowed !== undefined && details.nonVegAllowed !== null && details.nonVegAllowed !== "") {
    list.push({ label: "Non-Veg Allowed", value: details.nonVegAllowed ? "Yes" : "No" });
  }
  add("Number of Floors", details.numberOfFloors);
  add("Parking Slots Available", details.parkingSlots);
  add("Private Garden", details.hasGarden);
  add("Corner Property", details.cornerProperty);
  add("Gated Society", details.gatedSociety);
  add("Independent Entry", details.independentEntry);
  if (details.roadWidth) list.push({ label: "Road Width", value: `${details.roadWidth} ft` });

  if (details.terraceArea) list.push({ label: "Terrace Area", value: `${details.terraceArea} sqft` });
  add("Private Lift", details.privateLift);
  add("Is Duplex", details.isDuplex);
  add("Servant Room Available", details.servantRoom);
  add("Private Pool", details.privatePool);
  add("Total Units in Building", details.totalUnitsInBuilding);
  add("Floor Ownership Type", details.floorOwnershipType);
  add("Stilt Parking Available", details.stiltParking);

  add("Cabin Count", details.cabinCount);
  add("Open Desks", details.openDesks);
  add("Pantry Facility", details.hasPantry);
  add("IT/Server Ready", details.itReady);
  add("Conference Room", details.conferenceRoom);
  add("Reception Area", details.receptionArea);
  add("Central Air Conditioning", details.centralAC);
  add("Office Fire Safety", details.officeFireSafety);
  add("DG Power Backup", details.dgBackup);

  add("Shop Level", details.shopFloor);
  if (details.frontage) list.push({ label: "Frontage Length", value: `${details.frontage} ft` });
  if (details.depth) list.push({ label: "Shop Depth", value: `${details.depth} ft` });
  if (details.ceilingHeight) list.push({ label: "Ceiling Height", value: `${details.ceilingHeight} ft` });
  add("Main Road Facing", details.mainRoadFacing);
  add("Corner Shop Layout", details.cornerShop);
  add("Mezzanine Floor", details.mezzanineFloor);
  add("Has Washroom/Toilet", details.hasWashroom);
  add("Footfall Density", details.footfallRating);
  if (Array.isArray(details.suitableFor)) {
    list.push({ label: "Suitable For Businesses", value: details.suitableFor.join(", ") });
  }

  if (details.showroomArea) list.push({ label: "Showroom Total Area", value: `${details.showroomArea} sqft` });
  add("Showroom Floors", details.numberOfShowroomFloors);
  add("Full Glass Frontage", details.glassFront);
  add("Customer Parking Slots", details.parkingAvailable);
  add("Air Conditioning Installed", details.acInstalled);

  if (details.warehouseArea) list.push({ label: "Warehouse Area Size", value: `${details.warehouseArea} sqft` });
  if (details.warehouseHeight) list.push({ label: "Clear Ceiling Height", value: `${details.warehouseHeight} ft` });
  add("Container Truck Access", details.truckAccess);
  add("Loading/Unloading Docks", details.numberOfDocks);
  add("Floor Load Capacity", details.floorLoadCapacity);
  if (details.openYardArea) list.push({ label: "Open Yard Area Size", value: `${details.openYardArea} sqft` });
  if (details.powerLoad) list.push({ label: "Power Load Allocation", value: `${details.powerLoad} kW` });
  add("Water Supply for Warehouse", details.waterSupplyWarehouse);
  add("Office Space Inside Warehouse", details.officeSpaceInside);
  add("MIDC Land Approved", details.midc);

  if (details.plotAreaSqFt) list.push({ label: "Plot Area (SqFt)", value: `${details.plotAreaSqFt} sq.ft.` });
  if (details.plotAreaSqM) list.push({ label: "Plot Area (SqM)", value: `${details.plotAreaSqM} sq.m.` });
  if (details.plotLength) list.push({ label: "Plot Length Dimension", value: `${details.plotLength} ft` });
  if (details.plotWidth) list.push({ label: "Plot Width Dimension", value: `${details.plotWidth} ft` });
  add("Boundary Wall Built", details.boundaryWall);
  add("Gated Layout Project", details.gatedLayout);
  add("Corner Plot Position", details.cornerPlot);
  if (Array.isArray(details.approvedBy)) {
    list.push({ label: "Authorized Approvals", value: details.approvedBy.join(", ") });
  }
  add("Development Zone Type", details.zoneType);
  add("FSI Limits Available", details.fsiAvailable);

  if (details.areaAcres) list.push({ label: "Land Area (Acres)", value: `${details.areaAcres} Acres` });
  if (details.areaHectares) list.push({ label: "Land Area (Hectares)", value: `${details.areaHectares} Hectares` });
  if (Array.isArray(details.waterSource)) {
    list.push({ label: "Water Sources Available", value: details.waterSource.join(", ") });
  }
  add("Direct Road Access", details.roadAccess);
  add("Access Road Construction", details.roadType);
  add("Fencing Surrounding Land", details.fencing);
  add("Trees / Plantation Type", details.treesPlantation);
  add("Irrigation System", details.irrigationType);
  add("Electricity Power Connection", details.electricityLand);
  if (details.distanceFromCity !== undefined && details.distanceFromCity !== null && details.distanceFromCity !== '') list.push({ label: "Distance from City Limits", value: `${details.distanceFromCity} km` });
  add("7/12 Extract Document Available", details.sevenTwelveExtract);
  add("Land Soil Quality", details.soilType);

  add("NA Order Approval Status", details.naOrderStatus);
  add("NA Order Reference Number", details.naOrderNumber);

  return list;
}

function VideoSlide({ videoUrl, isActive }: { videoUrl: string; isActive: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (__DEV__) {
      console.log("VIDEO MOUNTED");
    }
    return () => {
      if (__DEV__) {
        console.log("VIDEO UNMOUNTED");
      }
    };
  }, []);
  
  const safeUri = videoUrl ? decodeURIComponent(videoUrl) : null;
  const player = useVideoPlayer(safeUri ? { uri: safeUri } : null, (p) => {
    p.loop = true;
    p.bufferOptions = {
      maxBufferBytes: 2 * 1024 * 1024, // 2MB buffer limit to prevent Android OOM
      prioritizeTimeOverSizeThreshold: false,
    };
  });

  const isFocused = useIsFocused();
  useEffect(() => {
    if ((!isActive || !isFocused) && player && isPlaying) {
      player.pause();
      setIsPlaying(false);
    }
  }, [isActive, isFocused, player, isPlaying]);

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const openFullscreen = () => {
    if (player) player.pause();
    setIsPlaying(false);
    setIsFullscreen(true);
  };

  if (!safeUri || !player) return null;

  return (
    <View style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}>
      <Pressable onPress={openFullscreen} style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}>
        <VideoView
          player={player}
          style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
          contentFit="cover"
          nativeControls={false}
        />
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={togglePlay}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.924)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPlaying ? (
              <Pause size={28} color="white" fill="white" />
            ) : (
              <Play size={28} color="white" fill="white" />
            )}
          </TouchableOpacity>
          <View
            style={{
              position: "absolute",
              bottom: 12,
              left: 40,
              backgroundColor: "rgba(0,0,0,0.5)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Play size={10} color="white" fill="white" />
            <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
              Tap for Fullscreen
            </Text>
          </View>
        </View>
      </Pressable>

      {isFullscreen && (
        <FullscreenVideoPlayer
          videoUrl={videoUrl}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </View>
  );
}

function FullscreenVideoPlayer({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const safeUri = videoUrl ? decodeURIComponent(videoUrl) : null;
  const player = useVideoPlayer(safeUri ? { uri: safeUri } : null, (p) => {
    p.loop = false;
    p.bufferOptions = {
      maxBufferBytes: 2 * 1024 * 1024, // 2MB buffer limit to prevent Android OOM
      prioritizeTimeOverSizeThreshold: false,
    };
    p.play();
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay') {
        setLoading(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [player]);

  if (!safeUri || !player) return null;

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={true}
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          nativeControls={true}
        />

        {loading && (
          <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            player.pause();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: 40,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function TopBadge({
  label,
  variant,
}: {
  label: string;
  variant: "featured" | "type" | "verified";
}) {
  const bg = {
    featured: "bg-orange-500",
    type: "bg-orange-100",
    verified: "bg-emerald-100",
  };
  const text = {
    featured: "text-white",
    type: "text-orange-700",
    verified: "text-emerald-700",
  };

  return (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${bg[variant]}`}>
      {variant === "featured" && (
        <Star size={11} color={colors.white} fill={colors.white} />
      )}
      <Text className={`text-[11px] font-bold ml-1 ${text[variant]}`}>{label}</Text>
    </View>
  );
}

function SpecCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}) {
  return (
    <View
      // style={shadows.cardSubtle}
      className="w-[48%] bg-white border border-slate-200 rounded-2xl p-4 mb-3"
    >
      <Icon size={18} color={colors.primary} strokeWidth={2.5} />
      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-3">
        {label}
      </Text>
      <Text className="text-sm font-black text-slate-900 mt-1">{value}</Text>
    </View>
  );
}

function MiniInfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  return (
    <View
      // style={shadows.cardSubtle}
      className="flex-1 bg-white border border-slate-200 rounded-2xl p-4"
    >
      <Icon size={18} color={colors.primary} />
      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2">
        {label}
      </Text>
      <Text className="text-sm font-black text-slate-900 mt-0.5">{value}</Text>
    </View>
  );
}

function AmenityChip({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  return (
    <View className="w-[48%] flex-row items-center bg-white border border-slate-200 rounded-2xl px-3 py-3 mb-3">
      <View className="w-9 h-9 rounded-full bg-orange-50 items-center justify-center">
        <Icon size={16} color={colors.primary} />
      </View>
      <Text className="text-[13px] font-semibold text-slate-800 ml-2.5 flex-1">
        {label}
      </Text>
    </View>
  );
}

const shimmerColors = ["#E2E8F0", "#F8FAFC", "#E2E8F0"] as [string, string, string];

function SkeletonBlock({
  width = "100%",
  height = 16,
  borderRadius = 12,
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

function PropertyDetailSkeleton() {
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <SkeletonBlock height={300} width="100%" borderRadius={0} />

        <View className="px-5 pt-5">
          <View className="flex-row items-start justify-between mb-5">
            <View className="flex-1 mr-3">
              <SkeletonBlock width="35%" height={12} borderRadius={999} style={{ marginBottom: 10 }} />
              <SkeletonBlock width="75%" height={24} borderRadius={10} style={{ marginBottom: 10 }} />
              <SkeletonBlock width="55%" height={14} borderRadius={10} />
            </View>
            <SkeletonBlock width={42} height={42} borderRadius={999} />
          </View>

          <View className="flex-row flex-wrap justify-between mb-4">
            {[0, 1, 2, 3].map((item) => (
              <View key={item} className="w-[48%] bg-white border border-slate-200 rounded-2xl p-4 mb-3">
                <SkeletonBlock width={18} height={18} borderRadius={6} />
                <SkeletonBlock width="60%" height={12} borderRadius={8} style={{ marginTop: 10, marginBottom: 8 }} />
                <SkeletonBlock width="70%" height={16} borderRadius={8} />
              </View>
            ))}
          </View>

          <View className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
            <SkeletonBlock width="30%" height={12} borderRadius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="100%" height={14} borderRadius={8} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="90%" height={14} borderRadius={8} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="82%" height={14} borderRadius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="100%" height={44} borderRadius={999} />
          </View>

          <View className="mb-4">
            <SkeletonBlock width="35%" height={12} borderRadius={8} style={{ marginBottom: 12 }} />
            <View className="flex-row flex-wrap justify-between">
              {[0, 1, 2, 3].map((item) => (
                <View key={item} className="w-[48%] flex-row items-center bg-white border border-slate-200 rounded-2xl px-3 py-3 mb-3">
                  <SkeletonBlock width={32} height={32} borderRadius={999} />
                  <SkeletonBlock width="65%" height={14} borderRadius={8} style={{ marginLeft: 10 }} />
                </View>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <SkeletonBlock width="40%" height={12} borderRadius={8} style={{ marginBottom: 12 }} />
            <View className="flex-row gap-3">
              <SkeletonBlock width={120} height={110} borderRadius={20} />
              <SkeletonBlock width={120} height={110} borderRadius={20} />
              <SkeletonBlock width={120} height={110} borderRadius={20} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);
  const openAuth = useAuthStore((s) => s.openAuth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [unlockedPhone, setUnlockedPhone] = useState<string | null>(null);
  const [isPhoneUnlocked, setIsPhoneUnlocked] = useState(false);

  const user = useAuthStore((s) => s.user);
  const routes = useNavigationState((state) => state?.routes || []);

  const { data: property, isLoading: propertyLoading, refetch } = usePropertyDetail(
    id,
    isAuthHydrated,
  );
  const { data: similarProperties = [] } = useSimilarProperties(
    id,
    { limit: 4 },
    isAuthHydrated,
  );
  const { mutate: togglePropertySave, isPending: isSaving } = useTogglePropertySave(id);
  const { mutateAsync: createEnquiry } = useCreatePropertyEnquiry(id);
  const { mutateAsync: createCallEnquiry } = useCreateCallEnquiry();

  useEffect(() => {
    if (__DEV__) {
      console.log("STACK DEPTH:", routes.length);
    }
  }, [routes]);

  const renderHeroItem = useCallback(({ item, index }: { item: string; index: number }) => {
    if (item === VIDEO_SLIDE_KEY) {
      return (
        <VideoSlide
          videoUrl={property?.video || DUMMY_VIDEO_URI}
          isActive={activeSlide === index}
        />
      );
    }
    return (
      <Image
        source={{ uri: item }}
        style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
    );
  }, [property?.video, activeSlide]);

  const heroKeyExtractor = useCallback((_: any, index: number) => index.toString(), []);

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const deleteMutation = useDeleteMyProperty();

  const isOwner = useMemo(() => {
    if (!user?._id || !property) return false;
    const prop = property as any;
    const brokerId = prop.brokerId?._id || prop.brokerId;
    return brokerId === user._id || prop.ownerId === user._id || prop.owner === user._id;
  }, [user, property]);

  const handleEdit = async () => {
    try {
      const response = await apiClient.get(`/properties/me/${id}`);
      if (response.data?.success && response.data.data) {
        useAddPropertyStore.getState().loadPropertyForEdit(response.data.data, `/propertyDetail/${id}`);
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
  };

  const handleDeleteConfirm = async () => {
    setDeleteConfirmVisible(false);
    try {
      const response = await deleteMutation.mutateAsync(id!);
      if (response && response.success) {
        toast.success("Listing deleted successfully.");
        router.back();
      }
    } catch (err) {
      if (__DEV__) {
        console.error("[handleDelete] Error:", err);
      }
      toast.error("Could not delete property listing.");
    }
  };

  const maskPhone = (phoneStr: string) => {
    if (!phoneStr) return "••••••••••";
    const cleaned = phoneStr.replace(/[^0-9]/g, "");
    if (cleaned.length >= 12) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)}••••${cleaned.substring(cleaned.length - 3)}`;
    }
    if (cleaned.length >= 10) {
      return `${cleaned.substring(0, 3)}••••${cleaned.substring(cleaned.length - 3)}`;
    }
    return "••••••••••";
  };

  const slides = useMemo(() => {
    const images = property?.images ?? [];
    if (property?.video) {
      return [...images, VIDEO_SLIDE_KEY];
    }
    return images;
  }, [property]);

  const specsList = useMemo(() => {
    if (!property) return [];
    return getSecondarySpecsList(property.type, property.details);
  }, [property]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsFavorite(Boolean(property?.isSaved));
  }, [property?.isSaved]);

  const handleHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeSlide) setActiveSlide(index);
  };

  const handleCall = async () => {
    if (!isAuthenticated) {
      openAuth("viewContact");
      return;
    }

    let phone = "";
    try {
      // Always log the call enquiry first — response gives us broker mobile
      const res = await createCallEnquiry(id);
      phone = res.data?.brokerDetails?.mobile ?? "";
      if (phone) {
        setUnlockedPhone(phone);
      }
    } catch (e) {
      if (__DEV__) {
        console.log("Call enquiry API error:", e);
      }
    }

    // Fallback to property data if API didn't return mobile
    if (!phone) {
      const raw = unlockedPhone || property?.broker?.phoneFull || property?.broker?.phone || "";
      phone = raw.replace(/[^0-9]/g, "");
    } else {
      phone = phone.replace(/[^0-9]/g, "");
    }

    if (phone) {
      if (phone.length === 10) phone = `91${phone}`;
      setIsPhoneUnlocked(true);
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsApp = async () => {
    if (!isAuthenticated) {
      openAuth("viewContact");
      return;
    }

    let phone = "";
    try {
      // Always log the WhatsApp enquiry first — response gives us broker mobile
      const res = await createCallEnquiry(id);
      phone = res.data?.brokerDetails?.mobile ?? "";
      if (phone) {
        setUnlockedPhone(phone);
      }
    } catch (e) {
      if (__DEV__) {
        console.log("WhatsApp enquiry API error:", e);
      }
    }

    // Fallback to property data if API didn't return mobile
    if (!phone) {
      const raw = unlockedPhone || property?.broker?.phoneFull || property?.broker?.phone || "";
      phone = raw.replace(/[^0-9]/g, "");
    } else {
      phone = phone.replace(/[^0-9]/g, "");
    }

    if (phone) {
      if (phone.length === 10) phone = `91${phone}`;
      setIsPhoneUnlocked(true);
      const msg = encodeURIComponent(
        `Hi, I am interested in "${property?.title ?? "this property"}" listed on Nagpur Prime Property.`,
      );
      Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
    }
  };

  const handleShare = () => {
    Share.share({
      message: `Check out this property on Nagpur Prime Property: ${property?.title} at ${property?.address}. Price: ₹${property?.price}. More details: https://nagpurprimeproperty.com/propertyDetail/${id}`,
    }).catch((error) => {
      if (__DEV__) {
        console.log("Error sharing:", error);
      }
    });
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      openAuth("saveProperty");
      return;
    }
    setIsFavorite((current) => !current);
    togglePropertySave(undefined as never);
  };

  if (!isMounted) return null;

  if (propertyLoading || !property) {
    return <PropertyDetailSkeleton />;
  }

  const details = (property.details || {}) as any;
  const pricing = (property.pricing || {}) as any;
  const bottomPad = insets.bottom + 88;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Hero: images + video (last slide) */}
        <View className="relative rounded-br-sm overflow-hidden" style={{ height: HERO_HEIGHT }}>
          <FlatList
            data={slides}
            keyExtractor={heroKeyExtractor}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onScroll={handleHeroScroll}
            scrollEventThrottle={16}
            removeClippedSubviews={Platform.OS === 'android'}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={2}
            renderItem={renderHeroItem}
          />

          {/* Back button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.back()}
            className="absolute top-10 left-4 z-10"
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.32)", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={20} color={colors.white} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Slide indicators */}
          <View
            className="absolute bottom-4 left-0 right-0 flex-row items-center justify-center"
            pointerEvents="none"
          >
            {slides.map((slide, index) => {
              const isActive = activeSlide === index;
              const isVideo = slide === VIDEO_SLIDE_KEY;

              if (isVideo) {
                return (
                  <View
                    key={index}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      marginHorizontal: 3,
                      backgroundColor: isActive
                        ? colors.white
                        : "rgba(255,255,255,0.35)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: isActive ? 0 : 1,
                      borderColor: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Play
                      size={9}
                      color={isActive ? colors.primary : colors.white}
                      fill={isActive ? colors.primary : colors.white}
                    />
                  </View>
                );
              }  

              return (
                <View
                  key={index}
                  style={{
                    width: isActive ? 20 : 7,
                    height: 7,
                    borderRadius: 4,
                    marginHorizontal: 3,
                    backgroundColor: isActive
                      ? colors.primary
                      : "rgba(255,255,255,0.55)",
                  }}
                />
              );
            })}
          </View>
        </View>

        <View className="px-5 pt-5">
          <View className="flex-row flex-wrap gap-2 mb-4">
            {property.featured && (
              <TopBadge label="Featured" variant="featured" />
            )}
            <TopBadge label={property.type} variant="type" />
            {property.verified && (
              <TopBadge label="Verified" variant="verified" />
            )}
          </View>

          <Text className="text-[22px] font-black text-slate-900 leading-8 tracking-tight">
            {property.title}
          </Text>
          <View className="flex-row items-center mt-2 mb-5">
            <MapPin size={16} color={colors.primary} strokeWidth={2.5} />
            <Text className="text-[14px] font-medium text-slate-500 ml-1.5">
              {property.address}
            </Text>
          </View>

          <View className="flex-row items-start justify-between mb-6">
            <View>
              <Text className="text-[32px] font-black text-orange-500 tracking-tight">
                ₹{property.price}
              </Text>
              <Text className="text-[13px] font-medium text-slate-400 mt-0.5">
                ~ ₹{property.pricePerSqft}/sqft
              </Text>
            </View>
            <View className="flex-row gap-2">
              {!isOwner && (
                <TouchableOpacity
                  onPress={handleToggleFavorite}
                  disabled={isSaving}
                  className="w-11 h-11 bg-white border border-slate-200 rounded-xl items-center justify-center"
                >
                  <Heart
                    size={20}
                    color={isFavorite ? colors.error : colors.textSecondary}
                    fill={isFavorite ? colors.error : "transparent"}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleShare}
                className="w-11 h-11 bg-white border border-slate-200 rounded-xl items-center justify-center"
              >
                <Share2 size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {getDynamicSpecs(property.type, property.details, property.area).map((spec, index) => (
              <SpecCard
                key={index}
                label={spec.label}
                value={spec.value}
                icon={spec.icon}
              />
            ))}
          </View>

          <View className="flex-row gap-3 mb-8">
            {getDynamicMiniInfo(property.type, property.details, property.parking).map((mini, index) => (
              <View key={index} className="flex-1">
                <MiniInfoCard
                  label={mini.label}
                  value={mini.value}
                  icon={mini.icon}
                />
              </View>
            ))}
          </View>

          {isOwner && (
            <View className="mb-8">
              <Text className="text-[18px] font-black text-slate-900 mb-4">
                Listing Analytics
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 items-center">
                  <Ionicons name="eye-outline" size={20} color={colors.primary} />
                  <Text className="text-xl font-black text-slate-900 mt-2">{property.views || 0}</Text>
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Views</Text>
                </View>
                <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 items-center">
                  <Ionicons name="trending-up-outline" size={20} color={colors.primary} />
                  <Text className="text-xl font-black text-slate-900 mt-2">{property.inquiries || (property as any).leads || 0}</Text>
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Leads</Text>
                </View>
                <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 items-center">
                  <Ionicons name="image-outline" size={20} color={colors.primary} />
                  <Text className="text-xl font-black text-slate-900 mt-2">{property.images?.length || 0}</Text>
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Media Uploads</Text>
                </View>
              </View>
            </View>
          )}

          <Text className="text-[18px] font-black text-slate-900 mb-3">
            About this property
          </Text>
          <Text className="text-[14px] font-medium text-slate-600 leading-6 mb-8">
            {property.description}
          </Text>

          {/* Pricing & Terms */}
          {property.pricing && (
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[18px] font-black text-slate-900">
                  Pricing & Financial Terms
                </Text>
                <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/70">
                  <CircleDollarSign size={12} color={colors.primary} />
                  <Text className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                    Financials
                  </Text>
                </View>
              </View>
              <View className="bg-white border border-slate-200 rounded-2xl p-5 gap-3.5">
                {property.listingCategory === "Rental" ? (
                  <>
                    {/* Agri land uses annualLease; all other types use monthlyRent */}
                    {property.type === "Agricultural Land" ? (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Annual Lease</Text>
                        <Text className="text-sm font-black text-slate-900">₹{pricing.annualLease ?? "N/A"}</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Rent</Text>
                        <Text className="text-sm font-black text-slate-900">₹{pricing.monthlyRent ?? "N/A"}</Text>
                      </View>
                    )}
                    {pricing.securityDeposit !== undefined && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security Deposit</Text>
                        <Text className="text-sm font-black text-slate-900">₹{pricing.securityDeposit}</Text>
                      </View>
                    )}
                    {pricing.maintenance !== undefined && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maintenance (Monthly)</Text>
                        <Text className="text-sm font-black text-slate-900">₹{pricing.maintenance}</Text>
                      </View>
                    )}
                    {pricing.leaseDuration && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lease Duration</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.leaseDuration}</Text>
                      </View>
                    )}
                    {pricing.lockInPeriod && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lock-in Period</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.lockInPeriod}</Text>
                      </View>
                    )}
                    {pricing.rentNegotiable !== undefined && pricing.rentNegotiable !== null && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rent Negotiable</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.rentNegotiable ? "Yes" : "No"}</Text>
                      </View>
                    )}
                    {pricing.preferredTenants && pricing.preferredTenants.length > 0 && (
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preferred Tenants</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.preferredTenants.join(", ")}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Price</Text>
                      <Text className="text-sm font-black text-slate-900">₹{pricing.totalPrice ?? pricing.startingPrice ?? "N/A"}</Text>
                    </View>
                    {pricing.pricePerSqft !== undefined && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price per SqFt</Text>
                        <Text className="text-sm font-black text-slate-900">₹{pricing.pricePerSqft}/sqft</Text>
                      </View>
                    )}
                    {pricing.bookingAmount !== undefined && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Booking Amount</Text>
                        <Text className="text-sm font-black text-slate-900">₹{pricing.bookingAmount}</Text>
                      </View>
                    )}
                    {pricing.gstApplicable !== undefined && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST Applicable</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.gstApplicable ? "Yes" : "No"}</Text>
                      </View>
                    )}
                    {pricing.possessionTimeline && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Possession Timeline</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.possessionTimeline}</Text>
                      </View>
                    )}
                    {pricing.priceNegotiable !== undefined && pricing.priceNegotiable !== null && (
                      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price Negotiable</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.priceNegotiable ? "Yes" : "No"}</Text>
                      </View>
                    )}
                    {pricing.brokerage && (
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brokerage Fee</Text>
                        <Text className="text-sm font-black text-slate-900">{pricing.brokerage}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          {/* RERA Details */}
          {(details.reraRegistered === true || details.reraNumber || details.projectReraNumber) && (
            <View className="mb-8 bg-white border border-slate-200 rounded-2xl p-5">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/50">
                  <Shield size={12} color={colors.successDark} strokeWidth={2.5} />
                  <Text className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    RERA Registered Project
                  </Text>
                </View>
              </View>
              <Text className="text-[13px] font-medium text-slate-500 leading-5 mb-4">
                This project complies with RERA regulations under Maharashtra Real Estate Regulatory Authority.
              </Text>
              <View className="gap-3">
                {details.reraNumber && (
                  <View className={`flex-row justify-between items-center ${
                    (details.projectReraNumber || details.reraValidityDate) ? "pb-3 border-b border-slate-100" : ""
                  }`}>
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent RERA</Text>
                    <Text className="text-sm font-black text-slate-900">{details.reraNumber}</Text>
                  </View>
                )}
                {details.projectReraNumber && (
                  <View className={`flex-row justify-between items-center ${
                    details.reraValidityDate ? "pb-3 border-b border-slate-100" : ""
                  }`}>
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project RERA ID</Text>
                    <Text className="text-sm font-black text-slate-900">{details.projectReraNumber}</Text>
                  </View>
                )}
                {details.reraValidityDate && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valid Until</Text>
                    <Text className="text-sm font-black text-slate-900">
                      {new Date(details.reraValidityDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* New Project / Builder Details */}
          {(property.listingCategory === "New" || details.projectName) && (
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[18px] font-black text-slate-900">
                  Project & Builder Details
                </Text>
                <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/70">
                  <Building size={12} color={colors.primary} />
                  <Text className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                    Project
                  </Text>
                </View>
              </View>
              <View className="bg-white border border-slate-200 rounded-2xl p-5 gap-3.5">
                {details.projectName && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Name</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.projectName}</Text>
                  </View>
                )}
                {details.builderName && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Builder/Developer</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.builderName}</Text>
                  </View>
                )}
                {details.constructionStatus && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Construction Status</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.constructionStatus}</Text>
                  </View>
                )}
                {details.possessionDate && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Possession Date</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">
                      {new Date(details.possessionDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </Text>
                  </View>
                )}
                {details.totalUnitsInProject !== undefined && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Project Units</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.totalUnitsInProject}</Text>
                  </View>
                )}
                {details.unitsAvailable !== undefined && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Units Available</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.unitsAvailable}</Text>
                  </View>
                )}
                {details.ccOcReceived && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CC/OC Approval</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.ccOcReceived}</Text>
                  </View>
                )}
                {details.approvedBanks && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved Banks</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.approvedBanks}</Text>
                  </View>
                )}
                {details.totalVillasInProject !== undefined && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Villas</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.totalVillasInProject}</Text>
                  </View>
                )}
                {details.layoutProjectName && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Layout Project Name</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.layoutProjectName}</Text>
                  </View>
                )}
                {details.totalPlotsInLayout !== undefined && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Plots in Layout</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.totalPlotsInLayout}</Text>
                  </View>
                )}
                {details.plotsAvailable !== undefined && (
                  <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plots Available</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.plotsAvailable}</Text>
                  </View>
                )}
                {details.developmentStatus && (
                  <View className="flex-row items-center justify-between pb-3.5">
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Development Status</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{details.developmentStatus}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Specifications List */}
          {specsList.length > 0 && (
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[18px] font-black text-slate-900">
                  Property Specifications
                </Text>
                <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/70">
                  <Layers size={12} color={colors.primary} />
                  <Text className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                    Specs
                  </Text>
                </View>
              </View>
              <View className="bg-white border border-slate-200 rounded-2xl p-5 gap-3.5">
                {specsList.map((spec, index) => (
                  <View key={spec.label} className={`flex-row items-center justify-between pb-3.5 ${index < specsList.length - 1 ? "border-b border-slate-100" : ""}`}>
                    <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{spec.label}</Text>
                    <Text className="text-sm font-black text-slate-900 text-right flex-1 ml-4">{spec.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text className="text-[18px] font-black text-slate-900 mb-4">
            Amenities
          </Text>
          <View className="flex-row flex-wrap justify-between mb-8">
            {(property?.amenities ?? []).map((a) => {
              const Icon =
                AMENITY_ICON_MAP[a.icon as keyof typeof AMENITY_ICON_MAP] ?? Layers;

              return <AmenityChip key={a.label} label={a.label} icon={Icon} />;
            })}
          </View>

          {!isOwner && (
            <View
              // style={shadows.cardSubtle}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 mb-4"
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 items-center"
              >
                <Text className="text-white text-[12px] font-black tracking-[3px]">
                  LISTED BY
                </Text>
              </LinearGradient>

              <View className="p-5">
                <View className="flex-row items-center mb-5">
                  <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center border-2 border-orange-50">
                    <Text className="text-xl font-black text-orange-500">
                      {property.broker.name.charAt(0)}
                    </Text>
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-[17px] font-black text-slate-900">
                      {property.broker.name}
                    </Text>
                    <Text className="text-[13px] font-medium text-slate-500 mt-0.5">
                      {property.broker.experience}
                    </Text>
                  </View>
                </View>

                <View className="border border-slate-200 rounded-2xl px-4 py-3 mb-4 bg-slate-50/50">
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Phone number
                  </Text>
                  <Text
                    className="text-[16px] font-bold mt-1"
                    style={!isPhoneUnlocked ? {
                      textShadowColor: 'rgba(51, 65, 85, 0.8)',
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 8,
                      color: 'transparent',
                    } : {
                      color: '#334155',
                    }}
                  >
                    {isPhoneUnlocked
                      ? (unlockedPhone || property.broker.phoneFull)
                      : maskPhone(unlockedPhone || property.broker.phoneFull || property.broker.phone || "+91 99001 12233")}
                  </Text>
                </View>

                {!isAuthenticated ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openAuth("viewContact")}
                    // style={shadows.button}
                    className="bg-orange-500 py-4 rounded-2xl flex-row items-center justify-center"
                  >
                    <Lock size={18} color={colors.white} strokeWidth={2.5} />
                    <Text className="text-white font-black text-[14px] ml-2">
                      View Contact to Unlock
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCall}
                    className="bg-emerald-500 py-4 rounded-2xl flex-row items-center justify-center"
                  >
                    <Phone size={18} color={colors.white} />
                    <Text className="text-white font-black text-[14px] ml-2">
                      Call Now
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {!isOwner && (
            <>
              <Text className="text-[20px] font-black text-slate-900 mb-4">
                Similar properties
              </Text>
              <View style={{ marginHorizontal: -4 }}>
                <PropertyList
                  data={similarProperties}
                  horizontal
                  fullSize
                  onToggleSave={togglePropertySave}
                  onCreateCallEnquiry={createCallEnquiry}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {isOwner ? (
        <View
          style={{
            paddingBottom: insets.bottom + 10,
            paddingTop: 12,
          }}
          className="absolute bottom-0 left-0 right-0 px-4 bg-white border-t border-slate-100 flex-row gap-2.5 items-center"
        >
          <TouchableOpacity
            onPress={handleEdit}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl bg-orange-500"
          >
            <Text className="text-[14px] font-bold text-white">Edit Property</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center py-3.5 bg-white border border-slate-200 rounded-2xl"
          >
            <Text className="text-[14px] font-bold text-slate-900">Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeleteConfirmVisible(true)}
            activeOpacity={0.85}
            className="w-12 h-12 bg-red-50 border border-red-200 rounded-2xl items-center justify-center"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            paddingBottom: insets.bottom + 10,
            paddingTop: 12,
            // ...shadows.card, 
          }}
          className="absolute bottom-0 left-0 right-0 px-4 bg-white border-t border-slate-100 flex-row gap-2.5 items-center"
        >
          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center py-3.5 bg-white border border-slate-200 rounded-2xl"
          >
            <Phone size={18} color={colors.text} />
            <Text className="text-[14px] font-bold text-slate-900 ml-2">Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl"
            style={{ backgroundColor: colors.whatsapp }}
          >
            <Text className="text-[14px] font-bold text-white">WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConfirmationOverlay
        visible={deleteConfirmVisible}
        title="Delete Property?"
        message="This listing will be permanently removed and cannot be recovered."
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmVisible(false)}
        variant="danger"
      />

    </View>
  );
}
