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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const phoneAndNameSchema = z.object({
  phone: z
    .string()
    .length(10, "Must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(50, "Name should be under 50 characters"),
});

type PhoneFormData = z.infer<typeof phoneAndNameSchema>;

interface Props {
  onSend: (phone: string, name: string) => void;
  loading: boolean;
  errorMessage?: string | null;
  onNavigate?: (route: string) => void;
}

export default function PhoneInput({ onSend, loading, errorMessage, onNavigate }: Props) {
  const [agreed, setAgreed] = useState(false);
  // Delayed focus: wait for the modal slide-up animation to finish on iOS
  // before opening the keyboard. autoFocus fires too early and causes the
  // KeyboardAvoidingView / Animated sheet to jank/crash.
  const phoneInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneAndNameSchema),
    mode: "onChange",
    defaultValues: { phone: "", name: "" },
  });

  const onSubmit = ({ phone, name }: PhoneFormData) => onSend(phone, name);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Enter your mobile number and name to continue
      </Text>

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <View style={[styles.inputRow, !!errors.phone && styles.inputRowError]}>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>+91</Text>
              </View>
              <TextInput
                ref={phoneInputRef}
                style={styles.input}
                placeholder="98765 43210"
                placeholderTextColor="#CBD5E1"
                keyboardType="phone-pad"
                maxLength={10}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </View>

            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            ) : (
              <Text style={styles.hint}>We will send a 4-digit OTP for verification</Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={[styles.nameContainer, !!errors.name && styles.inputRowError]}>
            <TextInput
              style={styles.nameInput}
              placeholder="Your full name"
              placeholderTextColor="#CBD5E1"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            ) : null}
          </View>
        )}
      />

      {/* ── Terms & Privacy Checkbox ── */}
      <View style={styles.checkboxRow}>
        {/* Checkbox box — tap to toggle agreed */}
        <TouchableOpacity
          onPress={() => setAgreed((v) => !v)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.checkboxHit}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && (
              <Ionicons name="checkmark" size={13} color="#fff" strokeWidth={3} />
            )}
          </View>
        </TouchableOpacity>

        {/* Text with inline clickable links — separate from checkbox toggle */}
        <Text style={styles.checkboxLabel}>
          {"I agree to the "}
          <Text
            style={styles.checkboxLink}
            suppressHighlighting
            onPress={() => onNavigate?.("/(accountAndSupport)/termsAndConditions")}
          >
            Terms & Conditions
          </Text>
          {" and "}
          <Text
            style={styles.checkboxLink}
            suppressHighlighting
            onPress={() => onNavigate?.("/(accountAndSupport)/privacy")}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || loading || !agreed}
        style={[styles.button, (!isValid || loading || !agreed) && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}>Send OTP</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 60,
  },
  inputRowError: {
    borderColor: colors.error,
    backgroundColor: "#FEF2F2",
  },
  codeBox: {
    paddingRight: 12,
    borderRightWidth: 1.5,
    borderRightColor: colors.border,
    marginRight: 12,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 1,
  },
  nameContainer: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    minHeight: 44,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
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
  buttonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  // ── Checkbox row ──────────────────────────────────────────────────────────
  checkboxRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 2,
  },
  checkboxHit: {
    marginTop: 1, // align with first line of text
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: "500",
  },
  checkboxLink: {
    color: colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});