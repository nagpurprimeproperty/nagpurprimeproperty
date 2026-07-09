import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";
import Shimmer from "@/shared/components/Shimmer";

export default function SkeletonCard() {
  const { colors } = useTheme();

  const shimmerColors = [
    colors.border + "40",
    colors.surface,
    colors.border + "40",
  ];

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: colors.surface,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Shimmer
        shimmerColors={shimmerColors}
        style={{
          height: 190,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      />

      <View style={{ padding: 16 }}>
        <Shimmer
          shimmerColors={shimmerColors}
          style={{
            height: 20,
            width: "35%",
            borderRadius: 8,
            marginBottom: 10,
          }}
        />

        <Shimmer
          shimmerColors={shimmerColors}
          style={{
            height: 16,
            width: "75%",
            borderRadius: 8,
            marginBottom: 8,
          }}
        />

        <Shimmer
          shimmerColors={shimmerColors}
          style={{
            height: 14,
            width: "55%",
            borderRadius: 8,
            marginBottom: 12,
          }}
        />

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Shimmer
            shimmerColors={shimmerColors}
            style={{
              height: 28,
              width: 70,
              borderRadius: 10,
            }}
          />
          <Shimmer
            shimmerColors={shimmerColors}
            style={{
              height: 28,
              width: 85,
              borderRadius: 10,
            }}
          />
        </View>
      </View>
    </View>
  );
}
