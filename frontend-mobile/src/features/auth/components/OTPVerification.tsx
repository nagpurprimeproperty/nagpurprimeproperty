import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/theme/colors";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Schema ────────────────────────────────────────────────────────────────────

const otpSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d{4}$/, "OTP must contain only digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  phone: string;
  onVerify: (otp: string) => Promise<void>;
  onBack: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OTPVerification({ phone, onVerify, onBack }: Props) {
  // Digits are managed locally so each box stays independently focusable.
  // The assembled string is synced into RHF via setValue for validation.
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  const {
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  // ── countdown ──
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // ── delayed focus on first OTP box ──
  // autoFocus inside a Modal fires too early on iOS (during the slide-up
  // animation), causing the keyboard to fight the Animated sheet. We
  // manually focus after the animation has completed instead.
  useEffect(() => {
    const t = setTimeout(() => {
      inputs.current[0]?.focus();
    }, 400);
    return () => clearTimeout(t);
  }, []);

  // ── submit ──
  const onSubmit = async ({ otp }: OTPFormData) => {
    setLoading(true);
    try {
      await onVerify(otp);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Incorrect OTP. Please try again.";

      setError("otp", { message });
    } finally {
      setLoading(false);
    }
  };

  // ── digit change ──
  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const next = [...digits];
    next[index] = text.slice(-1);
    setDigits(next);

    const assembled = next.join("");
    setValue("otp", assembled, { shouldValidate: true });

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are filled and valid
    if (assembled.length === 4) {
      handleSubmit(onSubmit)();
    }
  };

  // ── backspace navigation ──
  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // ── resend ──
  const handleResend = () => {
    setTimer(30);
    const cleared = ["", "", "", ""];
    setDigits(cleared);
    setValue("otp", "", { shouldValidate: false });
    clearErrors("otp");
    inputs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Code sent to <Text style={styles.phone}>+91 {phone}</Text>
      </Text>

      <View style={styles.otpRow}>
        {digits.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => { inputs.current[i] = r; }}
            style={[
              styles.otpBox,
              !!digit && styles.otpBoxFilled,
              !!errors.otp && styles.otpBoxError,
              i === 0 && { marginLeft: 0 },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            selectTextOnFocus
          />
        ))}
      </View>

      {errors.otp && (
        <Text style={styles.errorText}>{errors.otp.message}</Text>
      )}

      <TouchableOpacity
        onPress={onBack}
        style={styles.changeNumber}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={14} color={colors.primary} />
        <Text style={styles.changeNumberText}>Change number</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={loading}
        onPress={handleSubmit(onSubmit)}
        style={[styles.button, loading && { opacity: 0.6 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}>Verify & Continue</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <View style={styles.resendRow}>
        {timer > 0 ? (
          <Text style={styles.resendText}>Resend in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
            <Text style={styles.resendActive}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 28,
    fontWeight: "500",
  },
  phone: {
    fontWeight: "800",
    color: colors.text,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginLeft: 6,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
  changeNumber: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 4,
  },
  changeNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  button: {
    marginTop: 28,
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  resendRow: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: "500",
  },
  resendActive: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "800",
  },
});