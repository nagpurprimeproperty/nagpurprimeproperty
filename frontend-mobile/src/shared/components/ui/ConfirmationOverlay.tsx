// components/ui/ConfirmationOverlay.tsx

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/theme/colors";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

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
    icon:           "log-out-outline"            as const,
    iconColor:      colors.primary,
    iconBgColor:    colors.primaryLight,
    iconBdColor:    colors.primaryMuted,
    confirmBgColor: colors.primary,
    accentColor:    colors.primary,
  },
  success: {
    icon:           "checkmark-circle-outline"   as const,
    iconColor:      colors.success,
    iconBgColor:    colors.successLight,
    iconBdColor:    "#BBF7D0",
    confirmBgColor: colors.success,
    accentColor:    colors.success,
  },
  warning: {
    icon:           "warning-outline"            as const,
    iconColor:      colors.primaryDark,
    iconBgColor:    colors.primaryLight,
    iconBdColor:    colors.primaryMuted,
    confirmBgColor: colors.primary,
    accentColor:    colors.primary,
  },
  info: {
    icon:           "information-circle-outline" as const,
    iconColor:      "#3B82F6",
    iconBgColor:    "#EFF6FF",
    iconBdColor:    "#BFDBFE",
    confirmBgColor: "#3B82F6",
    accentColor:    "#3B82F6",
  },
};

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
      animationType="none"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(160)}
        style={styles.backdrop}
      >
        {/* Card */}
        <Animated.View
          entering={ZoomIn.duration(240).springify().damping(16).stiffness(160)}
          exiting={ZoomOut.duration(160)}
          style={styles.card}
        >
          {/* Top accent strip */}
          <View style={[styles.accentBar, { backgroundColor: cfg.accentColor }]} />

          <View style={styles.cardBody}>

            {/* Icon ring */}
            <View
              style={[
                styles.iconRing,
                {
                  backgroundColor: cfg.iconBgColor,
                  borderColor:     cfg.iconBdColor,
                },
              ]}
            >
              <Ionicons name={cfg.icon} size={34} color={cfg.iconColor} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* ── Buttons ── */}
            <View style={styles.buttonRow}>

              {/* Cancel */}
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.75}
                style={styles.cancelBtn}
              >
                <Ionicons name="close-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.btnText, styles.cancelText]}>{cancelLabel}</Text>
              </TouchableOpacity>

              {/* Confirm */}
              <TouchableOpacity
                onPress={onConfirm}
                activeOpacity={0.82}
                style={[styles.confirmBtn, { backgroundColor: cfg.confirmBgColor }]}
              >
                <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
                <Text style={[styles.btnText, styles.confirmText]}>{confirmLabel}</Text>
              </TouchableOpacity>

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
    flex:              1,
    alignItems:        "center",
    justifyContent:    "center",
    paddingHorizontal: 24,
    backgroundColor:   "rgba(17, 24, 39, 0.55)",
  },

  card: {
    width:           "100%",
    backgroundColor: colors.surface,
    borderRadius:    20,
    overflow:        "hidden",        // clips the accent bar & card corners
    borderWidth:     1,
    borderColor:     colors.borderLight,
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: 16 },
    shadowOpacity:   0.14,
    shadowRadius:    32,
    elevation:       20,
  },

  accentBar: {
    height: 4,
    width:  "100%",
  },

  cardBody: {
    paddingHorizontal: 24,
    paddingTop:        28,
    paddingBottom:     24,
    alignItems:        "center",
  },

  iconRing: {
    width:          72,
    height:         72,
    borderRadius:   36,
    borderWidth:    2,
    alignItems:     "center",
    justifyContent: "center",
    marginBottom:   20,
  },

  title: {
    fontSize:      18,
    fontWeight:    "800",
    color:         colors.text,
    textAlign:     "center",
    letterSpacing: -0.3,
    marginBottom:  10,
  },

  message: {
    fontSize:          14,
    fontWeight:        "500",
    color:             colors.textSecondary,
    textAlign:         "center",
    lineHeight:        21,
    paddingHorizontal: 4,
    marginBottom:      20,
  },

  divider: {
    width:           "100%",
    height:          1,
    backgroundColor: colors.borderLight,
    marginBottom:    20,
  },

  buttonRow: {
    flexDirection: "row",
    gap:           12,
    width:         "100%",
  },

  // ── Cancel button ──────────────────────────────────────────────────────────
  cancelBtn: {
    flex:            1,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             6,
    height:          50,
    borderRadius:    12,
    backgroundColor: colors.surface,
    borderWidth:     1.5,
    borderColor:     colors.border,
  },

  cancelText: {
    color: colors.textSecondary,
  },

  // ── Confirm button ─────────────────────────────────────────────────────────
  confirmBtn: {
    flex:           1,
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            6,
    height:         50,
    borderRadius:   12,
    // shadow applied via elevation on Android, shadow* on iOS
    shadowColor:    "#000",
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.25,
    shadowRadius:   8,
    elevation:      6,
  },

  confirmText: {
    color: "#FFFFFF",
  },

  // ── Shared button text ─────────────────────────────────────────────────────
  btnText: {
    fontSize:      14,
    fontWeight:    "700",
    letterSpacing: 0.1,
  },
});

export default ConfirmationOverlay;