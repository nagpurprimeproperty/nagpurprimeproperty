import React from "react";
import { Text, View } from "react-native";

interface SectionDividerProps {
  label: string;
  /** primary = orange accent; muted = slate (list section headers) */
  variant?: "primary" | "muted";
  className?: string;
}

/**
 * Consistent section divider label used across screens.
 */
export default function SectionDivider({
  label,
  variant = "primary",
  className = "",
}: SectionDividerProps) {
  const isMuted = variant === "muted";

  return (
    <View className={`flex-row items-center mb-4 ml-1 ${className}`}>
      <Text
        className={`text-[10px] font-black uppercase tracking-[1.5px] ${
          isMuted ? "text-slate-400" : "text-orange-600"
        }`}
      >
        {label}
      </Text>
      <View
        className={`h-[1px] flex-1 ml-4 ${isMuted ? "bg-slate-100" : "bg-orange-100"}`}
      />
    </View>
  );
}
