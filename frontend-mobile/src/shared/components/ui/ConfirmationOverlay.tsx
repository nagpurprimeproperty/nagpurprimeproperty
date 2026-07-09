// components/ui/ConfirmationOverlay.tsx
//
// FIX: SpringButton was using className on Animated.View — NativeWind className
//      is not reliably applied to Animated.View when mixed with style arrays.
//      Solution: move ALL visual styles (bg, radius, size, border) into StyleSheet
//      and use className only on plain View/Text children inside buttons.

import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/theme/colors";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

// ─── Types ────────────────────────────────────────────────────────────────────
type OverlayVariant = "danger" | "success" | "warning" | "info";

interface ConfirmationOverlayProps {
  visible:        boolean;
  variant?:       OverlayVariant;
  title:          string;
  message:        string;
  confirmLabel?:  string;
  cancelLabel?:   string;
  onConfirm:      () => void;
  onCancel:       () => void;
}

// ─── Variant config ───────────────────────────────────────────────────────────
const VARIANT_CONFIG = {
  danger: {
    icon:          "trash-outline"            as const,
    iconColor:     "#EF4444",
    iconBgColor:   "#FEF2F2",
    iconBdColor:   "#FECACA",
    confirmBgColor:"#EF4444",
    glow:          "#EF4444",
  },
  success: {
    icon:          "checkmark-circle-outline" as const,
    iconColor:     "#22C55E",
    iconBgColor:   "#F0FDF4",
    iconBdColor:   "#BBF7D0",
    confirmBgColor:"#22C55E",
    glow:          "#22C55E",
  },
  warning: {
    icon:          "warning-outline"          as const,
    iconColor:     colors.primaryDark,
    iconBgColor:   colors.primaryLight,
    iconBdColor:   colors.primaryMuted,
    confirmBgColor: colors.primary,
    glow:          colors.primary,
  },
  info: {
    icon:          "information-circle-outline" as const,
    iconColor:     "#3B82F6",
    iconBgColor:   "#EFF6FF",
    iconBdColor:   "#BFDBFE",
    confirmBgColor: "#3B82F6",
    glow:          "#3B82F6",
  },
};

// ─── Spring Button ─────────────────────────────────────────────────────────────
// FIX: All layout/visual styles live in `buttonStyle` (StyleSheet/inline).
//      Animated.View only gets `animStyle` + `buttonStyle` — no className.
//      Children (Text, icons) use className freely since they are plain Views.
function ActionButton({
  onPress,
  buttonStyle,
  children,
}: {
  onPress: () => void;
  buttonStyle: object | object[];
  children: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <View style={buttonStyle}>{children}</View>
    </Pressable>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ConfirmationOverlay = ({
  visible,
  variant      = "warning",
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationOverlayProps) => {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      {/* ── Backdrop ── */}
      {/* ✅ NativeWind: flex, center, px — safe on Animated.View with no style array conflict */}
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        className="flex-1 items-center justify-center px-6"
        style={styles.backdrop}
      >
        {/* ── Card ── */}
        <Animated.View
          entering={FadeIn.duration(180)}
          className="w-full rounded-3xl overflow-hidden"
          style={styles.card}
        >
          {/* Accent bar — inline style: dynamic color */}
          <View style={[styles.accentBar, { backgroundColor: cfg.glow }]} />

          {/* ✅ NativeWind: padding, alignment — plain View, safe */}
          <View className="px-6 pt-8 pb-6 items-center">

            {/* ── Icon ring ── */}
            {/* FIX: use inline style for all dynamic colors, StyleSheet for shadow */}
            <View
              style={[
                styles.iconRing,
                {
                  backgroundColor: cfg.iconBgColor,
                  borderColor:     cfg.iconBdColor,
                },
              ]}
            >
              <Ionicons name={cfg.icon} size={38} color={cfg.iconColor} />
            </View>

            {/* ── Title ── */}
            {/* ✅ NativeWind on plain Text — always works */}
            <Text
              className="text-xl font-bold text-center mb-2"
              style={styles.title}
            >
              {title}
            </Text>

            {/* ── Message ── */}
            <Text style={[styles.message, styles.messageText]}>
              {message}
            </Text>

            {/* ── Divider ── */}
            <View style={styles.divider} />

            {/* ── Buttons row ── */}
            {/* ✅ NativeWind on plain View — always works */}
            <View className="flex-row gap-3 w-full">

              <ActionButton onPress={onCancel} buttonStyle={styles.cancelBtn}>
              <View style={styles.buttonContent}>
                <Ionicons name="close-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.buttonLabel, { color: colors.textSecondary }]}> {cancelLabel}</Text>
              </View>
            </ActionButton>

            <ActionButton
              onPress={onConfirm}
              buttonStyle={[
                styles.confirmBtn,
                {
                  backgroundColor: cfg.confirmBgColor,
                  shadowColor: cfg.glow,
                },
              ]}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark-outline" size={18} color={colors.white} />
                <Text style={[styles.buttonLabel, { color: colors.white }]}>{confirmLabel}</Text>
              </View>
            </ActionButton>

            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  backdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  card: {
    backgroundColor: colors.surface,
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: 20 },
    shadowOpacity:   0.12,
    shadowRadius:    40,
    elevation:       24,
  },

  accentBar: {
    height: 4,
    width: "100%",
  },

  // FIX: icon ring now fully in StyleSheet — dynamic colors applied via inline style
  iconRing: {
    width:         80,
    height:        80,
    borderRadius:  40,
    borderWidth:   3,
    alignItems:    "center",
    justifyContent:"center",
    marginBottom:  24,
    // shadow
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius:  12,
    elevation:     4,
  },

  title: {
    letterSpacing: -0.3,
    color: colors.text,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  message: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "700",
  },

  // FIX: cancel button — full visual style here, NOT className on Animated.View
  cancelBtn: {
    height:          52,
    borderRadius:    16,
    backgroundColor: colors.background,
    borderWidth:     1,
    borderColor:     "#E5E7EB",
    alignItems:      "center",
    justifyContent:  "center",
    // shadow
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.05,
    shadowRadius:    6,
    elevation:       2,
  },

  // FIX: confirm button — backgroundColor + shadowColor injected inline per variant
  confirmBtn: {
    height:          52,
    borderRadius:    16,
    alignItems:      "center",
    justifyContent:  "center",
    // shadow (color injected inline)
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.38,
    shadowRadius:    14,
    elevation:       10,
  },
});

export default ConfirmationOverlay;