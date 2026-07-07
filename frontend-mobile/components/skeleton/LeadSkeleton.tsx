import React from "react";
import { View, StyleSheet } from "react-native";
import Shimmer from "@/components/common/Shimmer";

interface LeadSkeletonProps {
  count?: number;
}

export default function LeadSkeleton({ count = 4 }: LeadSkeletonProps) {
  const shimmerColors = ["#E2E8F0", "#F8FAFC", "#E2E8F0"] as [string, string, string];

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.topRow}>
            <View style={{ gap: 8 }}>
              <Shimmer
                shimmerColors={shimmerColors}
                style={{ width: 130, height: 15, borderRadius: 8 }}
              />
              <Shimmer
                shimmerColors={shimmerColors}
                style={{ width: 180, height: 12, borderRadius: 8 }}
              />
            </View>
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: 68, height: 26, borderRadius: 20 }}
            />
          </View>
          <View style={styles.bottomRow}>
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ flex: 1, height: 44, borderRadius: 12 }}
            />
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />
          </View>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 10,
  },
});
