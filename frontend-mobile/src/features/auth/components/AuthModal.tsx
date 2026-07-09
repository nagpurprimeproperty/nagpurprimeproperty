import { useAuthStore } from "@/features/auth/store/authStore";
import { useModal } from "@/context/ModalContext";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/features/auth/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

  const handleSendOTP = async (enteredPhone: string, name: string) => {
    if (enteredPhone.length < 10) {
      return;
    }

    setSendError(null);
    setLocalPhone(enteredPhone);

    try {
      const response = await sendOtpMutation.mutateAsync({
        mobile: enteredPhone,
        name: name.trim() || "Customer",
      });

      const otpCode = response.data?.trim();
      const toastMessage = otpCode && /^\d{4,8}$/.test(otpCode)
        ? `OTP: ${otpCode}`
        : response.message || `OTP sent to ${enteredPhone}`;

      hotToast.success(toastMessage, {
        duration: 7000,
      });
      setPhone(enteredPhone);
      setStep("otp");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send OTP. Please try again.";

      hotToast.error(message, {
        duration: 7000,
      });
      setSendError(message);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (otp.length !== 4) {
      return;
    }

    await verifyOtpMutation.mutateAsync({
      mobile: phone,
      otp,
    });

    // Close the modal — previously setSession() did this implicitly by
    // writing showAuthModal:false into authStore. Now that the modal is
    // owned by ModalContext the component must close it explicitly.
    closeAuth();
    setStep("phone");
    setLocalPhone("");
  };

  const handleClose = () => {
    closeAuth();
    setStep("phone");
    setLocalPhone("");
  };

  return (
    <Modal
      visible={authModalVisible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 20 : 0}
        style={{ flex: 1 }}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 28 }]}>            
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.title}>
                {step === "phone" ? "Verify Phone" : "Enter OTP"}
              </Text>
              <View style={{ width: 40 }} />
            </View>

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
          </View>
        </View>
      </KeyboardAvoidingView>
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
    minHeight: SCREEN_H * 0.74,
    maxHeight: SCREEN_H * 0.95,
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
