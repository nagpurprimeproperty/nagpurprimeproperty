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
      {/* Left: Image Shimmer */}
      <ShimmerBox width={130} height={175} radius={0} />

      {/* Right: Info Shimmer */}
      <View style={styles.infoBlock}>
        {/* Row 1: Category & Heart */}
        <View style={styles.rowBetween}>
          <ShimmerBox width={70} height={10} radius={4} />
          <ShimmerBox width={22} height={22} radius={11} />
        </View>

        {/* Row 2: Title & Price */}
        <View style={styles.rowBetween}>
          <ShimmerBox width="55%" height={14} radius={4} />
          <ShimmerBox width={50} height={14} radius={4} />
        </View>

        {/* Row 3: Location */}
        <View style={styles.row}>
          <ShimmerBox width={10} height={10} radius={5} />
          <ShimmerBox width={80} height={10} radius={4} style={{ marginLeft: 4 }} />
        </View>

        {/* Row 4: Specs */}
        <View style={styles.specsRow}>
          {[1, 2, 3].map((item, idx) => (
            <React.Fragment key={item}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <ShimmerBox width={12} height={12} radius={6} />
                <View style={{ flex: 1, marginLeft: 4, gap: 3 }}>
                  <ShimmerBox width="80%" height={8} radius={2} />
                  <ShimmerBox width="60%" height={6} radius={2} />
                </View>
              </View>
              {idx < 2 && <View style={styles.verticalDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Row 5: Action Buttons */}
        <View style={styles.actionRow}>
          <ShimmerBox width={undefined} height={32} radius={8} style={{ flex: 1 }} />
          <ShimmerBox width={undefined} height={32} radius={8} style={{ flex: 1 }} />
          <ShimmerBox width={undefined} height={32} radius={8} style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

interface Props {
  count?: number;
}

export default function SearchScreenSkeleton({ count = 3 }: Props) {
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
    height: 175,
    alignSelf: "center",
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    marginBottom: 12,
    flexDirection: "row",
  },
  infoBlock: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 6,
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E2E8F0",
  },
  actionRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
  },
});
