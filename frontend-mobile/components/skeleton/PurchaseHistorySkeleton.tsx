import React from "react";
import { View, StyleSheet } from "react-native";
import Shimmer from "@/shared/components/Shimmer";
import colors from "@/theme/colors";

interface PurchaseHistorySkeletonProps {
  count?: number;
}

export default function PurchaseHistorySkeleton({ count = 3 }: PurchaseHistorySkeletonProps) {
  const shimmerColors = ["#E2E8F0", "#F8FAFC", "#E2E8F0"] as [string, string, string];

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Shimmer
                shimmerColors={shimmerColors}
                style={{ width: 140, height: 16, borderRadius: 8, marginBottom: 8 }}
              />
              <Shimmer
                shimmerColors={shimmerColors}
                style={{ width: 90, height: 11, borderRadius: 6 }}
              />
            </View>
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: 70, height: 26, borderRadius: 20 }}
            />
          </View>
          <View style={styles.divider} />
          <Shimmer
            shimmerColors={shimmerColors}
            style={{ width: "70%", height: 12, borderRadius: 6 }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 12,
  },
});
