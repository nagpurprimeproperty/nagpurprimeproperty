import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Check,
  Crown,
  Zap,
  Sparkles,
  Gift,
  ArrowRight,
  Star,
  RefreshCw,
  XCircle,
  Calendar,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

import ScreenHeader from "@/components/common/ScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { usePlans, useMySubscription } from "@/hooks/useSubscriptionHooks";
import { useAuthStore } from "@/store/authStore";
import colors from "@/theme/colors";
import type { SubscriptionPlan } from "@/services/subscriptionService";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(plan: SubscriptionPlan): string {
  if (plan.isDurationUnlimited || plan.duration === 0) return "Forever";
  return `${plan.duration} ${plan.durationUnit}`;
}

function getPlanIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("enterprise")) return Crown;
  if (n.includes("premium"))    return Sparkles;
  if (n.includes("basic"))      return Zap;
  return Gift;
}

const isEnterprise = (name: string) => name.toLowerCase().includes("enterprise");
const isPremium    = (name: string) => name.toLowerCase().includes("premium");

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PlansSkeleton() {
  return (
    <View style={sk.wrap}>
      <View style={sk.banner} />
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={sk.card}>
          <View style={sk.topRow}>
            <View style={sk.icon} />
            <View style={{ flex: 1 }}>
              <View style={sk.lineLg} />
              <View style={sk.lineSm} />
            </View>
          </View>
          <View style={sk.divider} />
          <View style={sk.lineXl} />
          <View style={sk.lineMd} />
          <View style={sk.lineMd} />
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  wrap:    { padding: 12, paddingTop: 10 },
  banner:  { height: 80, backgroundColor: colors.primaryLight, borderRadius: 16, marginBottom: 16 },
  card:    { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  topRow:  { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  icon:    { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.borderLight },
  lineLg:  { width: 130, height: 15, backgroundColor: colors.borderLight, borderRadius: 8, marginBottom: 8 },
  lineSm:  { width: 80, height: 11, backgroundColor: colors.secondaryLight, borderRadius: 6 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginBottom: 16 },
  lineXl:  { width: "90%", height: 13, backgroundColor: colors.borderLight, borderRadius: 6, marginBottom: 10 },
  lineMd:  { width: "70%", height: 12, backgroundColor: colors.secondaryLight, borderRadius: 6, marginBottom: 8 },
});

// ─── Active Plan Banner ────────────────────────────────────────────────────────

function ActivePlanBanner({
  planName, status, endDate,
}: { planName: string; status: string; endDate?: string }) {
  const router    = useRouter();
  const formatted = endDate
    ? new Date(endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/(subscription)/mySubscription")}
      style={ab.card}
    >
      <View style={ab.left}>
        <View style={ab.iconWrap}>
          <Star size={18} color={colors.primary} strokeWidth={2.5} />
        </View>
        <View>
          <Text style={ab.label}>Current Plan</Text>
          <Text style={ab.name}>{planName}</Text>
          {formatted && (
            <View style={ab.dateRow}>
              <Calendar size={11} color={colors.primaryDark} strokeWidth={2} />
              <Text style={ab.date}>Valid till {formatted}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={ab.badge}>
        <Text style={ab.badgeText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const ab = StyleSheet.create({
  card:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.primaryLight, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.primaryMuted },
  left:      { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconWrap:  { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center" },
  label:     { fontSize: 10, fontWeight: "700", color: colors.primaryDark, textTransform: "uppercase", letterSpacing: 0.6 },
  name:      { fontSize: 15, fontWeight: "900", color: colors.text, marginTop: 1 },
  dateRow:   { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  date:      { fontSize: 11, fontWeight: "600", color: colors.primaryDark },
  badge:     { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "900", color: colors.white },
});

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, index, isCurrentPlan }: {
  plan: SubscriptionPlan; index: number; isCurrentPlan: boolean;
}) {
  const router   = useRouter();
  const Icon     = getPlanIcon(plan.name);
  const dark     = isEnterprise(plan.name);
  const featured = isPremium(plan.name);

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(220)}
      style={[
        pc.card,
        dark     && pc.cardDark,
        featured && pc.cardFeatured,
        isCurrentPlan && pc.cardActive,
      ]}
    >
      {/* Recommended badge */}
      {featured && !isCurrentPlan && (
        <View style={pc.badge}>
          <Star size={9} color={colors.white} fill={colors.white} />
          <Text style={pc.badgeText}>Recommended</Text>
        </View>
      )}

      {/* Header row */}
      <View style={pc.header}>
        <View style={[pc.iconWrap, dark && pc.iconWrapDark]}>
          <Icon size={22} color={dark ? colors.warning : colors.primary} strokeWidth={2.5} />
        </View>
        <View style={pc.info}>
          <Text style={[pc.name, dark && pc.nameDark]}>{plan.name}</Text>
          <Text style={[pc.duration, dark && pc.durationDark]}>{formatDuration(plan)}</Text>
        </View>
        <View style={pc.priceBlock}>
          <Text style={[pc.price, dark && pc.priceDark]}>
            {plan.isFree ? "Free" : `₹${plan.price}`}
          </Text>
          {!plan.isFree && (
            <Text style={[pc.per, dark && pc.perDark]}>/{plan.durationUnit}</Text>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={[pc.divider, dark && pc.dividerDark]} />

      {/* Features */}
      {plan.features.slice(0, 4).map((f, i) => (
        <View key={i} style={pc.featureRow}>
          <View style={[pc.checkWrap, dark && pc.checkWrapDark]}>
            <Check size={10} color={dark ? colors.warning : colors.primary} strokeWidth={3.5} />
          </View>
          <Text style={[pc.featureText, dark && pc.featureTextDark]} numberOfLines={1}>{f}</Text>
        </View>
      ))}

      {/* Description */}
      <Text style={[pc.desc, dark && pc.descDark]} numberOfLines={2}>
        {plan.description}
      </Text>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={isCurrentPlan ? 1 : 0.82}
        disabled={isCurrentPlan}
        onPress={() =>
          router.push({ pathname: "/(subscription)/subscriptionDetail", params: { id: plan._id } })
        }
        style={[
          pc.cta,
          dark         && pc.ctaDark,
          isCurrentPlan && pc.ctaActive,
        ]}
      >
        {isCurrentPlan ? (
          <Check size={14} color={colors.primary} strokeWidth={3} />
        ) : (
          <ArrowRight size={14} color={dark ? colors.text : colors.white} strokeWidth={2.5} />
        )}
        <Text style={[pc.ctaText, dark && pc.ctaTextDark, isCurrentPlan && pc.ctaTextActive]}>
          {isCurrentPlan
            ? "Current Plan"
            : plan.isFree
            ? "Get Started Free"
            : `Upgrade · ₹${plan.price}`}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pc = StyleSheet.create({
  card:          { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardDark:      { backgroundColor: colors.secondaryDark, borderColor: colors.secondary },
  cardFeatured:  { borderColor: colors.primary, borderWidth: 1.5 },
  cardActive:    { borderColor: colors.success, borderWidth: 1.5 },
  // Badge
  badge:         { position: "absolute", top: -10, left: 18, flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  badgeText:     { fontSize: 9, fontWeight: "900", color: colors.white, letterSpacing: 0.5 },
  // Header
  header:        { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  iconWrap:      { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  iconWrapDark:  { backgroundColor: colors.secondary },
  info:          { flex: 1 },
  name:          { fontSize: 16, fontWeight: "900", color: colors.text, letterSpacing: -0.3 },
  nameDark:      { color: "#F9FAFB" },
  duration:      { fontSize: 11, fontWeight: "700", color: colors.textMuted, marginTop: 2 },
  durationDark:  { color: colors.inactive },
  // Price
  priceBlock:    { alignItems: "flex-end" },
  price:         { fontSize: 20, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  priceDark:     { color: colors.warning },
  per:           { fontSize: 10, fontWeight: "600", color: colors.textLight, marginTop: 2 },
  perDark:       { color: colors.inactive },
  // Divider
  divider:       { height: 1, backgroundColor: colors.borderLight, marginBottom: 14 },
  dividerDark:   { backgroundColor: colors.secondary },
  // Features
  featureRow:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  checkWrap:     { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  checkWrapDark: { backgroundColor: colors.secondary },
  featureText:   { fontSize: 13, fontWeight: "600", color: colors.textSecondary, flex: 1 },
  featureTextDark:{ color: "#D1D5DB" },
  // Desc
  desc:          { fontSize: 12, color: colors.textLight, lineHeight: 18, marginTop: 4, marginBottom: 14, fontStyle: "italic" },
  descDark:      { color: colors.inactive },
  // CTA
  cta:           { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13, gap: 8 },
  ctaDark:       { backgroundColor: colors.warning },
  ctaActive:     { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primaryMuted },
  ctaText:       { fontSize: 13, fontWeight: "900", color: colors.white, letterSpacing: 0.3 },
  ctaTextDark:   { color: colors.text },
  ctaTextActive: { color: colors.primary },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function SubscriptionScreen() {
  const router          = useRouter();
  const safeInsets      = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: plansData, isLoading, isError, refetch } = usePlans();
  const { data: mySubData } = useMySubscription(isAuthenticated);

  const plans      = plansData?.data ?? [];
  const activePlan = mySubData?.data;

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Subscription Plans"
        subtitle="Choose the right plan for your business"
      />

      {isLoading ? (
        <PlansSkeleton />
      ) : isError ? (
        <View style={ms.center}>
          <XCircle size={40} color={colors.error} />
          <Text style={ms.errTitle}>Failed to load plans</Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <RefreshCw size={14} color={colors.white} />
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[ms.scroll, { paddingBottom: safeInsets.bottom + 40 }]}
        >
          {/* Active plan banner */}
          {activePlan && (
            <ActivePlanBanner
              planName={activePlan.planName}
              status={activePlan.status}
              endDate={activePlan.endDate}
            />
          )}

          {/* Promo hero */}
          <Animated.View entering={FadeInDown.duration(400)} style={ms.promo}>
            <View style={ms.promoGlob} />
            <Text style={ms.promoTitle}>Grow Your Business</Text>
            <Text style={ms.promoSub}>
              Unlock listings, leads & analytics. Cancel anytime.
            </Text>
            {isAuthenticated && activePlan && (
              <TouchableOpacity
                onPress={() => router.push("/(subscription)/mySubscription")}
                activeOpacity={0.8}
                style={ms.myPlanBtn}
              >
                <Text style={ms.myPlanText}>View My Subscription</Text>
                <ArrowRight size={13} color={colors.warning} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Plan cards */}
          {plans.map((plan, index) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              index={index}
              isCurrentPlan={activePlan?.planId?._id === plan._id}
            />
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const ms = StyleSheet.create({
  center:     { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  scroll:     { paddingHorizontal: 12, paddingTop: 12 },
  errTitle:   { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: 16 },
  retryBtn:   { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  retryText:  { color: colors.white, fontWeight: "900", fontSize: 12, letterSpacing: 0.8 },
  // Promo
  promo:      { backgroundColor: colors.secondaryDark, borderRadius: 18, padding: 22, marginBottom: 20, overflow: "hidden" },
  promoGlob:  { position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(249,115,22,0.2)" },
  promoTitle: { fontSize: 20, fontWeight: "900", color: "#F9FAFB", letterSpacing: -0.4 },
  promoSub:   { fontSize: 13, fontWeight: "500", color: colors.inactive, marginTop: 6, lineHeight: 20 },
  myPlanBtn:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, alignSelf: "flex-start", backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  myPlanText: { fontSize: 12, fontWeight: "800", color: colors.warning },
});
