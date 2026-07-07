import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RefreshCw,
  XCircle,
  Calendar,
  CreditCard,
  Home,
  Users,
  Star,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams } from "expo-router";

import ScreenHeader from "@/components/common/ScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { usePurchaseDetail } from "@/hooks/useSubscriptionHooks";
import colors from "@/theme/colors";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function statusStyle(s: string) {
  if (s === "Active")    return { bg: colors.successLight,   text: colors.successDark, dot: colors.success };
  if (s === "Cancelled") return { bg: colors.borderLight,    text: colors.textSecondary, dot: colors.textLight };
  if (s === "Expired")   return { bg: "#FEF2F2",             text: colors.error,       dot: colors.error };
  return                        { bg: colors.secondaryLight, text: colors.textMuted,   dot: colors.inactive };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <View style={sk.wrap}>
      <View style={sk.hero} />
      {[1, 2, 3].map((i) => (
        <View key={i} style={sk.card}>
          <View style={sk.label} />
          <View style={sk.row}>
            <View style={sk.chip} />
            <View style={sk.chip} />
          </View>
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  wrap:  { padding: 12, paddingTop: 10 },
  hero:  { height: 140, backgroundColor: colors.borderLight, borderRadius: 20, marginBottom: 14 },
  card:  { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  label: { width: "50%", height: 11, backgroundColor: colors.borderLight, borderRadius: 6, marginBottom: 14 },
  row:   { flexDirection: "row", gap: 10 },
  chip:  { flex: 1, height: 56, backgroundColor: colors.secondaryLight, borderRadius: 12 },
});

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }: {
  label: string; value?: string; mono?: boolean;
}) {
  return (
    <View style={ir.wrap}>
      <Text style={ir.label}>{label}</Text>
      <Text style={[ir.value, mono && ir.mono]} selectable>{value || "—"}</Text>
    </View>
  );
}

const ir = StyleSheet.create({
  wrap:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.secondaryLight },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  value: { fontSize: 13, fontWeight: "800", color: colors.text, maxWidth: "55%", textAlign: "right" },
  mono:  { fontSize: 11, color: colors.textSecondary },
});

// ─── Usage Stat ────────────────────────────────────────────────────────────────

function UsageStat({ icon: Icon, label, used }: {
  icon: any; label: string; used: number;
}) {
  return (
    <View style={us.wrap}>
      <View style={us.iconWrap}>
        <Icon size={16} color={colors.primary} strokeWidth={2.5} />
      </View>
      <Text style={us.used}>{used}</Text>
      <Text style={us.label}>{label}</Text>
    </View>
  );
}

const us = StyleSheet.create({
  wrap:    { flex: 1, backgroundColor: colors.primaryLight, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.primaryMuted },
  iconWrap:{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  used:    { fontSize: 20, fontWeight: "900", color: colors.primary },
  label:   { fontSize: 10, fontWeight: "700", color: colors.textSecondary, textAlign: "center", marginTop: 3 },
});

// ─── Timeline Item ─────────────────────────────────────────────────────────────

function TimelineItem({ icon: Icon, label, value, last = false }: {
  icon: any; label: string; value?: string; last?: boolean;
}) {
  return (
    <View style={tl.row}>
      <View style={tl.left}>
        <View style={tl.iconWrap}>
          <Icon size={14} color={colors.primary} strokeWidth={2.5} />
        </View>
        {!last && <View style={tl.line} />}
      </View>
      <View style={tl.content}>
        <Text style={tl.label}>{label}</Text>
        <Text style={tl.value}>{value || "—"}</Text>
      </View>
    </View>
  );
}

const tl = StyleSheet.create({
  row:     { flexDirection: "row", gap: 14, marginBottom: 4 },
  left:    { alignItems: "center" },
  iconWrap:{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.primaryMuted },
  line:    { width: 1.5, flex: 1, backgroundColor: colors.primaryMuted, marginTop: 4, marginBottom: 4 },
  content: { flex: 1, paddingBottom: 18 },
  label:   { fontSize: 10, fontWeight: "700", color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  value:   { fontSize: 13, fontWeight: "800", color: colors.text },
});

// ─── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <View style={sl.row}>
      <Icon size={14} color={colors.primary} strokeWidth={2.5} />
      <Text style={sl.text}>{text}</Text>
    </View>
  );
}

