import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Shimmer from "@/shared/components/Shimmer";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PAD = 12;
const CARD_WIDTH = SCREEN_WIDTH - H_PAD * 2;

function ShimmerBox({
  width: w,
  height: h,
  radius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  radius?: number;
  style?: any;
}) {
  const { colors } = useTheme();
  const shimmerColors = [
    colors.border + "60",
    colors.surface,
    colors.border + "60",
  ] as [string, string, string];

  return (
    <Shimmer
      shimmerColors={shimmerColors}
      style={[{ width: w ?? "100%", height: h, borderRadius: radius }, style]}
    />
  );
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <ShimmerBox height={220} radius={0} />

      <View style={styles.infoBlock}>
        <ShimmerBox width={130} height={22} radius={8} />
        <View style={styles.metaRow}>
          <ShimmerBox width={60} height={13} radius={6} />
          <ShimmerBox width={8} height={13} radius={4} />
          <ShimmerBox width={50} height={13} radius={6} />
          <ShimmerBox width={8} height={13} radius={4} />
          <ShimmerBox width={70} height={13} radius={6} />
        </View>
        <ShimmerBox width="85%" height={16} radius={8} />
        <ShimmerBox width="60%" height={16} radius={8} />
        <View style={styles.locationRow}>
          <ShimmerBox width={14} height={14} radius={7} />
          <ShimmerBox width={160} height={12} radius={6} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <ShimmerBox width={undefined} height={44} radius={12} style={{ flex: 1 }} />
        <ShimmerBox width={undefined} height={44} radius={12} style={{ flex: 1.2 }} />
        <ShimmerBox width={46} height={46} radius={12} />
      </View>
    </View>
  );
}

interface PropertyCardSkeletonProps {
  count?: number;
}

export default function PropertyCardSkeleton({ count = 3 }: PropertyCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    alignSelf: "center",
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 16,
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
