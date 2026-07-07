import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Clock,
  Inbox,
  MessageCircle,
  ChevronRight,
  User,
  RefreshCw,
  XCircle,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import ScreenHeader from '@/components/common/ScreenHeader';
import ScreenWrapper from '@/components/common/ScreenWrapper';
import { useEnquiries } from '@/hooks/useEnquiryHook';
import { useAuthStore } from '@/store/authStore';
import colors from '@/theme/colors';
import { usePagination } from '@/hooks/usePagination';
import LoadMoreButton from '@/components/common/LoadMoreButton';
import type { EnquiryItem } from '@/services/enquiryService';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=400';

function statusCfg(status: string) {
  if (status === 'Responded')
    return { bg: '#D1FAE5', text: '#059669', dot: '#10B981' };
  return { bg: '#FFF7ED', text: '#EA580C', dot: '#F97316' };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EnquirySkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <View style={sk.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sk.card}>
          <View style={sk.topRow}>
            <View style={sk.thumb} />
            <View style={sk.infoBlock}>
              <View style={sk.lineLg} />
              <View style={sk.lineMd} />
              <View style={sk.lineSm} />
            </View>
          </View>
          <View style={sk.divider} />
          <View style={sk.bottomRow}>
            <View style={sk.lineFooter} />
            <View style={sk.pill} />
          </View>
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  container:  { paddingHorizontal: 10, paddingTop: 10 },
  card:       { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  topRow:     { flexDirection: 'row', gap: 12 },
  thumb:      { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F1F5F9' },
  infoBlock:  { flex: 1, justifyContent: 'center', gap: 8 },
  lineLg:     { width: '80%', height: 14, backgroundColor: '#F1F5F9', borderRadius: 6 },
  lineMd:     { width: '55%', height: 13, backgroundColor: '#FFF7ED', borderRadius: 6 },
  lineSm:     { width: '65%', height: 11, backgroundColor: '#F8FAFC', borderRadius: 6 },
  divider:    { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  bottomRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineFooter: { width: '40%', height: 11, backgroundColor: '#F8FAFC', borderRadius: 6 },
  pill:       { width: 60, height: 22, backgroundColor: '#FFF7ED', borderRadius: 20 },
});

// ─── Enquiry Card ─────────────────────────────────────────────────────────────

const EnquiryCard = React.memo(function EnquiryCard({ item, index }: {
  item: EnquiryItem; index: number;
}) {
  const router = useRouter();
  const sc    = statusCfg(item.status);
  const image = item.photos?.[0] || FALLBACK_IMAGE;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(220)}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: '/enquiries/[id]', params: { id: item._id } });
        }}
        style={ec.card}
      >
        {/* Image + info */}
        <View style={ec.topRow}>
          <Image
            source={{ uri: image }}
            style={ec.thumb}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
          <View style={ec.infoBlock}>
            {/* Name + status */}
            <View style={ec.nameRow}>
              <Text style={ec.propName} numberOfLines={1}>
                {item.propertyName}
              </Text>
              <View style={[ec.badge, { backgroundColor: sc.bg }]}>
                <View style={[ec.dot, { backgroundColor: sc.dot }]} />
                <Text style={[ec.badgeText, { color: sc.text }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Price */}
            <Text style={ec.price} numberOfLines={1}>{item.totalPrice}</Text>

            {/* Broker */}
            <View style={ec.brokerRow}>
              <View style={ec.brokerIcon}>
                <User size={10} color={colors.textSecondary} strokeWidth={2.5} />
              </View>
              <Text style={ec.brokerText} numberOfLines={1}>
                {item.brokerName}
                {item.listingCategory
                  ? <Text style={ec.brokerSub}>  ·  {item.listingCategory}</Text>
                  : null}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={ec.divider} />

        {/* Footer */}
        <View style={ec.footer}>
          <View style={ec.timeRow}>
            <Clock size={11} color={colors.textLight} strokeWidth={2} />
            <Text style={ec.timeText}>Enquired {item.enquired}</Text>
          </View>
          <View style={ec.detailsBtn}>
            <Text style={ec.detailsText}>Details</Text>
            <ChevronRight size={12} color={colors.primary} strokeWidth={3} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const ec = StyleSheet.create({
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  topRow:      { flexDirection: 'row', gap: 12 },
  thumb:       { width: 80, height: 80, borderRadius: 12 },
  infoBlock:   { flex: 1, justifyContent: 'center' },
  nameRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 3 },
  propName:    { flex: 1, fontSize: 14, fontWeight: '900', color: '#0F172A', letterSpacing: -0.3 },
  badge:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 20, gap: 4 },
  dot:         { width: 5, height: 5, borderRadius: 2.5 },
  badgeText:   { fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  price:       { fontSize: 15, fontWeight: '900', color: colors.primary, letterSpacing: -0.3, marginBottom: 5 },
  brokerRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brokerIcon:  { width: 18, height: 18, borderRadius: 9, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  brokerText:  { fontSize: 12, fontWeight: '700', color: '#6B7280', flex: 1 },
  brokerSub:   { fontWeight: '500', color: '#94A3B8' },
  divider:     { height: 1, backgroundColor: '#F1F5F9', marginTop: 12, marginBottom: 12 },
  footer:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText:    { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 },
  detailsBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  detailsText: { fontSize: 11, fontWeight: '900', color: colors.primary },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function EnquiriesScreen() {
  const router          = useRouter();
  const insets          = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuth        = useAuthStore((s) => s.openAuth);

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = useEnquiries(page, 10);
  
  const enquiries = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const {
    list: enquiriesList,
    hasMore,
    isLoadingMore,
    initialLoading,
    refreshing,
    loadMore,
    handleRefresh,
  } = usePagination({
    data: enquiries,
    totalPages,
    isLoading,
    isFetching,
    refetch,
    page,
    setPage,
  });

  const total = data?.total ?? enquiriesList.length;

  const renderItem = React.useCallback(
    ({ item, index }: { item: EnquiryItem; index: number }) => (
      <EnquiryCard item={item} index={index} />
    ),
    []
  );

  const keyExtractor = React.useCallback((item: EnquiryItem) => item._id, []);

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <ScreenWrapper>
        <ScreenHeader
          title="My Enquiries"
          subtitle="Your property requests"
          rightIcon={<MessageCircle size={18} color={colors.primary} strokeWidth={2.5} />}
        />
        <View style={ms.center}>
          <View style={ms.lockIcon}>
            <Ionicons name="lock-closed" size={36} color={colors.primary} />
          </View>
          <Text style={ms.gateTitle}>Login Required</Text>
          <Text style={ms.gateSub}>
            Please verify your phone number to view your enquiries.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openAuth('enquiries')}
            style={ms.gateCta}
          >
            <Text style={ms.gateCtaText} numberOfLines={1}>VERIFY NUMBER</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="My Enquiries"
        subtitle={isLoading ? 'Loading…' : `${total} enquir${total === 1 ? 'y' : 'ies'}`}
        rightIcon={<MessageCircle size={18} color={colors.primary} strokeWidth={2.5} />}
      />

      {initialLoading ? (
        <EnquirySkeleton count={3} />
      ) : isError ? (
        <View style={ms.center}>
          <XCircle size={40} color="#EF4444" />
          <Text style={ms.errTitle}>Unable to load enquiries</Text>
          <Text style={ms.errSub}>
            {error?.message || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <RefreshCw size={14} color="#fff" />
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={enquiriesList}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[ms.listContent, { paddingBottom: insets.bottom + 40 }]}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            enquiriesList.length > 0 ? (
              <View style={ms.banner}>
                <MessageCircle size={14} color={colors.primary} strokeWidth={2.5} />
                <Text style={ms.bannerText}>
                  {total} Enquir{total !== 1 ? 'ies' : 'y'}  ·  Tap a card to view details
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={ms.empty}>
              <View style={ms.emptyIcon}>
                <Inbox size={32} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={ms.emptyTitle}>Quiet inbox</Text>
              <Text style={ms.emptySub}>
                No enquiries yet. Browse properties and send your first message to a broker.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/search')}
                activeOpacity={0.85}
                style={ms.browseCta}
              >
                <Text style={ms.gateCtaText}>BROWSE PROPERTIES</Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={renderItem}
          ListFooterComponent={() => (
            <View>
              {isLoadingMore && <EnquirySkeleton count={1} />}
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
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  listContent: { paddingHorizontal: 10, paddingTop: 12 },
  // Auth gate
  lockIcon:    { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  gateTitle:   { fontSize: 20, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  gateSub:     { color: '#64748B', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  gateCta:     { marginTop: 28, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, minWidth: 200, alignItems: 'center', justifyContent: 'center' },
  gateCtaText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1, textAlign: 'center' },
  // Error
  errTitle:    { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 16 },
  errSub:      { color: '#64748B', textAlign: 'center', marginTop: 8 },
  retryBtn:    { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  retryText:   { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },
  // Banner
  banner:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderWidth: 1, borderColor: '#FED7AA', gap: 8 },
  bannerText:  { fontSize: 13, fontWeight: '800', color: '#EA580C' },
  // Empty
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:   { width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle:  { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  emptySub:    { color: '#64748B', textAlign: 'center', paddingHorizontal: 32, marginTop: 8, lineHeight: 20 },
  browseCta:   { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
});
