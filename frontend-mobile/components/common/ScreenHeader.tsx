import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import colors from "@/theme/colors";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  /** Centered title between back button and spacer (e.g. subscription) */
  layout?: "default" | "centered" | "minimal";
}

/**
 * Unified screen header: back button, title/subtitle, optional right action.
 * Uses BlurView for an iOS frosted-glass appearance.
 */
export default function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  rightElement,
  layout = "default",
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    // router.canGoBack() is unreliable when the root layout uses <Slot /> instead
    // of <Stack /> — it returns false even when a real navigation history exists,
    // causing the fallback to incorrectly redirect to the Home tab.
    // router.back() is always correct here: it pops the current screen and returns
    // the user to whichever screen pushed this one (Profile, Search, Home, etc.).
    router.back();
  };

  const backButton = showBack ? (
    <TouchableOpacity
      onPress={handleBack}
      activeOpacity={0.8}
      className="h-12 w-12 items-center justify-center rounded-2xl bg-white/60 border border-white/50 shadow-sm"
    >
      <ArrowLeft size={20} color={colors.primary} strokeWidth={2.5} />
    </TouchableOpacity>
  ) : null;

  const leftElement = showBack ? (
    backButton
  ) : (
    <View className="h-10 w-10 rounded-xl overflow-hidden bg-orange-500 items-center justify-center">
      <Image
        source={require("@/assets/images/nppicon.webp")}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        cachePolicy="memory"
      />
    </View>
  );

  const renderContent = () => {
    if (layout === "minimal") {
      return (
        <View className="px-3 py-4 flex-row items-center justify-between">
          {backButton}
          {rightElement ??
            (rightIcon ? (
              <View className="bg-orange-100/80 p-2.5 rounded-xl">{rightIcon}</View>
            ) : (
              <View className="w-12" />
            ))}
        </View>
      );
    }

    if (layout === "centered") {
      return (
        <View className="px-3 py-4 flex-row items-center justify-between">
          {leftElement}
          <View className="flex-1 items-center px-2">
            <Text className="text-xl font-black text-slate-900 tracking-tight text-center">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-gray-500 font-black text-[10px] uppercase tracking-widest text-center mt-0.5">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {rightElement ?? rightIcon ? (
            <View className="w-12 items-end">{rightElement ?? rightIcon}</View>
          ) : (
            <View className="w-12" />
          )}
        </View>
      );
    }

    return (
      <View className="px-4 py-3 flex-row items-center justify-between ">
        <View className="flex-row items-center flex-1 mr-3">
          {leftElement}
          <View className="ml-4 flex-1">
            <Text
              className="text-xl font-black text-slate-900 tracking-tight"
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-gray-500 text-sm font-medium  mt-0.5">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {rightElement ??
          (rightIcon ? (
            <View className="bg-orange-100/80 p-2.5 rounded-xl">{rightIcon}</View>
          ) : null)}
      </View>
    );
  };

  return (
    <BlurView intensity={70} tint="light" style={styles.blurHeader}>
      {renderContent()}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurHeader: {
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.90)",
  },
});