const sl = StyleSheet.create({
  row:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  text: { fontSize: 11, fontWeight: "900", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.8 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function PurchaseDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const insets   = useSafeAreaInsets();

  const { data, isLoading, isError, error, refetch } = usePurchaseDetail(id);
  const purchase = data?.data;
  const sc       = purchase ? statusStyle(purchase.status) : statusStyle("");

  return (
    <ScreenWrapper>
      <ScreenHeader title="Purchase Receipt" subtitle="Billing details" />

      {isLoading ? (
        <DetailSkeleton />
      ) : isError ? (
        <View style={ms.center}>
          <XCircle size={40} color={colors.error} />
          <Text style={ms.errTitle}>Failed to load</Text>
          <Text style={ms.errSub}>{error?.message}</Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <RefreshCw size={14} color={colors.white} />
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : purchase ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[ms.scroll, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(420)} style={ms.hero}>
            <View style={ms.heroGlob} />
            <View style={ms.heroTop}>
              <View>
                <Text style={ms.heroLabel}>Subscription Receipt</Text>
                <Text style={ms.heroName}>{purchase.planName}</Text>
              </View>
              <View style={[ms.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[ms.statusDot, { backgroundColor: sc.dot }]} />
                <Text style={[ms.statusText, { color: sc.text }]}>{purchase.status}</Text>
              </View>
            </View>
            <Text style={ms.heroPrice}>
              {purchase.isFree ? "Free" : `₹${purchase.price}`}
            </Text>
          </Animated.View>

          {/* Timeline */}
          <Animated.View entering={FadeInDown.delay(80).duration(420)} style={ms.card}>
            <SectionLabel icon={Clock} text="Timeline" />
            <TimelineItem icon={CheckCircle2} label="Purchased On" value={fmtDate(purchase.createdAt)} />
            <TimelineItem icon={Calendar}     label="Plan Started" value={fmtDate(purchase.startDate)} />
            <TimelineItem icon={Calendar}     label="Plan Expires" value={fmtDate(purchase.endDate)}   last />
          </Animated.View>

          {/* Payment */}
          {purchase.paymentDetails && (
            <Animated.View entering={FadeInDown.delay(160).duration(420)} style={ms.card}>
              <SectionLabel icon={CreditCard} text="Payment Details" />
              <InfoRow label="Amount Paid" value={`₹${purchase.paymentDetails.amountPaid}`} />
              <InfoRow label="Method"      value={purchase.paymentDetails.method} />
              <InfoRow label="Payment ID"  value={purchase.paymentDetails.paymentId} mono />
              <InfoRow label="Link ID"     value={purchase.paymentDetails.paymentLinkId} mono />

              {purchase.paymentDetails.paymentLinkUrl && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(purchase.paymentDetails!.paymentLinkUrl!)}
                  activeOpacity={0.8}
                  style={ms.linkBtn}
                >
                  <ExternalLink size={13} color={colors.primary} strokeWidth={2.5} />
                  <Text style={ms.linkText}>Open Payment Link</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {/* Usage */}
          <Animated.View entering={FadeInDown.delay(240).duration(420)} style={ms.card}>
            <SectionLabel icon={Home} text="Usage on This Plan" />
            <View style={ms.usageGrid}>
              <UsageStat icon={Home}  label="Properties Posted" used={purchase.usage.propertiesPosted} />
              <UsageStat icon={Users} label="Leads Unlocked"    used={purchase.usage.leadsUnlocked} />
              <UsageStat icon={Star}  label="Featured Used"     used={purchase.usage.featuredPropertiesUsed} />
            </View>
          </Animated.View>
        </ScrollView>
      ) : null}
    </ScreenWrapper>
  );
}

const ms = StyleSheet.create({
  center:      { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  scroll:      { paddingHorizontal: 12, paddingTop: 12 },
  errTitle:    { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: 16 },
  errSub:      { color: colors.textMuted, textAlign: "center", marginTop: 8 },
  retryBtn:    { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  retryText:   { color: colors.white, fontWeight: "900", fontSize: 12, letterSpacing: 0.8 },
  // Hero
  hero:        { backgroundColor: colors.secondaryDark, borderRadius: 20, padding: 22, marginBottom: 14, overflow: "hidden" },
  heroGlob:    { position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(249,115,22,0.25)" },
  heroTop:     { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  heroLabel:   { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  heroName:    { fontSize: 18, fontWeight: "900", color: "#F9FAFB", letterSpacing: -0.4 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 11, fontWeight: "900" },
  heroPrice:   { fontSize: 32, fontWeight: "900", color: colors.warning, letterSpacing: -1 },
  // Cards
  card:        { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  linkBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primaryMuted },
  linkText:    { fontSize: 12, fontWeight: "800", color: colors.primary },
  usageGrid:   { flexDirection: "row", gap: 10 },
});
