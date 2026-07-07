import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import colors from "@/theme/colors";

interface LoadMoreButtonProps {
  onPress: () => void;
  loading: boolean;
  hasMore: boolean;
}

export default function LoadMoreButton({ onPress, loading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          loading && styles.buttonDisabled
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.text}>Load More</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 180,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
});
