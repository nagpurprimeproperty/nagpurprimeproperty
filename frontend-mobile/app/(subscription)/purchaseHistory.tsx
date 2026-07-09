import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshCw, XCircle, Clock, Receipt } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ScreenHeader from "@/shared/components/ScreenHeader";
import ScreenWrapper from "@/shared/components/ScreenWrapper";
import { usePurchaseHistory } from "@/hooks/useSubscriptionHooks";
import { useAuthStore } from "@/features/auth";
import { useModal } from "@/context/ModalContext";
import colors from "@/theme/colors";
import type { HistoryItem } from "@/services/subscriptionService";
import { usePagination } from "@/shared/hooks/usePagination";
import LoadMoreButton from "@/shared/components/LoadMoreButton";
import PurchaseHistorySkeleton from "@/components/skeleton/PurchaseHistorySkeleton";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function statusStyle(s: string) {
  if (s === "Active")    return { bg: colors.successLight,   text: colors.successDark, dot: colors.success };
  if (s === "Cancelled") return { bg: colors.borderLight,    text: colors.textSecondary, dot: colors.textLight };
  if (s === "Expired")   return { bg: "#FEF2F2",             text: colors.error,       dot: colors.error };
  return                        { bg: colors.secondaryLight, text: colors.textMuted,   dot: colors.inactive };
}



// ─── History Card ─────────────────────────────────────────────────────────────

const HistoryCard = React.memo(({ item, index }: { item: HistoryItem; index: number }) => {
  const router = useRouter();
  const sc     = statusStyle(item.status);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(220)} style={hc.card}>
      {/* Header */}
      <View style={hc.header}>
        <View style={hc.left}>
          <Text style={hc.planName}>{item.planName}</Text>
          <Text style={hc.meta}>
            {item.isFree ? "Free" : `₹${item.price}`}  ·  {item.duration} {item.durationUnit}
          </Text>
        </View>
        <View style={[hc.badge, { backgroundColor: sc.bg }]}>
          <View style={[hc.dot, { backgroundColor: sc.dot }]} />
          <Text style={[hc.badgeText, { color: sc.text }]}>{item.status}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={hc.divider} />

      {/* Footer */}
      <View style={hc.footer}>
        <View style={hc.dateRow}>
          <Clock size={12} color={colors.textLight} strokeWidth={2} />
          <Text style={hc.date}>{fmtDate(item.startDate)} → {fmtDate(item.endDate)}</Text>
        </View>
        {item.paymentDetails?.method && (
          <Text style={hc.method}>{item.paymentDetails.method}</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => router.push({ pathname: "/(subscription)/purchaseDetail", params: { id: item._id } })}
        activeOpacity={0.8}
        style={hc.receiptBtn}
      >
        <Receipt size={13} color={colors.primary} strokeWidth={2.5} />
        <Text style={hc.receiptText}>View Receipt</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const hc = StyleSheet.create({
  card:       { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  header:     { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  left:       { flex: 1, marginRight: 10 },
  planName:   { fontSize: 16, fontWeight: "900", color: colors.text, letterSpacing: -0.3 },
  meta:       { fontSize: 12, fontWeight: "600", color: colors.textMuted, marginTop: 3 },
  badge:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  badgeText:  { fontSize: 11, fontWeight: "800" },
  divider:    { height: 1, backgroundColor: colors.borderLight, marginBottom: 12 },
  footer:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  dateRow:    { flexDirection: "row", alignItems: "center", gap: 6 },
  date:       { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  method:     { fontSize: 11, fontWeight: "700", color: colors.textLight, textTransform: "capitalize" },
  receiptBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primaryMuted },
  receiptText:{ fontSize: 12, fontWeight: "800", color: colors.primary },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function PurchaseHistoryScreen() {
  const router          = useRouter();
  const insets          = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { openAuth }        = useModal();

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = usePurchaseHistory(page, 10, isAuthenticated);
  
  const history = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const {
    list: historyList,
    hasMore,
    isLoadingMore,
    initialLoading,
    refreshing,
    loadMore,
    handleRefresh,
  } = usePagination({
    data: history,
    totalPages,
    isLoading,
    isFetching,
    refetch,
    page,
    setPage,
  });

  if (!isAuthenticated) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Purchase History" subtitle="Your billing records" />
        <View style={ms.center}>
          <View style={ms.lockIcon}>
            <Ionicons name="lock-closed" size={36} color={colors.primary} />
          </View>
          <Text style={ms.gateTitle}>Login Required</Text>
          <Text style={ms.gateSub}>Sign in to view your purchase history.</Text>
          <TouchableOpacity onPress={() => openAuth("subscription")} activeOpacity={0.85} style={ms.gateCta}>
            <Text style={ms.gateCtaText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const renderItem = React.useCallback(
    ({ item, index }: { item: HistoryItem; index: number }) => (
      <HistoryCard item={item} index={index} />
    ),
    []
  );

  const keyExtractor = React.useCallback((item: HistoryItem) => item._id, []);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Purchase History" subtitle="Your billing records" />

      {initialLoading ? (
        <PurchaseHistorySkeleton count={3} />
      ) : isError ? (
        <View style={ms.center}>
          <XCircle size={40} color={colors.error} />
          <Text style={ms.errTitle}>Failed to load history</Text>
          <Text style={ms.errSub}>{error?.message}</Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <RefreshCw size={14} color={colors.white} />
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={historyList}
          keyExtractor={keyExtractor}
          contentContainerStyle={[ms.list, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            historyList.length > 0 ? (
              <View style={ms.countBanner}>
                <Receipt size={14} color={colors.primary} strokeWidth={2.5} />
                <Text style={ms.countText}>
                  {data?.total ?? historyList.length} purchase{(data?.total ?? 1) !== 1 ? "s" : ""}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={ms.empty}>
              <View style={ms.emptyIcon}>
                <Receipt size={32} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={ms.emptyTitle}>No purchases yet</Text>
              <Text style={ms.emptySub}>Your subscription purchases will appear here.</Text>
              <TouchableOpacity onPress={() => router.push("/(subscription)/subscription")} activeOpacity={0.8} style={ms.retryBtn}>
                <Text style={ms.retryText}>Browse Plans</Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={renderItem}
          ListFooterComponent={() => (
            <View>
              {isLoadingMore && <PurchaseHistorySkeleton count={1} />}
              <LoadMoreButton
                onPress={loadMore}
                loading={isLoadingMore}
                hasMore={hasMore}
              />
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const ms = StyleSheet.create({
  center:     { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  list:       { paddingHorizontal: 12, paddingTop: 12 },
  errTitle:   { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: 16 },
  errSub:     { color: colors.textMuted, textAlign: "center", marginTop: 8 },
  retryBtn:   { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  retryText:  { color: colors.white, fontWeight: "900", fontSize: 12, letterSpacing: 0.8 },
  lockIcon:   { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  gateTitle:  { fontSize: 20, fontWeight: "900", color: colors.text },
  gateSub:    { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },
  gateCta:    { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  gateCtaText:{ color: colors.white, fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  countBanner:{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primaryLight, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: colors.primaryMuted },
  countText:  { fontSize: 13, fontWeight: "800", color: colors.primaryDark },
  empty:      { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyIcon:  { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  emptySub:   { color: colors.textMuted, textAlign: "center", paddingHorizontal: 32, marginTop: 8, lineHeight: 20 },
});
