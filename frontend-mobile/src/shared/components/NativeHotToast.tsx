import { resolveValue, useToaster } from "react-hot-toast/headless";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/theme/colors";

const toastStyles = {
  success: {
    backgroundColor: colors.success,
  },
  error: {
    backgroundColor: colors.error,
  },
  blank: {
    backgroundColor: colors.primary,
  },
  loading: {
    backgroundColor: colors.primary,
  },
} as const;

export default function NativeHotToast() {
  const { toasts } = useToaster();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + 12 }]}
    >
      {toasts
        .filter((toast) => toast.visible)
        .map((toast) => {
          const tone =
            toast.type === "success" ||
            toast.type === "error" ||
            toast.type === "blank" ||
            toast.type === "loading"
              ? toast.type
              : "blank";

          return (
            <View
              key={toast.id}
              style={[styles.toast, toastStyles[tone]]}
            >
              <Text style={styles.toastText}>{resolveValue(toast.message, toast)}</Text>
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 99999,
    elevation: 99999,
    alignItems: "stretch",
  },
  toast: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
