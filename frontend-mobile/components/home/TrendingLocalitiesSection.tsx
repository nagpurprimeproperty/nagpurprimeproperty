import { useTheme } from "@/hooks/useTheme";
import { usePopularLocalities } from "@/hooks/useLocaltyHook";
import { useLocaltyStore } from "@/store/localtyStore";
import { router } from "expo-router";
import { FlatList, Text, View, Pressable, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import SectionDivider from "../common/SectionDivider";
import SectionHeader from "../common/SectionHeader";
import { MapPin, Building2, Home, Store, Compass, Navigation, Check } from "lucide-react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Define style presets for colors, icons, and background images
const PRESETS = [
  { 
    bg: "#FFF7ED", 
    iconColor: "#EA580C", 
    icon: MapPin,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80" // Modern flat building
  },
  { 
    bg: "#EFF6FF", 
    iconColor: "#2563EB", 
    icon: Building2,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80" // Luxury home
  },
  { 
    bg: "#ECFDF5", 
    iconColor: "#059669", 
    icon: Home,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" // Modern house exterior
  },
  { 
    bg: "#FDF4FF", 
    iconColor: "#C084FC", 
    icon: Store,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80" // Glass office complex
  },
  { 
    bg: "#F0FDFA", 
    iconColor: "#0D9488", 
    icon: Compass,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80" // Land/Plots green landscape
  },
  { 
    bg: "#FFF1F2", 
    iconColor: "#E11D48", 
    icon: Navigation,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80" // Modern villa facade
  },
];

// Fallback data in case the API returns empty/fails
const FALLBACK_LOCALITIES = [
  { locality: "Dighori", count: 32 },
  { locality: "Manish Nagar", count: 28 },
  { locality: "Besa", count: 18 },
  { locality: "Wardha Road", count: 12 },
  { locality: "Pratap Nagar", count: 8 },
];

export default function TrendingLocalitiesSection({ enabled = true }: { enabled?: boolean }) {
  const { colors } = useTheme();
  const { data: apiResponse, isLoading } = usePopularLocalities(enabled);
  const selectedLocality = useLocaltyStore((s) => s.selectedLocality);

  const rawLocalities = apiResponse?.data && apiResponse.data.length > 0
    ? apiResponse.data
    : FALLBACK_LOCALITIES;

  // Format localities to standard schema
  const localities = rawLocalities.map((item: any) => ({
    locality: item.locality || item._id || "",
    count: item.count || 0,
    latitude: item.latitude || null,
    longitude: item.longitude || null,
  })).filter(item => item.locality);

  const handleCardPress = async (item: any) => {
    if (selectedLocality === item.locality) {
      await useLocaltyStore.getState().setSelectedLocality(null);
    } else {
      await useLocaltyStore.getState().setSelectedLocality(
        item.locality,
        item.latitude,
        item.longitude
      );
    }
  };

  const handleSeeAll = () => {
    router.push("/(tabs)/search");
  };

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <SectionDivider label="TRENDING LOCALITIES" />
        <SectionHeader 
          title="Neighborhoods in demand" 
          subtitle="Top areas in Nagpur by property activity." 
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ gap: 4, paddingRight: 12 }}
        >
          {[1, 2, 3].map((item) => (
            <View
              key={item.toString()}
              style={{
                width: 140,
                height: 200,
                borderRadius: 12,
                backgroundColor: "#F1F5F9",
                padding: 16,
                justifyContent: "space-between",
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#E2E8F0" }} />
              <View>
                <View style={{ width: 80, height: 16, borderRadius: 4, backgroundColor: "#E2E8F0", marginBottom: 6 }} />
                <View style={{ width: 50, height: 12, borderRadius: 4, backgroundColor: "#E2E8F0" }} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (localities.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(700).duration(500).springify()}
      style={{ paddingHorizontal: 12, marginTop: 24 }}
    >
      <SectionDivider label="TRENDING LOCALITIES" />
      <SectionHeader
        title="Neighborhoods in demand"
        subtitle="Top areas in Nagpur by property activity."
        onPressSeeAll={handleSeeAll}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 12, paddingVertical: 4 }}
        scrollEventThrottle={16}
      >
        {localities.map((item, index) => {
          const isSelected = selectedLocality === item.locality;
          const preset = PRESETS[index % PRESETS.length];
          const IconComponent = preset.icon;

          return (
            <AnimatedPressable
              key={item.locality + index}
              onPress={() => handleCardPress(item)}
              entering={FadeInDown.delay(800 + index * 100).duration(400).springify()}
              style={{
                width: 150,
                height: 200,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: isSelected ? 3 : 0,
                borderColor: colors.primary,
              }}
            >
              {/* Background Image */}
              <Image
                source={{ uri: preset.image }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                }}
                contentFit="cover"
              />

              {/* Dark Linear Gradient for overlay and text readability */}
              <LinearGradient
                colors={[
                  "rgba(15, 23, 42, 0.95)", // deep slate-900 bottom
                  "rgba(15, 23, 42, 0.45)", // mid gradient
                  "rgba(0, 0, 0, 0.15)",     // transparent top
                ]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={{
                  flex: 1,
                  padding: 16,
                  justifyContent: "space-between",
                }}
              >
                {/* Floating Glassmorphic Icon & Selection checkmark */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View 
                    style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 18, 
                      backgroundColor: "rgba(255, 255, 255, 0.88)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <IconComponent size={16} color={preset.iconColor} strokeWidth={2.5} />
                  </View>

                  {isSelected && (
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: "#FFFFFF",
                      }}
                    >
                      <Check size={11} color="#FFFFFF" strokeWidth={3.5} />
                    </View>
                  )}
                </View>

                {/* Typography info */}
                <View>
                  <Text 
                    numberOfLines={1} 
                    style={{ 
                      fontSize: 15, 
                      fontWeight: "900", 
                      color: "#FFFFFF",
                      marginBottom: 2,
                      textShadowColor: "rgba(0, 0, 0, 0.3)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    {item.locality}
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 11, 
                      fontWeight: "700", 
                      color: "rgba(255, 255, 255, 0.85)" 
                    }}
                  >
                    {item.count} Properties
                  </Text>
                </View>
              </LinearGradient>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
