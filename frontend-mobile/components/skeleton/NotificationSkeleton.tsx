import React from "react";
import { View } from "react-native";
import Shimmer from "@/components/common/Shimmer";

interface NotificationSkeletonProps {
  count?: number;
}

export default function NotificationSkeleton({ count = 4 }: NotificationSkeletonProps) {
  const shimmerColors = ["#E2E8F0", "#F8FAFC", "#E2E8F0"] as [string, string, string];

  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} className="mb-3 rounded-2xl bg-white px-4 py-4 border border-slate-100 flex-row items-center">
          <Shimmer
            shimmerColors={shimmerColors}
            style={{ width: 48, height: 48, borderRadius: 16 }}
          />

          <View className="flex-1 ml-3.5">
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: "65%", height: 14, borderRadius: 8, marginBottom: 10 }}
            />
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: "90%", height: 12, borderRadius: 8, marginBottom: 8 }}
            />
            <Shimmer
              shimmerColors={shimmerColors}
              style={{ width: "45%", height: 10, borderRadius: 8 }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
