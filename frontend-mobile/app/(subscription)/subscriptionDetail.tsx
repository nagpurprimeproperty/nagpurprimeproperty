import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Check,
  Crown,
  Zap,
  Sparkles,
  Gift,
  RefreshCw,
  XCircle,
  ExternalLink,
  BarChart2,
  Home,
  Star,
  Users,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams } from "expo-router";
import { toast } from "react-hot-toast/headless";
import * as Haptics from "expo-haptics";

import ScreenHeader from "@/shared/components/ScreenHeader";
import ScreenWrapper from "@/shared/components/ScreenWrapper";
import { usePlanDetail, usePurchasePlan, useMySubscription } from "@/hooks/useSubscriptionHooks";
import { useAuthStore } from "@/features/auth";
import { useModal } from "@/context/ModalContext";
import colors from "@/theme/colors";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getPlanIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("enterprise")) return Crown;
  if (n.includes("premium"))    return Sparkles;
  if (n.includes("basic"))      return Zap;
  return Gift;
}

function limitLabel(unlimited: boolean, count: number, unit: string) {
  return unlimited ? `Unlimited ${unit}` : `${count} ${unit}`;
}

function formatDuration(duration: number, unit: string, unlimited: boolean) {
  if (unlimited || duration === 0) return "Forever";
  return `${duration} ${unit}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <View style={sk.wrap}>
      <View style={sk.hero} />
      {[1, 2, 3].map((i) => (
        <View key={i} style={sk.card}>
          <View style={sk.label} />
          <View style={sk.chipRow}>
            <View style={sk.chip} />
            <View style={sk.chip} />
          </View>
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  wrap:    { padding: 12, paddingTop: 10 },
  hero:    { height: 160, backgroundColor: colors.borderLight, borderRadius: 20, marginBottom: 14 },
  card:    { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  label:   { width: "50%", height: 11, backgroundColor: colors.borderLight, borderRadius: 6, marginBottom: 14 },
  chipRow: { flexDirection: "row", gap: 10 },
  chip:    { flex: 1, height: 60, backgroundColor: colors.secondaryLight, borderRadius: 12 },
});

// ─── Limit Chip ────────────────────────────────────────────────────────────────

function LimitChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={lc.wrap}>
      <View style={lc.iconWrap}>
        <Icon size={16} color={colors.primary} strokeWidth={2.5} />
      </View>
      <Text style={lc.value}>{value}</Text>
      <Text style={lc.label}>{label}</Text>
    </View>
  );
}

const lc = StyleSheet.create({
  wrap:    { flex: 1, backgroundColor: colors.primaryLight, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.primaryMuted },
  iconWrap:{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  value:   { fontSize: 13, fontWeight: "900", color: colors.primaryDark, textAlign: "center" },
  label:   { fontSize: 10, fontWeight: "700", color: colors.textSecondary, textAlign: "center", marginTop: 3 },
});

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <View style={sl.row}>
      <Icon size={14} color={colors.primary} strokeWidth={2.5} />
      <Text style={sl.text}>{text}</Text>
    </View>
  );
}

const sl = StyleSheet.create({
  row:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  text: { fontSize: 11, fontWeight: "900", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.8 },
});

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ visible, planName, price, onCancel, onConfirm, loading }: {
  visible: boolean; planName: string; price: number;
  onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={cm.backdrop} onPress={onCancel} />
      <View style={[cm.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={cm.handle} />
        <Text style={cm.title}>Confirm Purchase</Text>
        <Text style={cm.sub}>You are about to purchase</Text>

        <View style={cm.planCard}>
          <Text style={cm.planName}>{planName}</Text>
          <Text style={cm.planPrice}>₹{price}</Text>
        </View>

        <Text style={cm.note}>
          You'll be redirected to Razorpay to complete your payment securely.
        </Text>

        <View style={cm.actions}>
          <TouchableOpacity onPress={onCancel} activeOpacity={0.75} style={cm.cancelBtn}>
            <Text style={cm.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} activeOpacity={0.85} disabled={loading} style={cm.payBtn}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <ExternalLink size={15} color={colors.white} strokeWidth={2.5} />
                <Text style={cm.payText}>Pay ₹{price}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const cm = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet:     { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 14 },
  handle:    { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  title:     { fontSize: 20, fontWeight: "900", color: colors.text, marginBottom: 4 },
  sub:       { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  planCard:  { backgroundColor: colors.primaryLight, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, borderWidth: 1, borderColor: colors.primaryMuted },
  planName:  { fontSize: 16, fontWeight: "900", color: colors.primaryDark },
  planPrice: { fontSize: 22, fontWeight: "900", color: colors.primary },
  note:      { fontSize: 12, color: colors.textLight, textAlign: "center", lineHeight: 18, marginBottom: 24 },
  actions:   { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  cancelText:{ fontSize: 14, fontWeight: "800", color: colors.textSecondary },
  payBtn:    { flex: 2, paddingVertical: 15, borderRadius: 14, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  payText:   { fontSize: 14, fontWeight: "900", color: colors.white },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function SubscriptionDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const insets   = useSafeAreaInsets();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { openAuth }        = useModal();

  const { data, isLoading, isError, error, refetch } = usePlanDetail(id);
  const { data: mySubData }  = useMySubscription(isAuthenticated);
  const purchaseMutation     = usePurchasePlan();

  const plan          = data?.data;
  const activePlanId  = mySubData?.data?.planId?._id;
  const isCurrentPlan = activePlanId === plan?._id;
  const Icon          = plan ? getPlanIcon(plan.name) : Gift;
  const dark          = plan?.name.toLowerCase().includes("enterprise") ?? false;

  const handlePurchase = () => {
    if (!isAuthenticated) { openAuth("subscription"); return; }
    setConfirmVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    purchaseMutation.mutate(id!, {
      onSuccess: (res) => {
        const url = res.data?.paymentLinkUrl;
        if (url) {
          Linking.openURL(url).catch(() => toast.error("Could not open payment link"));
        } else {
          toast.success("Subscription activated!");
        }
      },
      onError: (e) => toast.error(e.message || "Purchase failed"),
    });
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Plan Details" subtitle={plan?.name ?? "Loading…"} />

      {isLoading ? (
        <DetailSkeleton />
      ) : isError ? (
        <View style={ms.center}>
          <XCircle size={40} color={colors.error} />
          <Text style={ms.errTitle}>Failed to load plan</Text>
          <Text style={ms.errSub}>{error?.message}</Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <RefreshCw size={14} color={colors.white} />
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : plan ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[ms.scroll, { paddingBottom: insets.bottom + 110 }]}
          >
            {/* Hero */}
            <Animated.View
              entering={FadeInDown.duration(420)}
              style={[ms.hero, dark && ms.heroDark]}
            >
              <View style={ms.heroGlob} />
              <View style={[ms.heroIcon, dark && ms.heroIconDark]}>
                <Icon size={32} color={dark ? colors.warning : colors.primary} strokeWidth={2} />
              </View>
              <Text style={[ms.heroName, dark && ms.heroNameDark]}>{plan.name}</Text>
              <View style={ms.heroPriceRow}>
                <Text style={[ms.heroPrice, dark && ms.heroPriceDark]}>
                  {plan.isFree ? "Free" : `₹${plan.price}`}
                </Text>
                {!plan.isFree && (
                  <Text style={[ms.heroPer, dark && ms.heroPerDark]}>
                    / {formatDuration(plan.duration, plan.durationUnit, plan.isDurationUnlimited)}
                  </Text>
                )}
              </View>
              {isCurrentPlan && (
                <View style={ms.activeBadge}>
                  <Check size={11} color={colors.white} strokeWidth={3} />
                  <Text style={ms.activeBadgeText}>Active Plan</Text>
                </View>
              )}
            </Animated.View>

            {/* Limits grid */}
            <Animated.View entering={FadeInDown.delay(80).duration(420)} style={ms.card}>
              <SectionLabel icon={Home} text="Plan Limits" />
              <View style={ms.chipGrid}>
                <LimitChip icon={Home}  label="Listings"    value={limitLabel(plan.limits.isPropertyUploadUnlimited, plan.limits.propertyUploads, "Listings")} />
                <LimitChip icon={Star}  label="Featured"    value={limitLabel(plan.limits.isFeaturedPropertiesUnlimited, plan.limits.featuredProperties, "Featured")} />
              </View>
              <View style={[ms.chipGrid, ms.chipGridTop]}>
                <LimitChip icon={Users}     label="Leads"     value={limitLabel(plan.limits.isLeadAccessUnlimited, plan.limits.leadAccessCount, "Leads")} />
                <LimitChip icon={BarChart2} label="Analytics" value={plan.limits.analyticsAccess ? "Included" : "Not Included"} />
              </View>
            </Animated.View>

            {/* Features */}
            <Animated.View entering={FadeInDown.delay(160).duration(420)} style={ms.card}>
              <SectionLabel icon={Sparkles} text="Included Features" />
              {plan.features.map((f, i) => (
                <View key={i} style={ms.featureRow}>
                  <View style={ms.featureCheck}>
                    <Check size={10} color={colors.primary} strokeWidth={3.5} />
                  </View>
                  <Text style={ms.featureText}>{f}</Text>
                </View>
              ))}
              {plan.limits.prioritySupport && (
                <View style={ms.featureRow}>
                  <View style={ms.featureCheck}>
                    <Check size={10} color={colors.primary} strokeWidth={3.5} />
                  </View>
                  <Text style={ms.featureText}>Priority Support</Text>
                </View>
              )}
            </Animated.View>

            {/* Description */}
            <Animated.View entering={FadeInDown.delay(240).duration(420)} style={ms.card}>
              <SectionLabel icon={Gift} text="About This Plan" />
              <Text style={ms.description}>{plan.description}</Text>
            </Animated.View>
          </ScrollView>

          {/* Sticky CTA */}
          <View style={[ms.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
            {isCurrentPlan ? (
              <View style={ms.currentBar}>
                <Check size={16} color={colors.success} strokeWidth={3} />
                <Text style={ms.currentBarText}>You're on this plan</Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => isAuthenticated ? setConfirmVisible(true) : openAuth("subscription")}
                disabled={purchaseMutation.isPending}
                style={[ms.cta, dark && ms.ctaDark]}
              >
                {purchaseMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <ExternalLink size={16} color={dark ? colors.text : colors.white} strokeWidth={2.5} />
                    <Text style={[ms.ctaText, dark && ms.ctaTextDark]}>
                      {plan.isFree ? "Get Started Free" : `Upgrade to ${plan.name} · ₹${plan.price}`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <ConfirmModal
            visible={confirmVisible}
            planName={plan.name}
            price={plan.price}
            onCancel={() => setConfirmVisible(false)}
            onConfirm={handlePurchase}
            loading={purchaseMutation.isPending}
          />
        </>
      ) : null}
    </ScreenWrapper>
  );
}

const ms = StyleSheet.create({
  center:       { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  scroll:       { paddingHorizontal: 12, paddingTop: 12 },
  errTitle:     { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: 16 },
  errSub:       { color: colors.textMuted, textAlign: "center", marginTop: 8 },
  retryBtn:     { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  retryText:    { color: colors.white, fontWeight: "900", fontSize: 12, letterSpacing: 0.8 },
  // Hero
  hero:         { backgroundColor: colors.primaryLight, borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.primaryMuted },
  heroDark:     { backgroundColor: colors.secondaryDark, borderColor: colors.secondary },
  heroGlob:     { position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(249,115,22,0.15)" },
  heroIcon:     { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  heroIconDark: { backgroundColor: colors.secondary },
  heroName:     { fontSize: 22, fontWeight: "900", color: colors.primary, letterSpacing: -0.5 },
  heroNameDark: { color: "#F9FAFB" },
  heroPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 8 },
  heroPrice:    { fontSize: 28, fontWeight: "900", color: colors.primary, letterSpacing: -1 },
  heroPriceDark:{ color: colors.warning },
  heroPer:      { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  heroPerDark:  { color: colors.inactive },
  activeBadge:  { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.success, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  activeBadgeText:{ fontSize: 11, fontWeight: "900", color: colors.white },
  // Card
  card:         { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  chipGrid:     { flexDirection: "row", gap: 10 },
  chipGridTop:  { marginTop: 10 },
  // Features
  featureRow:   { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  featureCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  featureText:  { fontSize: 14, fontWeight: "600", color: colors.textSecondary, flex: 1 },
  description:  { fontSize: 13, color: colors.textMuted, lineHeight: 22 },
  // Bottom bar
  bottomBar:    { position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: 14, paddingHorizontal: 14, backgroundColor: "rgba(255,253,250,0.97)", borderTopWidth: 1, borderTopColor: colors.borderLight },
  cta:          { height: 54, borderRadius: 14, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  ctaDark:      { backgroundColor: colors.warning },
  ctaText:      { fontSize: 14, fontWeight: "900", color: colors.white, letterSpacing: 0.3 },
  ctaTextDark:  { color: colors.text },
  currentBar:   { height: 54, borderRadius: 14, backgroundColor: colors.successLight, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: colors.successDark + "40" },
  currentBarText:{ fontSize: 14, fontWeight: "900", color: colors.successDark },
});
