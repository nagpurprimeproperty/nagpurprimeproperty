import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/theme/colors";
import React from "react";
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
}

export default function PhoneInput({ onSend, loading, errorMessage }: Props) {
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
    <View style={{ flex: 1 }}>
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
                style={styles.input}
                placeholder="98765 43210"
                placeholderTextColor="#CBD5E1"
                keyboardType="phone-pad"
                maxLength={10}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoFocus
              />
            </View>

            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            ) : (
              <Text style={styles.hint}>We will send a 6-digit OTP for verification</Text>
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

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || loading}
        style={[styles.button, (!isValid || loading) && { opacity: 0.5 }]}
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

      <View style={styles.termsRow}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{" "}
          <Text style={styles.termsBold}>Terms</Text> and{" "}
          <Text style={styles.termsBold}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  termsRow: {
    marginTop: 20,
    alignItems: "center",
  },
  termsText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
  termsBold: {
    fontWeight: "700",
    color: colors.textSecondary,
  },
});