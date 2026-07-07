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
  BarChart2,
  Shield,
  Users,
  Home,
  Star,
  ArrowRight,
  RefreshCw,
  XCircle,
  Calendar,
  Zap,
  Check,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ScreenHeader from "@/components/common/ScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { useMySubscription } from "@/hooks/useSubscriptionHooks";
import { useAuthStore } from "@/store/authStore";
import colors from "@/theme/colors";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function statusColors(s: string) {
  if (s === "Active")    return { bg: colors.successLight,  text: colors.successDark, dot: colors.success };
  if (s === "Cancelled") return { bg: colors.borderLight,   text: colors.textSecondary, dot: colors.textLight };
  if (s === "Expired")   return { bg: "#FEF2F2",            text: colors.error,       dot: colors.error };
  return                        { bg: colors.secondaryLight, text: colors.textMuted,   dot: colors.inactive };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MySkeleton() {
  return (
    <View style={sk.wrap}>
      <View style={sk.hero} />
      {[1, 2, 3].map((i) => (
        <View key={i} style={sk.card}>
          <View style={sk.label} />
          <View style={sk.track} />
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  wrap:  { padding: 12, paddingTop: 10 },
  hero:  { height: 160, backgroundColor: colors.borderLight, borderRadius: 20, marginBottom: 14 },
  card:  { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  label: { width: "50%", height: 13, backgroundColor: colors.borderLight, borderRadius: 6, marginBottom: 14 },
  track: { height: 10, backgroundColor: colors.borderLight, borderRadius: 6 },
});

// ─── Usage Progress Bar ────────────────────────────────────────────────────────

function UsageBar({ icon: Icon, label, used, total, unlimited }: {
  icon: any; label: string; used: number; total: number; unlimited: boolean;
}) {
  const pct     = unlimited || total === 0 ? 80 : Math.min((used / total) * 100, 100);
  const warning = !unlimited && total > 0 && pct >= 80;

  return (
    <View style={ub.wrap}>
      <View style={ub.header}>
        <View style={ub.iconWrap}>
          <Icon size={14} color={colors.primary} strokeWidth={2.5} />
        </View>
        <Text style={ub.label}>{label}</Text>
        <Text style={ub.count}>
          {unlimited ? `${used} / ∞` : `${used} / ${total}`}
        </Text>
      </View>
      <View style={ub.track}>
        <View
          style={[
            ub.fill,
            { width: `${unlimited ? 40 : pct}%` as any },
            warning && ub.fillWarn,
          ]}
        />
      </View>
      {unlimited && <Text style={ub.tag}>Unlimited Plan</Text>}
    </View>
  );
}

const ub = StyleSheet.create({
  wrap:     { marginBottom: 18 },
  header:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  iconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  label:    { flex: 1, fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  count:    { fontSize: 12, fontWeight: "800", color: colors.textMuted },
  track:    { height: 8, backgroundColor: colors.borderLight, borderRadius: 6, overflow: "hidden" },
  fill:     { height: "100%", backgroundColor: colors.primary, borderRadius: 6 },
  fillWarn: { backgroundColor: colors.warning },
  tag:      { fontSize: 10, fontWeight: "700", color: colors.primary, marginTop: 4 },
});

// ─── Feature Pill ─────────────────────────────────────────────────────────────

function FeaturePill({ icon: Icon, label, active }: {
  icon: any; label: string; active: boolean;
}) {
  return (
    <View style={[fp.wrap, active ? fp.active : fp.inactive]}>
      <Icon size={13} color={active ? colors.primary : colors.textLight} strokeWidth={2.5} />
      <Text style={[fp.text, active ? fp.textActive : fp.textInactive]}>{label}</Text>
      {active && <Check size={12} color={colors.primary} strokeWidth={3} style={{ marginLeft: "auto" }} />}
    </View>
  );
}

const fp = StyleSheet.create({
  wrap:        { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  active:      { backgroundColor: colors.primaryLight, borderColor: colors.primaryMuted },
  inactive:    { backgroundColor: colors.secondaryLight, borderColor: colors.borderLight },
  text:        { fontSize: 13, fontWeight: "700", flex: 1 },
  textActive:  { color: colors.text },
  textInactive:{ color: colors.textLight },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function MySubscriptionScreen() {
  const router          = useRouter();
  const insets          = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuth        = useAuthStore((s) => s.openAuth);

  const { data, isLoading, isError, error, refetch } = useMySubscription(isAuthenticated);
  const sub = data?.data;

  if (!isAuthenticated) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="My Subscription" subtitle="Your active plan" />
        <View style={ms.center}>
          <View style={ms.lockIcon}>
            <Ionicons name="lock-closed" size={36} color={colors.primary} />
          </View>
          <Text style={ms.gateTitle}>Login Required</Text>
          <Text style={ms.gateSub}>Sign in to view your active subscription.</Text>
          <TouchableOpacity onPress={() => openAuth("subscription")} activeOpacity={0.85} style={ms.gateCta}>
            <Text style={ms.gateCtaText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader title="My Subscription" subtitle="Your active plan" />

      {isLoading ? (
        <MySkeleton />
      ) : isError || !sub ? (
        <View style={ms.center}>
          {isError ? (
            <>
              <XCircle size={40} color={colors.error} />
              <Text style={ms.errTitle}>Failed to load</Text>
              <Text style={ms.errSub}>{error?.message}</Text>
              <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
                <RefreshCw size={14} color={colors.white} />
                <Text style={ms.retryText}>RETRY</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={ms.emptyIcon}>
                <Zap size={32} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={ms.errTitle}>No Active Plan</Text>
              <Text style={ms.errSub}>You don't have an active subscription yet.</Text>
              <TouchableOpacity onPress={() => router.push("/(subscription)/subscription")} activeOpacity={0.8} style={ms.retryBtn}>
                <Text style={ms.retryText}>Browse Plans</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[ms.scroll, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Hero card */}
          {(() => {
            const sc = statusColors(sub.status);
            return (
              <Animated.View entering={FadeInDown.duration(420)} style={ms.hero}>
                <View style={ms.heroGlob} />
                <View style={ms.heroTop}>
                  <View>
                    <Text style={ms.heroLabel}>Active Subscription</Text>
                    <Text style={ms.heroName}>{sub.planName}</Text>
                  </View>
                  <View style={[ms.statusBadge, { backgroundColor: sc.bg }]}>
                    <View style={[ms.statusDot, { backgroundColor: sc.dot }]} />
                    <Text style={[ms.statusText, { color: sc.text }]}>{sub.status}</Text>
                  </View>
                </View>
                <View style={ms.datesRow}>
                  <View style={ms.dateItem}>
                    <Calendar size={13} color="rgba(255,255,255,0.55)" strokeWidth={2} />
                    <Text style={ms.dateLabel}>Start</Text>
                    <Text style={ms.dateVal}>{fmtDate(sub.startDate)}</Text>
                  </View>
                  <View style={ms.dateDivider} />
                  <View style={ms.dateItem}>
                    <Calendar size={13} color="rgba(255,255,255,0.55)" strokeWidth={2} />
                    <Text style={ms.dateLabel}>Expires</Text>
                    <Text style={ms.dateVal}>{fmtDate(sub.endDate)}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })()}

          {/* Usage */}
          <Animated.View entering={FadeInDown.delay(80).duration(420)} style={ms.card}>
            <View style={ms.sectionRow}>
              <BarChart2 size={14} color={colors.primary} strokeWidth={2.5} />
              <Text style={ms.sectionTitle}>Plan Usage</Text>
            </View>
            <UsageBar
              icon={Home}  label="Properties Posted"
              used={sub.usage.propertiesPosted}       total={sub.limits.propertyUploads}
              unlimited={sub.limits.isPropertyUploadUnlimited}
            />
            <UsageBar
              icon={Users} label="Leads Unlocked"
              used={sub.usage.leadsUnlocked}          total={sub.limits.leadAccessCount}
              unlimited={sub.limits.isLeadAccessUnlimited}
            />
            <UsageBar
              icon={Star}  label="Featured Properties"
              used={sub.usage.featuredPropertiesUsed} total={sub.limits.featuredProperties}
              unlimited={sub.limits.isFeaturedPropertiesUnlimited}
            />
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInDown.delay(160).duration(420)} style={ms.card}>
            <View style={ms.sectionRow}>
              <Shield size={14} color={colors.primary} strokeWidth={2.5} />
              <Text style={ms.sectionTitle}>Plan Features</Text>
            </View>
            <FeaturePill icon={BarChart2} label="Analytics Access"  active={sub.limits.analyticsAccess} />
            <FeaturePill icon={Shield}    label="Priority Support"  active={sub.limits.prioritySupport} />
            <FeaturePill icon={Users}     label="Lead Access"       active={sub.limits.isLeadAccessUnlimited || sub.limits.leadAccessCount > 0} />
            <FeaturePill icon={Star}      label="Featured Listings" active={sub.limits.isFeaturedPropertiesUnlimited || sub.limits.featuredProperties > 0} />
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(240).duration(420)} style={ms.actions}>
            <TouchableOpacity
              onPress={() => router.push("/(subscription)/subscription")}
              activeOpacity={0.82}
              style={ms.upgradeCta}
            >
              <Zap size={16} color={colors.white} strokeWidth={2.5} />
              <Text style={ms.upgradeText}>Browse Plans</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(subscription)/purchaseHistory")}
              activeOpacity={0.82}
              style={ms.historyCta}
            >
              <Text style={ms.historyText}>View History</Text>
              <ArrowRight size={14} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
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
  emptyIcon:    { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  // Auth gate
  lockIcon:     { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  gateTitle:    { fontSize: 20, fontWeight: "900", color: colors.text },
  gateSub:      { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },
  gateCta:      { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  gateCtaText:  { color: colors.white, fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  // Hero
  hero:         { backgroundColor: colors.secondaryDark, borderRadius: 20, padding: 22, marginBottom: 14, overflow: "hidden" },
  heroGlob:     { position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(249,115,22,0.25)" },
  heroTop:      { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  heroLabel:    { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  heroName:     { fontSize: 22, fontWeight: "900", color: "#F9FAFB", letterSpacing: -0.5 },
  statusBadge:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusDot:    { width: 7, height: 7, borderRadius: 3.5 },
  statusText:   { fontSize: 11, fontWeight: "900" },
  datesRow:     { flexDirection: "row", alignItems: "center" },
  dateItem:     { flex: 1, alignItems: "center", gap: 4 },
  dateDivider:  { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 16 },
  dateLabel:    { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 },
  dateVal:      { fontSize: 14, fontWeight: "900", color: "#F9FAFB" },
  // Cards
  card:         { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  sectionRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "900", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.8 },
  // Actions
  actions:      { gap: 10, marginBottom: 10 },
  upgradeCta:   { height: 52, borderRadius: 14, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  upgradeText:  { fontSize: 14, fontWeight: "900", color: colors.white },
  historyCta:   { height: 52, borderRadius: 14, backgroundColor: colors.secondaryLight, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.border },
  historyText:  { fontSize: 14, fontWeight: "800", color: colors.primary },
});
