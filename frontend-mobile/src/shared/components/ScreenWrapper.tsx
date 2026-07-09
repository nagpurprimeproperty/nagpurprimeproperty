import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "@/theme/colors";

interface ScreenWrapperProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
  statusBarStyle?: "light-content" | "dark-content";
}

/**
 * Consistent screen wrapper used across all screens.
 * Provides the standard background color and optional SafeAreaView.
 */
export default function ScreenWrapper({
  children,
  useSafeArea = true,
  edges = ["top"],
  statusBarStyle = "dark-content",
}: ScreenWrapperProps) {
  const content = (
    <>
      <StatusBar barStyle={statusBarStyle} />
      {children}
    </>
  );

  if (useSafeArea) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={edges}
      >
        {content}
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {content}
    </View>
  );
}
