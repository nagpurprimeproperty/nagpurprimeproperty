import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  AlertTriangle,
  Trash2,
  Check,
  Building2,
  Users,
  MessageSquare,
  CreditCard,
  AlertCircle,
  ArrowLeft,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast/headless";

import ScreenHeader from "@/shared/components/ScreenHeader";
import ScreenWrapper from "@/shared/components/ScreenWrapper";
import colors from "@/theme/colors";
import { useAuthStore } from "@/features/auth";
import { disconnectSocket } from "@/config/socket";
import { requestDeletionOTP, confirmDeletion } from "@/features/auth/services/authService";

const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export default function DeleteAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutFromStore = useAuthStore((state) => state.logout);
  const phone = useAuthStore((state) => state.phone);
  const user = useAuthStore((state) => state.user);

  const userPhone = phone || user?.mobile || "";

  const [step, setStep] = useState<"confirm" | "otp">("confirm");
  const [confirmText, setConfirmText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [otpText, setOtpText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isFormValid =
    confirmText.trim().toUpperCase() === CONFIRMATION_PHRASE && isChecked;

  const handleRequestOtp = async () => {
    if (!isFormValid) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      if (!userPhone) {
        throw new Error("Unable to retrieve your mobile number. Please contact support.");
      }
      await requestDeletionOTP(userPhone);
      setStep("otp");
      toast.success("Verification OTP sent.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send verification OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (otpText.length !== 4) {
      setErrorMsg("Please enter the 4-digit OTP code.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await confirmDeletion(userPhone, otpText);
      
      // Cleanup session and state
      disconnectSocket();
      logoutFromStore();
      queryClient.clear();
      
      toast.success("Account deleted successfully.");
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper edges={["top"]}>
      <ScreenHeader
        title="Delete Account"
        subtitle="Manage your profile settings"
        showBack={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.warningCard}
        >
          <View style={styles.warningHeader}>
            <AlertTriangle size={22} color={colors.error} strokeWidth={2.5} />
            <Text style={styles.warningTitle}>Warning: Permanent Action</Text>
          </View>
          <Text style={styles.warningText}>
            Deleting your account is permanent and cannot be undone. Once deleted,
            all your records will be purged from our systems.
          </Text>
        </Animated.View>

        {step === "confirm" && (
          <>
            <Text style={styles.sectionTitle}>What you will lose:</Text>

            <View style={styles.impactList}>
              {[
                {
                  icon: Building2,
                  title: "Your Listings",
                  desc: "All your active and drafted property listings will be permanently deleted.",
                },
                {
                  icon: Users,
                  title: "Active Leads",
                  desc: "Any prospective buyer or tenant leads you have collected will be deleted.",
                },
                {
                  icon: MessageSquare,
                  title: "Enquiries & Messages",
                  desc: "All chat histories, enquiries, and communication will be cleared.",
                },
                {
                  icon: CreditCard,
                  title: "Subscription Plans",
                  desc: "Active subscriptions will be terminated. There are no refunds for remaining time.",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Animated.View
                    key={item.title}
                    entering={FadeInDown.delay(100 + index * 50).duration(250)}
                    style={styles.impactItem}
                  >
                    <View style={styles.impactIconBg}>
                      <Icon size={18} color="#475569" strokeWidth={2.2} />
                    </View>
                    <View style={styles.impactContent}>
                      <Text style={styles.impactTitle}>{item.title}</Text>
                      <Text style={styles.impactDesc}>{item.desc}</Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>

            <Animated.View
              entering={FadeInDown.delay(300).duration(250)}
              style={styles.formContainer}
            >
              <Text style={styles.inputLabel}>
                Type <Text style={styles.boldText}>{CONFIRMATION_PHRASE}</Text> below to confirm:
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  confirmText.toUpperCase() === CONFIRMATION_PHRASE && styles.textInputSuccess,
                ]}
                value={confirmText}
                onChangeText={(text) => {
                  setConfirmText(text);
                  setErrorMsg(null);
                }}
                placeholder="DELETE MY ACCOUNT"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                editable={!loading}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkboxRow}
                onPress={() => {
                  if (loading) return;
                  setIsChecked(!isChecked);
                  setErrorMsg(null);
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && styles.checkboxChecked,
                  ]}
                >
                  {isChecked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>
                  I understand and agree that this action is irreversible and all my data will be permanently wiped.
                </Text>
              </TouchableOpacity>

              {errorMsg && (
                <View style={styles.errorBox}>
                  <AlertCircle size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.deleteButton,
                  (!isFormValid || loading) && styles.deleteButtonDisabled,
                ]}
                onPress={handleRequestOtp}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Trash2 size={18} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.deleteButtonText}>Request Deletion OTP</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        {step === "otp" && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.formContainer}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setErrorMsg(null);
                setStep("confirm");
              }}
              style={styles.backButton}
              disabled={loading}
            >
              <ArrowLeft size={16} color="#64748B" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.otpLabel}>
              We have sent a verification code to your registered mobile number:{"\n"}
              <Text style={styles.boldText}>
                {userPhone.slice(0, 3)}****{userPhone.slice(-3)}
              </Text>
            </Text>

            <Text style={styles.inputLabel}>Enter 4-Digit OTP:</Text>
            <TextInput
              style={styles.textInput}
              value={otpText}
              onChangeText={(text) => {
                setOtpText(text.replace(/\D/g, "").slice(0, 4));
                setErrorMsg(null);
              }}
              placeholder="e.g. 1234"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={4}
              editable={!loading}
            />

            {errorMsg && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.deleteButton,
                (otpText.length !== 4 || loading) && styles.deleteButtonDisabled,
              ]}
              onPress={handleConfirmDelete}
              disabled={otpText.length !== 4 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Trash2 size={18} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.deleteButtonText}>Confirm &amp; Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.error,
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  warningText: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 19,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  impactList: {
    marginBottom: 24,
  },
  impactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  impactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  impactContent: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  impactDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputLabel: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 10,
    fontWeight: "600",
  },
  otpLabel: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "950",
    color: "#0F172A",
  },
  textInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 16,
  },
  textInputSuccess: {
    borderColor: colors.success,
    backgroundColor: "#F0FDF4",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
    fontWeight: "600",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "#FEE2E2",
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 8,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.error,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowColor: "transparent",
    elevation: 0,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
    marginLeft: 4,
  },
});
