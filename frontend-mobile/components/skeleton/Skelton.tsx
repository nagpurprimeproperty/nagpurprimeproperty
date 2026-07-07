import { View, ScrollView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Shimmer from "@/components/common/Shimmer";

interface SkeletonBlockProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBlock({
  width = "100%",
  height = 18,
  borderRadius = 12,
  style,
}: SkeletonBlockProps) {
  const { colors } = useTheme();
  const shimmerColors = [colors.border + "40", colors.surface, colors.border + "40"];

  return (
    <Shimmer
      shimmerColors={shimmerColors}
      style={[
        {
          width,
          height,
          borderRadius,
          marginBottom: 10,
          backgroundColor: colors.surface,
        },
        style,
      ]}
    />
  );
}

export function EnquiryListSkeleton() {
  const { colors } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
    >
      {[1, 2, 3].map((index) => (
        <View
          key={index}
          style={{
            borderRadius: 20,
            backgroundColor: colors.surface,
            marginBottom: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Shimmer
            shimmerColors={[colors.border + "40", colors.surface, colors.border + "40"]}
            style={{ height: 140, width: "100%" }}
          />
          <View style={{ padding: 16 }}>
            <SkeletonBlock width="60%" height={18} borderRadius={10} />
            <SkeletonBlock width="45%" height={16} borderRadius={10} />
            <SkeletonBlock width="80%" height={14} borderRadius={10} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <SkeletonBlock width={90} height={28} borderRadius={999} />
              <SkeletonBlock width={90} height={28} borderRadius={999} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function EnquiryDetailSkeleton() {
  const { colors } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 }}
    >
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
        }}
      >
        <Shimmer
          shimmerColors={[colors.border + "40", colors.surface, colors.border + "40"]}
          style={{ height: 220, width: "100%" }}
        />
        <View style={{ padding: 18 }}>
          <SkeletonBlock width="40%" height={20} borderRadius={10} />
          <SkeletonBlock width="70%" height={22} borderRadius={10} />
          <SkeletonBlock width="50%" height={16} borderRadius={10} />
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <SkeletonBlock width="55%" height={18} borderRadius={10} />
        <SkeletonBlock width="100%" height={16} borderRadius={10} />
        <SkeletonBlock width="90%" height={16} borderRadius={10} />
        <SkeletonBlock width="95%" height={16} borderRadius={10} />
      </View>

      <View style={{ marginBottom: 16 }}>
        <SkeletonBlock width="35%" height={18} borderRadius={10} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <SkeletonBlock width="46%" height={96} borderRadius={18} />
          <SkeletonBlock width="46%" height={96} borderRadius={18} />
        </View>
      </View>

      <View>
        <SkeletonBlock width="45%" height={18} borderRadius={10} />
        <SkeletonBlock width="100%" height={16} borderRadius={10} />
        <SkeletonBlock width="92%" height={16} borderRadius={10} />
        <SkeletonBlock width="98%" height={16} borderRadius={10} />
        <SkeletonBlock width="70%" height={16} borderRadius={10} />
      </View>
    </ScrollView>
  );
}
