import { useAuthStore } from "@/features/auth/store/authStore";
import { useModal } from "@/context/ModalContext";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/features/auth/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OTPVerification from "./OTPVerification";
import PhoneInput from "./PhoneInput";
import colors from "@/theme/colors";
import { toast as hotToast } from "react-hot-toast/headless";

const { height: SCREEN_H } = Dimensions.get("window");

export default function AuthModal() {
  const { authModalVisible, closeAuth } = useModal();
  const setPhone = useAuthStore((state) => state.setPhone);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setLocalPhone] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  // ── Keyboard tracking (works on both iOS & Android inside a Modal) ───────────
  //
  // KeyboardAvoidingView is unreliable inside a transparent overFullScreen Modal
  // on either platform. Instead we:
  //   1. Listen to keyboard events (Will* on iOS, Did* on Android).
  //   2. Animate the sheet upward with translateY so it clears the keyboard.
  //   3. Dynamically set maxHeight so the sheet shrinks to fit the visible
  //      space — without this the lower content gets clipped off-screen.
  //
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    if (!authModalVisible) {
      // Reset slide position & height when the modal closes
      slideAnim.setValue(0);
      setKbHeight(0);
      return;
    }

    // iOS fires *Will* events before the animation starts → smooth.
    // Android only fires *Did* events after the keyboard is fully shown.
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: KeyboardEvent) => {
      const h = e.endCoordinates.height;
      setKbHeight(h);
      Animated.timing(slideAnim, {
        toValue: -h,
        duration: Platform.OS === "ios" ? (e.duration ?? 250) : 180,
        useNativeDriver: true,
      }).start();
    };

    const onHide = (e: KeyboardEvent) => {
      setKbHeight(0);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: Platform.OS === "ios" ? (e.duration ?? 250) : 180,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [authModalVisible, slideAnim]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSendOTP = async (enteredPhone: string, name: string) => {
    if (enteredPhone.length < 10) return;

    setSendError(null);
    setLocalPhone(enteredPhone);

    try {
      const response = await sendOtpMutation.mutateAsync({
        mobile: enteredPhone,
        name: name.trim() || "Customer",
      });

      const otpCode = response.data?.trim();
      const toastMessage =
        otpCode && /^\d{4,8}$/.test(otpCode)
          ? `OTP: ${otpCode}`
          : response.message || `OTP sent to ${enteredPhone}`;

      hotToast.success(toastMessage, { duration: 7000 });
      setPhone(enteredPhone);
      setStep("otp");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send OTP. Please try again.";
      hotToast.error(message, { duration: 7000 });
      setSendError(message);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (otp.length !== 4) return;

    await verifyOtpMutation.mutateAsync({ mobile: phone, otp });

    // Close the modal — previously setSession() did this implicitly by
    // writing showAuthModal:false into authStore. Now that the modal is
    // owned by ModalContext the component must close it explicitly.
    closeAuth();
    setStep("phone");
    setLocalPhone("");
  };

  const handleClose = () => {
    Keyboard.dismiss();
    closeAuth();
    setStep("phone");
    setLocalPhone("");
  };

  // ── Dynamic sheet sizing ─────────────────────────────────────────────────────
  //
  // When the keyboard is open we constrain maxHeight to the space between the
  // status bar / safe-area top and the top of the keyboard.
  // This prevents the sheet from being taller than the visible area, which
  // would clip inputs behind the keyboard even after translateY moves it up.
  //
  // When keyboard is closed → standard 92% max height.
  //
  const sheetMaxHeight =
    kbHeight > 0
      ? SCREEN_H - kbHeight - insets.top - 8 // 8px gap from safe-area edge
      : SCREEN_H * 0.92;

  // Drop bottom padding when keyboard is visible (home-indicator area is covered)
  const sheetPaddingBottom = kbHeight > 0 ? 8 : insets.bottom + 28;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={authModalVisible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Tapping the dark backdrop dismisses keyboard and closes modal */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/*
          The sheet translates upward by exactly the keyboard height so it
          always sits right above the keyboard. maxHeight shrinks simultaneously
          so the content never overflows the top of the visible screen.
          Both animations use useNativeDriver:true for smooth 60-fps movement.
        */}
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              paddingBottom: sheetPaddingBottom,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {step === "phone" ? "Verify Phone" : "Enter OTP"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ── Progress dots ── */}
          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressDot,
                step === "phone" && styles.progressDotActive,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressDot,
                step === "otp" && styles.progressDotActive,
              ]}
            />
          </View>

          {/*
            ScrollView ensures the inputs are always reachable even on small
            screens. keyboardShouldPersistTaps="handled" lets buttons inside
            the scroll view receive taps while the keyboard is open.
          */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {step === "phone" ? (
              <PhoneInput
                onSend={handleSendOTP}
                loading={sendOtpMutation.isPending}
                errorMessage={sendError}
              />
            ) : (
              <OTPVerification
                phone={phone}
                onVerify={handleVerifyOTP}
                onBack={() => setStep("phone")}
              />
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    // maxHeight is set dynamically via inline style (shrinks when keyboard opens)
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 6,
  },
});
