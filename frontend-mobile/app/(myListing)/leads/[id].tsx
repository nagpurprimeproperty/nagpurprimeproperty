import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Phone,
  MessageCircle,
  User,
  Building2,
  Tag,
  IndianRupee,
  FileText,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Zap,
  RefreshCw,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { toast } from 'react-hot-toast/headless';

import ScreenHeader from '@/components/common/ScreenHeader';
import ScreenWrapper from '@/components/common/ScreenWrapper';
import colors from '@/theme/colors';
import { useLead, useUpdateLeadStatusMutation } from '@/hooks/useLeadHook';

// ─── Status config ─────────────────────────────────────────────────────────────

type StatusKey = 'New' | 'Contacted' | 'Closed';

const STATUS_CONFIG: Record<StatusKey, { bg: string; text: string; dot: string }> = {
  New:       { bg: '#FFF7ED', text: '#EA580C', dot: '#F97316' },
  Contacted: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  Closed:    { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
};

function getStatusCfg(status?: string) {
  return STATUS_CONFIG[(status as StatusKey) ?? 'New'] ?? STATUS_CONFIG.New;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <View style={sk.wrap}>
      {/* Hero */}
      <View style={sk.hero}>
        <View style={sk.avatar} />
        <View style={sk.nameLine} />
        <View style={sk.subLine} />
        <View style={sk.phoneLine} />
      </View>
      {/* Info */}
      {[1, 2].map((i) => (
        <View key={i} style={sk.infoCard}>
          <View style={sk.labelLine} />
          <View style={sk.valueLine} />
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
  wrap:      { paddingHorizontal: 10, paddingTop: 12 },
  hero:      { backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  avatar:    { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF7ED', marginBottom: 16 },
  nameLine:  { width: 140, height: 20, backgroundColor: '#e5e8eb', borderRadius: 8, marginBottom: 10 },
  subLine:   { width: 90,  height: 14, backgroundColor: '#F8FAFC', borderRadius: 8, marginBottom: 16 },
  phoneLine: { width: '100%', height: 46, backgroundColor: '#F8FAFC', borderRadius: 14 },
  infoCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  labelLine: { width: '45%', height: 11, backgroundColor: '#F1F5F9', borderRadius: 6, marginBottom: 10 },
  valueLine: { width: '70%', height: 18, backgroundColor: '#F1F5F9', borderRadius: 8, marginBottom: 14 },
  chipRow:   { flexDirection: 'row', gap: 10 },
  chip:      { flex: 1, height: 54, backgroundColor: '#F8FAFC', borderRadius: 12 },
});

// ─── Info Chip ─────────────────────────────────────────────────────────────────

function InfoChip({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <View style={ic.wrap}>
      <View style={ic.header}>
        <Icon size={13} color="#94A3B8" strokeWidth={2.5} />
        <Text style={ic.label}>{label}</Text>
      </View>
      <Text style={ic.value}>{value || '—'}</Text>
    </View>
  );
}

const ic = StyleSheet.create({
  wrap:   { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label:  { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },
  value:  { fontSize: 14, fontWeight: '900', color: '#0F172A', letterSpacing: -0.2 },
});

// ─── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <View style={sl.row}>
      <Icon size={14} color={colors.primary} strokeWidth={2.5} />
      <Text style={sl.text}>{text}</Text>
    </View>
  );
}

const sl = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  text: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase' },
});

// ─── Update Status Sheet ───────────────────────────────────────────────────────

function UpdateStatusSheet({
  visible,
  currentStatus,
  leadId,
  isNew,
  onClose,
}: {
  visible: boolean;
  currentStatus?: string;
  leadId: string;
  isNew?: boolean;
  onClose: () => void;
}) {
  const insets   = useSafeAreaInsets();
  const mutation = useUpdateLeadStatusMutation(leadId);

  const options: StatusKey[] = ['Contacted', 'Closed'];

  const onSelect = (status: StatusKey) => {
    if (status === currentStatus || mutation.isPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    mutation.mutate(
      { status },
      {
        onSuccess: () => { toast.success(`Status updated to ${status}`); onClose(); },
        onError:   (e: any) => toast.error(e?.message || 'Update failed'),
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={us.backdrop} onPress={onClose} />
      <View style={[us.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={us.handle} />
        <Text style={us.title}>Update Status</Text>
        <Text style={us.subtitle}>Select the new status for this lead</Text>

        {options.map((status) => {
          const cfg       = getStatusCfg(status);
          const isCurrent = status === currentStatus;
          return (
            <TouchableOpacity
              key={status}
              onPress={() => onSelect(status)}
              activeOpacity={0.75}
              disabled={mutation.isPending}
              style={[
                us.option,
                {
                  backgroundColor: isCurrent ? cfg.bg : '#F8FAFC',
                  borderColor:     isCurrent ? cfg.dot + '60' : '#E2E8F0',
                },
              ]}
            >
              <View style={[us.dot, { backgroundColor: cfg.dot }]} />
              <Text style={[us.optionLabel, { color: isCurrent ? cfg.text : '#334155' }]}>
                {status}
              </Text>
              {isCurrent ? (
                <CheckCircle2 size={18} color={cfg.dot} strokeWidth={2.5} />
              ) : mutation.isPending ? (
                <ActivityIndicator size="small" color="#94A3B8" />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
}

const us = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 14 },
  handle:      { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:       { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  subtitle:    { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 20 },
  option:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1.5 },
  dot:         { width: 10, height: 10, borderRadius: 5, marginRight: 14 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '800' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function LeadDetails() {
  const { id }   = useLocalSearchParams();
  const insets   = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(false);

  const leadId = typeof id === 'string' ? id : '';
  const { data, isLoading, isError, error, refetch } = useLead(leadId, Boolean(leadId));

  const lead      = data?.data;
  const isNew     = lead?.isNew || lead?.status === 'New' || !lead?.status;
  const statusCfg = getStatusCfg(lead?.status);

  const onCall = () => {
    if (!lead?.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${lead.phone}`);
  };

  const onWhatsApp = () => {
    if (!lead?.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg = 'Hello, I am responding to your enquiry on Nagpur Prime Property.';
    Linking.openURL(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Lead Details"
        subtitle={lead?.customerName || 'Customer Details'}
        rightIcon={<Zap size={18} color={colors.primary} strokeWidth={2.5} />}
      />

      {/* ── Loading ── */}
      {isLoading && <DetailSkeleton />}

      {/* ── Error ── */}
      {isError && !isLoading && (
        <View style={ms.center}>
          <XCircle size={40} color="#EF4444" />
          <Text style={ms.errTitle}>Failed to load</Text>
          <Text style={ms.errSub}>{error?.message || 'Could not fetch lead details.'}</Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <RefreshCw size={14} color="#fff" />
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Content ── */}
      {!isLoading && !isError && lead && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[ms.scroll, { paddingBottom: insets.bottom + 110 }]}
        >
          {/* Hero card */}
          <Animated.View entering={FadeInDown.duration(200)} style={ms.heroCard}>
            <View style={ms.avatarWrap}>
              <User size={38} color={colors.primary} strokeWidth={2} />
            </View>

            <Text style={ms.customerName}>{lead.customerName || 'Unknown'}</Text>

            {/* Status pill — dynamic colors */}
            <View style={[ms.statusPill, { backgroundColor: statusCfg.bg }]}>
              <View style={[ms.statusDot, { backgroundColor: statusCfg.dot }]} />
              <Text style={[ms.statusText, { color: statusCfg.text }]}>
                {lead.status || 'New'}
              </Text>
            </View>

            {/* Phone */}
            {lead.phone ? (
              <TouchableOpacity onPress={onCall} activeOpacity={0.8} style={ms.phoneBtn}>
                <Phone size={16} color="#16A34A" strokeWidth={2.5} />
                <Text style={ms.phoneBtnText}>{lead.phone}</Text>
              </TouchableOpacity>
            ) : (
              <View style={ms.noPhoneWrap}>
                <Text style={ms.noPhoneText}>Phone not available</Text>
              </View>
            )}
          </Animated.View>

          {/* Property card */}
          <Animated.View entering={FadeInDown.delay(40).duration(200)} style={ms.card}>
            <SectionLabel icon={Building2} text="Property Details" />
            <Text style={ms.propName}>{lead.propertyName || 'Unknown Property'}</Text>
            <View style={ms.chipRow}>
              <InfoChip icon={Tag}          label="Type"     value={lead.propertyType} />
              <InfoChip icon={Tag}          label="Category" value={lead.listingCategory} />
            </View>
            <View style={ms.chipRowSingle}>
              <InfoChip icon={IndianRupee} label="Listed Price" value={lead.totalPrice} />
            </View>
          </Animated.View>

          {/* Notes card */}
          {lead.notes ? (
            <Animated.View entering={FadeInDown.delay(80).duration(200)} style={ms.card}>
              <SectionLabel icon={FileText} text="Notes from Customer" />
              <Text style={ms.notes}>"{lead.notes}"</Text>
            </Animated.View>
          ) : null}
        </ScrollView>
      )}

      {/* ── Bottom Bar ── */}
      {!isLoading && !isError && lead && (
        <View style={[ms.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          {/* Call */}
          <TouchableOpacity
            onPress={onCall}
            disabled={!lead.phone}
            activeOpacity={0.75}
            style={[
              ms.iconActionBtn,
              { backgroundColor: lead.phone ? '#F0FDF4' : '#F8FAFC', borderColor: lead.phone ? '#BBF7D0' : '#E2E8F0' },
            ]}
          >
            <Phone size={20} color={lead.phone ? '#16A34A' : '#CBD5E1'} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity
            onPress={onWhatsApp}
            disabled={!lead.phone}
            activeOpacity={0.75}
            style={[
              ms.iconActionBtn,
              { backgroundColor: lead.phone ? '#F0FFF4' : '#F8FAFC', borderColor: lead.phone ? '#86EFAC' : '#E2E8F0' },
            ]}
          >
            <MessageCircle size={20} color={lead.phone ? '#25D366' : '#CBD5E1'} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Update Status CTA */}
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSheetVisible(true); }}
            activeOpacity={0.85}
            style={ms.statusCta}
          >
            <Text style={ms.statusCtaText}>Update Status</Text>
            <ChevronDown size={16} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Status Sheet ── */}
      <UpdateStatusSheet
        visible={sheetVisible}
        currentStatus={lead?.status}
        leadId={leadId}
        isNew={isNew}
        onClose={() => setSheetVisible(false)}
      />
    </ScreenWrapper>
  );
}

// ─── Screen styles ─────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  // Layout
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  scroll:        { paddingHorizontal: 10, paddingTop: 12 },
  // Error
  errTitle:      { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 16 },
  errSub:        { color: '#64748B', textAlign: 'center', marginTop: 8 },
  retryBtn:      { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  retryText:     { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },
  // Hero card
  heroCard:      { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  avatarWrap:    { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2, borderColor: '#FED7AA' },
  customerName:  { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5, textAlign: 'center' },
  statusPill:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10, gap: 6 },
  statusDot:     { width: 7, height: 7, borderRadius: 3.5 },
  statusText:    { fontSize: 12, fontWeight: '900', letterSpacing: 0.3 },
  phoneBtn:      { marginTop: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, borderWidth: 1, borderColor: '#BBF7D0', gap: 8, width: '100%', justifyContent: 'center' },
  phoneBtnText:  { fontSize: 15, fontWeight: '900', color: '#16A34A', letterSpacing: 0.3 },
  noPhoneWrap:   { marginTop: 16, backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', width: '100%', alignItems: 'center' },
  noPhoneText:   { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  // Generic card
  card:          { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  propName:      { fontSize: 17, fontWeight: '900', color: '#0F172A', letterSpacing: -0.3, marginBottom: 14 },
  chipRow:       { flexDirection: 'row', gap: 10 },
  chipRowSingle: { marginTop: 10 },
  notes:         { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '600', fontStyle: 'italic' },
  // Bottom bar
  bottomBar:     { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 14, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.97)', borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', gap: 10 },
  iconActionBtn: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  statusCta:     { flex: 1, height: 52, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  statusCtaText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
});
