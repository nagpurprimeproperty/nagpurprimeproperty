import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Phone,
  MessageCircle,
  ChevronRight,
  Zap,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'react-hot-toast/headless';

import ScreenHeader from '@/components/common/ScreenHeader';
import ScreenWrapper from '@/components/common/ScreenWrapper';
import colors from '@/theme/colors';
import { useLeads, useUpdateLeadStatusMutation } from '@/hooks/useLeadHook';
import { useAuthStore } from '@/store/authStore';
import type { LeadItem } from '@/services/leadService';
import { usePagination } from '@/hooks/usePagination';
import LoadMoreButton from '@/components/common/LoadMoreButton';
import LeadSkeleton from '@/components/skeleton/LeadSkeleton';

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  New:       { bg: '#FFF7ED', text: '#EA580C', dot: '#F97316' },
  Contacted: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  Closed:    { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
};

function getStatusCfg(status?: string) {
  return STATUS_CONFIG[status ?? 'New'] ?? STATUS_CONFIG.New;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────



// ─── Inline status row ─────────────────────────────────────────────────────────

type StatusOption = { label: string; status: string; bg: string; fg: string };

const StatusRow = React.memo(function StatusRow({ item }: { item: LeadItem }) {
  const mutation = useUpdateLeadStatusMutation(item._id);
  const isNew = item.isNew || item.status === 'New' || !item.status;

  const options: StatusOption[] = [
    { label: 'Mark Contacted', status: 'Contacted', bg: '#EFF6FF', fg: '#1D4ED8' },
    { label: 'Close Lead',     status: 'Closed',    bg: '#F1F5F9', fg: '#475569' },
  ];

  const onPress = (status: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    mutation.mutate(
      { status },
      {
        onSuccess: () => toast.success(`Lead marked as ${status}`),
        onError:   (e: any) => toast.error(e?.message || 'Update failed'),
      },
    );
  };

  return (
    <View style={sr.row}>
      {options.map((opt) => {
        const isCurrent = item.status === opt.status;
        return (
          <TouchableOpacity
            key={opt.status}
            onPress={() => onPress(opt.status)}
            disabled={mutation.isPending || isCurrent}
            activeOpacity={1}
            style={[
              sr.btn,
              {
                backgroundColor: isCurrent ? opt.bg : '#F8FAFC',
                borderColor:     isCurrent ? opt.fg + '40' : '#E2E8F0',
                opacity: mutation.isPending ? 0.65 : 1,
              },
            ]}
          >
            {mutation.isPending && !isCurrent ? (
              <ActivityIndicator size="small" color={opt.fg} style={sr.icon} />
            ) : isCurrent ? (
              <CheckCircle2 size={13} color={opt.fg} strokeWidth={2.5} style={sr.icon} />
            ) : null}
            <Text style={[sr.label, { color: isCurrent ? opt.fg : '#64748B' }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const sr = StyleSheet.create({
  row:   { flexDirection: 'row', gap: 8, marginTop: 14 },
  btn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  icon:  { marginRight: 5 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
});

// ─── Lead Card ─────────────────────────────────────────────────────────────────

const LeadCard = React.memo(function LeadCard({ item, index }: { item: LeadItem; index: number }) {
  const router = useRouter();
  const cfg    = getStatusCfg(item.status);
  const isNew  = item.isNew || item.status === 'New' || !item.status;

  const onCall = () => {
    if (!item.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${item.phone}`);
  };

  const onWhatsApp = () => {
    if (!item.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg = 'Hello, I am responding to your enquiry on Nagpur Prime Property.';
    Linking.openURL(`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  const onDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/(myListing)/leads/[id]', params: { id: item._id } });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(220)}
      style={[lc.card, { borderColor: isNew ? '#FED7AA' : '#E2E8F0' }]}
    >
      {/* ── Header ── */}
      <View style={lc.header}>
        <View style={lc.headerLeft}>
          <View style={lc.nameRow}>
            <Text style={lc.name} numberOfLines={1}>
              {item.customerName || item.name || 'Unknown'}
            </Text>
            {isNew && (
              <View style={lc.newBadge}>
                <Text style={lc.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={lc.propName} numberOfLines={1}>{item.propertyName || '—'}</Text>
          <Text style={lc.meta}>{item.propertyType}  ·  {item.createdAt}</Text>
        </View>

        {/* Status pill — dynamic bg/text from API status */}
        <View style={[lc.pill, { backgroundColor: cfg.bg }]}>
          <View style={[lc.dot, { backgroundColor: cfg.dot }]} />
          <Text style={[lc.pillText, { color: cfg.text }]}>{item.status || 'New'}</Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={lc.divider} />

      {/* ── Actions ── */}
      <View style={lc.actions}>
        <TouchableOpacity onPress={onDetails} activeOpacity={0.75} style={lc.detailsBtn}>
          <Text style={lc.detailsBtnText}>View Details</Text>
          <ChevronRight size={13} color="#94A3B8" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCall}
          disabled={!item.phone}
          activeOpacity={0.75}
          style={[lc.iconBtn, { backgroundColor: item.phone ? '#F0FDF4' : '#F8FAFC', borderColor: item.phone ? '#BBF7D0' : '#E2E8F0' }]}
        >
          <Phone size={18} color={item.phone ? '#16A34A' : '#CBD5E1'} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onWhatsApp}
          disabled={!item.phone}
          activeOpacity={0.75}
          style={[lc.iconBtn, { backgroundColor: item.phone ? '#F0FFF4' : '#F8FAFC', borderColor: item.phone ? '#86EFAC' : '#E2E8F0' }]}
        >
          <MessageCircle size={18} color={item.phone ? '#25D366' : '#CBD5E1'} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── Update Status ── */}
      <StatusRow item={item} />
    </Animated.View>
  );
});

const lc = StyleSheet.create({
  card:          { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1 },
  header:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft:    { flex: 1, marginRight: 10 },
  nameRow:       { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  name:          { fontSize: 16, fontWeight: '900', color: '#0F172A', letterSpacing: -0.3 },
  newBadge:      { backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: '#FED7AA' },
  newBadgeText:  { color: '#EA580C', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  propName:      { color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 3 },
  meta:          { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginTop: 2 },
  pill:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  dot:           { width: 6, height: 6, borderRadius: 3 },
  pillText:      { fontSize: 11, fontWeight: '800' },
  divider:       { height: 1, backgroundColor: '#F1F5F9', marginTop: 14, marginBottom: 14 },
  actions:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailsBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  detailsBtnText:{ fontSize: 12, fontWeight: '800', color: '#475569', letterSpacing: 0.3 },
  iconBtn:       { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function LeadsScreen() {
  const insets          = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuth        = useAuthStore((s) => s.openAuth);
  
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = useLeads(page, 10);

  const leads = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const {
    list: leadsList,
    hasMore,
    isLoadingMore,
    initialLoading,
    refreshing,
    loadMore,
    handleRefresh,
  } = usePagination({
    data: leads,
    totalPages,
    isLoading,
    isFetching,
    refetch,
    page,
    setPage,
  });

  const total = data?.data?.total ?? leadsList.length;

  const renderItem = React.useCallback(
    ({ item, index }: { item: LeadItem; index: number }) => (
      <LeadCard item={item} index={index} />
    ),
    []
  );

  const keyExtractor = React.useCallback((item: LeadItem) => item._id, []);

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <ScreenWrapper>
        <ScreenHeader
          title="Leads"
          subtitle="Manage your enquiries"
          rightIcon={<Zap size={18} color={colors.primary} strokeWidth={2.5} />}
        />
        <View style={ms.center}>
          <View style={ms.lockIcon}>
            <Ionicons name="lock-closed" size={36} color={colors.primary} />
          </View>
          <Text style={ms.gateTitle}>Login Required</Text>
          <Text style={ms.gateSubtitle}>
            Please verify your phone number to manage your leads.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openAuth('leads')}
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
        title="Leads"
        subtitle={isLoading ? 'Loading…' : `${total} total enquir${total === 1 ? 'y' : 'ies'}`}
        rightIcon={<Zap size={18} color={colors.primary} strokeWidth={2.5} />}
      />

      {initialLoading ? (
        <LeadSkeleton count={4} />
      ) : isError ? (
        <View style={ms.center}>
          <XCircle size={40} color="#EF4444" />
          <Text style={ms.errTitle}>Failed to load</Text>
          <Text style={ms.errSub}>{error?.message || 'Something went wrong.'}</Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={leadsList}
          keyExtractor={keyExtractor}
          contentContainerStyle={[ms.listContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            leadsList.length > 0 ? (
              <View style={ms.banner}>
                <Users size={15} color={colors.primary} strokeWidth={2.5} />
                <Text style={ms.bannerText}>
                  {total} Lead{total !== 1 ? 's' : ''}  ·  Tap a card to view details
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={ms.empty}>
              <View style={ms.emptyIcon}>
                <Users size={32} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={ms.emptyTitle}>No leads yet</Text>
              <Text style={ms.emptySub}>
                Leads will appear here once your listings receive enquiries.
              </Text>
            </View>
          )}
          renderItem={renderItem}
          ListFooterComponent={() => (
            <View>
              {isLoadingMore && <LeadSkeleton count={1} />}
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

// ─── Screen-level styles ───────────────────────────────────────────────────────

const ms = StyleSheet.create({
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  listContent:  { paddingHorizontal: 10, paddingTop: 12 },
  // Auth gate
  lockIcon:     { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  gateTitle:    { fontSize: 20, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  gateSubtitle: { color: '#64748B', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  gateCta:      { marginTop: 28, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, minWidth: 200, alignItems: 'center', justifyContent: 'center' },
  gateCtaText:  { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1, textAlign: 'center' },
  // Error
  errTitle:     { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 16 },
  errSub:       { color: '#64748B', textAlign: 'center', marginTop: 8 },
  retryBtn:     { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  retryText:    { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },
  // Banner
  banner:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderWidth: 1, borderColor: '#FED7AA', gap: 8 },
  bannerText:   { fontSize: 13, fontWeight: '800', color: '#EA580C' },
  // Empty
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:    { width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle:   { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  emptySub:     { color: '#64748B', textAlign: 'center', paddingHorizontal: 32, marginTop: 8, lineHeight: 20 },
});
