import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  MessageSquare,
  Phone,
  User,
  RefreshCw,
  XCircle,
  Building2,
  MessageCircle,
  Clock,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import ScreenHeader from '@/components/common/ScreenHeader';
import ScreenWrapper from '@/components/common/ScreenWrapper';
import { useEnquiry } from '@/hooks/useEnquiryHook';
import { EnquiryDetailSkeleton } from '@/components/skeleton/Skelton';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function statusCfg(status: string) {
  if (status === 'Responded')
    return { bg: '#D1FAE5', text: '#059669', dot: '#10B981' };
  return { bg: '#FFF7ED', text: '#EA580C', dot: '#F97316' };
}

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
  row:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  text: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase' },
});

// ─── Info Chip ─────────────────────────────────────────────────────────────────

function InfoChip({ label, value }: { label: string; value?: string }) {
  return (
    <View style={ic.wrap}>
      <View style={ic.header}>
        <Text style={ic.label}>{label}</Text>
      </View>
      <Text style={ic.value}>{value || '—'}</Text>
    </View>
  );
}

const ic = StyleSheet.create({
  wrap:   { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  header: { marginBottom: 6 },
  label:  { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },
  value:  { fontSize: 14, fontWeight: '900', color: '#0F172A', letterSpacing: -0.2 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function EnquiryDetailScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const enquiryId = typeof id === 'string' ? id : undefined;

  const { data, isLoading, isError, error, refetch } = useEnquiry(enquiryId, Boolean(enquiryId));
  const enquiry  = data?.data;
  const imageUrl = enquiry?.photos?.[0];

  // WhatsApp — open wa.me with broker name as context
  const onWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const broker = enquiry?.brokerName || 'the broker';
    const prop   = enquiry?.propertyName || 'the property';
    const msg    = `Hello ${broker}, I am interested in ${prop} and would like to get more information. I enquired via Nagpur Prime Property.`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  const onCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // No phone in enquiry data — show intent; broker contact via WhatsApp
  };

  if (!enquiryId) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Enquiry Details" subtitle="No enquiry selected" />
        <View style={ms.center}>
          <XCircle size={40} color="#EF4444" />
          <Text style={ms.errTitle}>No enquiry selected</Text>
          <Text style={ms.errSub}>Please go back and choose an enquiry from the list.</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={ms.retryBtn}>
            <Text style={ms.retryText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Enquiry Details"
        subtitle={enquiry?.propertyName ?? `#${enquiryId.slice(-6).toUpperCase()}`}
      />

      {isLoading ? (
        <EnquiryDetailSkeleton />
      ) : isError || !enquiry ? (
        <View style={ms.center}>
          <XCircle size={40} color="#EF4444" />
          <Text style={ms.errTitle}>Unable to load enquiry</Text>
          <Text style={ms.errSub}>
            {error?.message || 'Please check your connection and try again.'}
          </Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8} style={ms.retryBtn}>
            <RefreshCw size={14} color="#fff" />
            <Text style={ms.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[ms.scroll, { paddingBottom: insets.bottom + 110 }]}
          >
            {/* ── Hero card ── */}
            <Animated.View entering={FadeInDown.duration(200)} style={ms.heroCard}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={ms.heroImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[ms.heroImage, ms.heroPlaceholder]}>
                  <MapPin size={40} color="#CBD5E1" strokeWidth={1.5} />
                </View>
              )}

              <View style={ms.heroPad}>
                {/* Status badge */}
                {(() => {
                  const sc = statusCfg(enquiry.status);
                  return (
                    <View style={[ms.statusBadge, { backgroundColor: sc.bg }]}>
                      <View style={[ms.statusDot, { backgroundColor: sc.dot }]} />
                      <Text style={[ms.statusText, { color: sc.text }]}>{enquiry.status}</Text>
                    </View>
                  );
                })()}

                <Text style={ms.heroName}>{enquiry.propertyName}</Text>
                <Text style={ms.heroPrice}>{enquiry.totalPrice}</Text>

                {/* Tags */}
                <View style={ms.tagsRow}>
                  {enquiry.listingCategory ? (
                    <View style={ms.tag}>
                      <Building2 size={11} color="#475569" strokeWidth={2} />
                      <Text style={ms.tagText}>{enquiry.listingCategory}</Text>
                    </View>
                  ) : null}
                  {enquiry.propertyType ? (
                    <View style={ms.tag}>
                      <MapPin size={11} color="#475569" strokeWidth={2} />
                      <Text style={ms.tagText}>{enquiry.propertyType}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Animated.View>

            {/* ── Broker contact ── */}
            <Animated.View entering={FadeInDown.delay(40).duration(200)} style={ms.card}>
              <SectionLabel icon={User} text="Broker Contact" />
              <View style={ms.brokerRow}>
                <View style={ms.brokerAvatar}>
                  <User size={22} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={ms.brokerInfo}>
                  <Text style={ms.brokerName}>{enquiry.brokerName || 'Broker'}</Text>
                  <Text style={ms.brokerSub}>{enquiry.propertyType || 'Property enquiry'}</Text>
                </View>
              </View>
              <View style={ms.divider} />
              <View style={ms.hintRow}>
                <Phone size={14} color="#94A3B8" strokeWidth={2} />
                <Text style={ms.hintText}>Use the buttons below to contact the broker</Text>
              </View>
            </Animated.View>

            {/* ── Property details ── */}
            <Animated.View entering={FadeInDown.delay(80).duration(200)} style={ms.card}>
              <SectionLabel icon={MapPin} text="Property Details" />
              <View style={ms.locationRow}>
                <View style={ms.locationIcon}>
                  <MapPin size={16} color={colors.primary} strokeWidth={2.5} />
                </View>
                <View style={ms.locationInfo}>
                  <Text style={ms.locationArea}>
                    {enquiry.area || 'Location not specified'}
                  </Text>
                  <Text style={ms.brokerSub}>{enquiry.propertyType || 'Property type'}</Text>
                </View>
              </View>
              <View style={ms.chipRow}>
                <InfoChip label="Budget"   value={enquiry.budget} />
                <InfoChip label="Enquired" value={enquiry.enquired} />
              </View>
            </Animated.View>

            {/* ── Message ── */}
            <Animated.View entering={FadeInDown.delay(120).duration(200)} style={ms.card}>
              <SectionLabel icon={MessageSquare} text="Your Message" />
              <View style={ms.messageBox}>
                <Text style={ms.messageText}>
                  {enquiry.notes || 'No message was provided with this enquiry.'}
                </Text>
              </View>
            </Animated.View>

            {/* ── Timestamp ── */}
            <Animated.View entering={FadeInDown.delay(160).duration(200)} style={ms.timePill}>
              <Clock size={11} color="#94A3B8" strokeWidth={2} />
              <Text style={ms.timeText}>Enquired {enquiry.enquired}</Text>
            </Animated.View>
          </ScrollView>

          {/* ── Sticky action bar ── */}
          <View style={[ms.actionBar, { paddingBottom: insets.bottom + 16 }]}>
            {/* Call button */}
            <TouchableOpacity
              onPress={onCall}
              activeOpacity={0.75}
              style={ms.callBtn}
            >
              <Phone size={20} color="#475569" strokeWidth={2} />
            </TouchableOpacity>

            {/* WhatsApp button */}
            <TouchableOpacity
              onPress={onWhatsApp}
              activeOpacity={0.85}
              style={[ms.whatsappBtn, shadows.button]}
            >
              <MessageCircle size={18} color="#fff" strokeWidth={2.5} />
              <Text style={ms.whatsappText}>WhatsApp Broker</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  scroll:          { paddingHorizontal: 10, paddingTop: 12 },
  errTitle:        { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 16 },
  errSub:          { color: '#64748B', textAlign: 'center', marginTop: 8 },
  retryBtn:        { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  retryText:       { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },

  // Hero card
  heroCard:        { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  heroImage:       { width: '100%', height: 220 },
  heroPlaceholder: { backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  heroPad:         { padding: 18 },
  statusBadge:     { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5, marginBottom: 10 },
  statusDot:       { width: 6, height: 6, borderRadius: 3 },
  statusText:      { fontSize: 11, fontWeight: '900' },
  heroName:        { fontSize: 20, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  heroPrice:       { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: -0.8, marginTop: 4, marginBottom: 12 },
  tagsRow:         { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag:             { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  tagText:         { fontSize: 11, fontWeight: '700', color: '#475569' },

  // Generic card
  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  divider:         { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },

  // Broker
  brokerRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  brokerAvatar:    { width: 52, height: 52, borderRadius: 14, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  brokerInfo:      { flex: 1 },
  brokerName:      { fontSize: 16, fontWeight: '900', color: '#0F172A', letterSpacing: -0.3 },
  brokerSub:       { fontSize: 13, color: '#6B7280', marginTop: 2 },
  hintRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintText:        { fontSize: 13, color: '#94A3B8' },

  // Location
  locationRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  locationIcon:    { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  locationInfo:    { flex: 1 },
  locationArea:    { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  chipRow:         { flexDirection: 'row', gap: 10 },

  // Message
  messageBox:      { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  messageText:     { fontSize: 14, color: '#475569', lineHeight: 24, fontStyle: 'italic', fontWeight: '500' },

  // Time pill
  timePill:        { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 4 },
  timeText:        { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 },

  // Action bar
  actionBar:       { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingTop: 14, backgroundColor: 'rgba(255,255,255,0.97)', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  callBtn:         { width: 52, height: 52, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  whatsappBtn:     { flex: 1, height: 52, borderRadius: 14, backgroundColor: colors.whatsapp, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  whatsappText:    { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
});
