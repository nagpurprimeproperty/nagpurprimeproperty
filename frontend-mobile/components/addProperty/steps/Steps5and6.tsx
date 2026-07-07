import { Ionicons } from "@expo/vector-icons";
import colors from '@/theme/colors';
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AMENITIES } from "../../../lib/constants";
import { useAddPropertyStore } from "../../../store/addPropertyStore";

async function requestMediaPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission Required",
      "Please allow access to your photo library.",
      [{ text: "OK" }],
    );
    return false;
  }
  return true;
}
async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Required", "Please allow camera access.", [
      { text: "OK" },
    ]);
    return false;
  }
  return true;
}

function StepHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-orange-200 flex-row items-center gap-3.5"
      style={{
        elevation: 4,
        shadowColor: colors.shadowPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      }}
    >
      <View
        className="w-12 h-12 rounded-full bg-orange-500 items-center justify-center"
        style={{
          elevation: 6,
          shadowColor: colors.shadowPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        }}
      >
        <Ionicons name={icon} size={22} color={colors.white} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-extrabold text-gray-900">{title}</Text>
        <Text className="text-[13px] text-gray-500 mt-0.5">{subtitle}</Text>
      </View>
    </View>
  );
}

function SectionCard({
  title,
  icon,
  right,
  children,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 shadow-sm"
      style={{ elevation: 3 }}
    >
      <View className="flex-row items-center mb-3.5">
        <View className="w-1 h-[18px] bg-orange-500 rounded-sm mr-2" />
        {icon && (
          <Ionicons
            name={icon}
            size={15}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />
        )}
        <Text className="text-xs font-extrabold text-gray-700 tracking-widest uppercase flex-1">
          {title}
        </Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  parking_2w: "bicycle-outline",
  parking_4w: "car-outline",
  lift: "arrow-up-circle-outline",
  security_24x7: "shield-checkmark-outline",
  cctv: "camera-outline",
  gym: "barbell-outline",
  swimming_pool: "water-outline",
  garden: "leaf-outline",
  play_area: "happy-outline",
  clubhouse: "business-outline",
  power_backup: "flash-outline",
  rainwater: "rainy-outline",
  fire_safety: "flame-outline",
  intercom: "call-outline",
  visitor_parking: "people-outline",
  water_storage: "cube-outline",
  piped_gas: "analytics-outline",
  sewage_treatment: "refresh-circle-outline",
  gas_connection: "server-outline",
  water_connection: "water-outline",
  electricity_conn: "flash-outline",
  water_supply: "water-outline",
};

export function Step5Media() {
  const step5 = useAddPropertyStore((s) => s.step5);
  const errors = useAddPropertyStore((s) => s.errors);
  const addPhoto = useAddPropertyStore((s) => s.addPhoto);
  const removePhoto = useAddPropertyStore((s) => s.removePhoto);
  const updateStep5 = useAddPropertyStore((s) => s.updateStep5);
  const { photos, video } = step5;
  const [loading, setLoading] = React.useState(false);
  const photoCount = photos.length;
  const maxPhotos = 15;

  const handlePickFromLibrary = useCallback(async () => {
    if (!(await requestMediaPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.85,
        selectionLimit: maxPhotos - photoCount,
        exif: false,
      });
      if (!result.canceled) result.assets.forEach((a) => addPhoto(a.uri));
    } catch {
      Alert.alert("Error", "Could not open photo library.");
    } finally {
      setLoading(false);
    }
  }, [photoCount]);

  const handleTakePhoto = useCallback(async () => {
    if (!(await requestCameraPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        exif: false,
      });
      if (!result.canceled && result.assets.length > 0)
        addPhoto(result.assets[0].uri);
    } catch {
      Alert.alert("Error", "Could not open camera.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddPhoto = useCallback(() => {
    if (photoCount >= maxPhotos) return;
    Alert.alert("Add Photo", "Choose source", [
      { text: "Camera", onPress: handleTakePhoto },
      { text: "Photo Library", onPress: handlePickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [photoCount, handleTakePhoto, handlePickFromLibrary]);

  const handlePickVideo = useCallback(async () => {
    if (!(await requestMediaPermission())) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
        videoMaxDuration: 120,
      });
      if (!result.canceled && result.assets.length > 0)
        updateStep5({ video: result.assets[0].uri });
    } catch {
      Alert.alert("Error", "Could not open video library.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      <StepHeader
        icon="images"
        title="Photos & Video"
        subtitle="First photo becomes the cover image"
      />

      {/* Photos */}
      <SectionCard
        title="Photos"
        icon="camera-outline"
        right={
          <View className="flex-row items-center gap-1.5">
            <View
              className={`rounded-lg px-2 py-0.5 border ${photoCount < 1 ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}
            >
              <Text
                className={`text-xs font-extrabold ${photoCount < 1 ? "text-red-500" : "text-orange-700"}`}
              >
                {photoCount}/{maxPhotos}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">min 1</Text>
          </View>
        }
      >
        {/* Grid */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          {photos.map((uri, index) => (
            <View key={uri} className="relative">
              <Image
                source={{ uri }}
                className="w-[100px] h-[100px] rounded-2xl"
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
              {index === 0 && (
                <View className="absolute top-1.5 left-1.5 bg-orange-500 rounded-lg px-1.5 py-0.5 flex-row items-center gap-0.5">
                  <Ionicons name="star" size={8} color="#fff" />
                  <Text className="text-white text-[9px] font-extrabold">
                    COVER
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => removePhoto(uri)}
                activeOpacity={0.8}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 items-center justify-center"
              >
                <Ionicons name="close" size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {photoCount < maxPhotos && (
            <TouchableOpacity
              onPress={handleAddPhoto}
              disabled={loading}
              activeOpacity={0.8}
              className="w-[100px] h-[100px] rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <View className="w-9 h-9 rounded-full bg-white border-[1.5px] border-orange-200 items-center justify-center mb-1.5">
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-orange-600 text-[10px] font-bold">
                    Add Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-2 mb-3">
          {[
            {
              label: "Library",
              icon: "images-outline" as const,
              onPress: handlePickFromLibrary,
            },
            {
              label: "Camera",
              icon: "camera-outline" as const,
              onPress: handleTakePhoto,
            },
          ].map((btn) => (
            <TouchableOpacity
              key={btn.label}
              onPress={btn.onPress}
              disabled={photoCount >= maxPhotos || loading}
              activeOpacity={0.8}
              className={`flex-1 flex-row items-center justify-center gap-1.5 h-12 rounded-2xl border-[1.5px]
                ${photoCount >= maxPhotos ? "border-gray-200 bg-gray-50 opacity-50" : "border-orange-200 bg-orange-50"}`}
            >
              <Ionicons name={btn.icon} size={16} color={colors.primary} />
              <Text className="text-orange-700 text-[13px] font-bold">
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tip */}
        <View className="flex-row items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3">
          <Ionicons
            name="bulb-outline"
            size={15}
            color={colors.primary}
            style={{ marginTop: 1 }}
          />
          <Text className="text-orange-700 text-xs flex-1 leading-[18px]">
            JPEG or PNG, max 5 MB each. First photo is shown as the listing
            cover. Up to 15 photos.
          </Text>
        </View>
        {errors.photos && (
          <View className="flex-row items-center gap-1 mt-2">
            <Ionicons name="alert-circle" size={13} color={colors.error} />
            <Text className="text-xs text-red-500">{errors.photos}</Text>
          </View>
        )}
      </SectionCard>

      {/* Video */}
      <SectionCard
        title="Video"
        icon="videocam-outline"
        right={
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="information-circle-outline"
              size={13}
              color={colors.inactive}
            />
            <Text className="text-xs text-gray-400">Optional · max 2 min</Text>
          </View>
        }
      >
        {video ? (
          <View className="bg-green-50 border-[1.5px] border-green-200 rounded-2xl px-3.5 py-3 flex-row items-center">
            <View
              className="w-11 h-11 rounded-full bg-emerald-500 items-center justify-center mr-3"
                style={{
                elevation: 4,
                shadowColor: colors.success,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
              }}
            >
              <Ionicons name="videocam" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-green-800 font-extrabold text-[13px]">
                Video selected ✓
              </Text>
              <Text className="text-green-700 text-xs mt-0.5" numberOfLines={1}>
                {video.split("/").pop()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => updateStep5({ video: null })}
              className="bg-white border-[1.5px] border-red-200 rounded-xl px-2.5 py-1.5 flex-row items-center gap-1"
            >
              <Ionicons name="trash-outline" size={13} color={colors.error} />
              <Text className="text-red-500 text-xs font-bold">Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handlePickVideo}
            disabled={loading}
            activeOpacity={0.8}
            className="border-2 border-dashed border-gray-200 rounded-2xl h-[120px] items-center justify-center bg-gray-50"
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <View className="w-[50px] h-[50px] rounded-full bg-white border-[1.5px] border-gray-200 items-center justify-center mb-2.5">
                  <Ionicons name="videocam-outline" size={24} color={colors.inactive} />
                </View>
                <Text className="text-gray-700 text-sm font-bold">
                  Add Property Video
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Tap to pick from library · max 2 min
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </SectionCard>
    </ScrollView>
  );
}

export function Step6Amenities() {
  const step6 = useAddPropertyStore((s) => s.step6);
  const toggleAmenity = useAddPropertyStore((s) => s.toggleAmenity);
  const { amenities } = step6;
  const selectedCount = amenities.length;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      <StepHeader
        icon="star"
        title="Amenities"
        subtitle={`All optional · ${selectedCount} selected`}
      />

      <SectionCard title="Select Amenities" icon="checkmark-circle-outline">
        <View className="flex-row flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const selected = amenities.includes(amenity.id);
            const iconName =
              AMENITY_ICONS[amenity.id] ?? "checkmark-circle-outline";
            return (
              <TouchableOpacity
                key={amenity.id}
                onPress={() => toggleAmenity(amenity.id)}
                activeOpacity={0.8}
                className={`flex-row items-center gap-1.5 px-3 py-2.5 rounded-xl border-[1.5px]
                  ${selected ? "bg-orange-500 border-orange-500" : "bg-white border-gray-200"}`}
                style={
                  selected
                    ? {
                        elevation: 3,
                        shadowColor: colors.shadowPrimary,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                      }
                    : undefined
                }
              >
                <Ionicons
                  name={iconName}
                  size={14}
                  color={selected ? "#fff" : "#6B7280"}
                />
                <Text
                  className={`text-xs font-semibold ${selected ? "text-white" : "text-gray-700"}`}
                >
                  {amenity.label}
                </Text>
                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedCount > 0 && (
          <View className="mt-4 pt-3.5 border-t border-gray-100 flex-row items-center gap-2">
            <View className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 items-center justify-center">
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            </View>
            <Text className="text-[13px] text-orange-700 font-bold">
              {selectedCount} amenit{selectedCount === 1 ? "y" : "ies"} selected
            </Text>
          </View>
        )}
      </SectionCard>

      {/* Submit banner */}
      <View
        className="bg-orange-500 rounded-2xl p-5 flex-row items-center gap-3.5"
        style={{
          elevation: 10,
          shadowColor: colors.shadowPrimary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        }}
      >
        <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center border-[1.5px] border-white/35">
          <Ionicons name="rocket" size={26} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-extrabold text-base mb-1">
            Almost done!
          </Text>
          <Text className="text-white/90 text-xs leading-[18px]">
            Tap &quot;Submit Listing&quot; to publish your property. Our team reviews
            listings within 2 hours.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
