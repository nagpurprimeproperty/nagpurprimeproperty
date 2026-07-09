import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import {
  Info,
  Globe,
  Mail,
  MapPin,
  Zap,
  CheckCircle2,
  Building2,
  Phone,
  RefreshCw,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeader from '@/shared/components/ScreenHeader';
import ScreenWrapper from '@/shared/components/ScreenWrapper';
import SectionDivider from '@/shared/components/SectionDivider';
import colors from '@/theme/colors';
import { useAboutUs } from '@/hooks/useSupportAndLegalHooks';

// ─── Sub-Components ───────────────────────────────────────────────────────────

const StatBox = ({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) => (
  <Animated.View
    entering={FadeInDown.delay(Math.min(200 + index * 40, 280)).duration(200)}
    className="flex-1 bg-white p-4 rounded-xl items-center border border-slate-200 mx-1"
  >
    <Text className="text-[18px] font-black text-orange-500 tracking-tighter">
      {value}
    </Text>
    <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
      {label}
    </Text>
  </Animated.View>
);

const FeatureItem = ({ text, index }: { text: string; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(Math.min(100 + index * 40, 200)).duration(200)}
    className="flex-row items-center mb-4"
  >
    <View className="bg-emerald-50 p-1.5 rounded-full border border-emerald-100">
      <CheckCircle2 size={16} color={colors.success} strokeWidth={3} />
    </View>
    <Text className="text-slate-600 font-bold ml-3 text-[14px] tracking-tight">
      {text}
    </Text>
  </Animated.View>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBlock = ({
  width = '100%',
  height = 14,
  style,
}: {
  width?: string | number;
  height?: number;
  style?: any;
}) => (
  <View
    style={[
      { width, height, backgroundColor: '#F1F5F9', borderRadius: 8, marginBottom: 8 },
      style,
    ]}
  />
);

function AboutSkeleton() {
  return (
    <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
      {/* Brand card */}
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#E2E8F0' }}>
        <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: '#FFF7ED', marginBottom: 20 }} />
        <SkeletonBlock width={160} height={24} />
        <SkeletonBlock width={100} height={12} />
      </View>
      {/* Mission */}
      <SkeletonBlock width="40%" height={12} style={{ marginBottom: 16 }} />
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: '#E2E8F0' }}>
        <SkeletonBlock height={13} />
        <SkeletonBlock width="90%" height={13} />
        <SkeletonBlock width="80%" height={13} />
      </View>
      {/* Stats */}
      <View style={{ flexDirection: 'row', marginBottom: 32 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginHorizontal: 4 }}>
            <SkeletonBlock width={40} height={18} />
            <SkeletonBlock width={50} height={10} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useAboutUs();

  const page = data?.data;
  const content = page?.content;

  const stats = content?.stats
    ? [
        { value: content.stats.properties, label: 'Listings' },
        { value: content.stats.brokers, label: 'Brokers' },
        { value: content.stats.users, label: 'Users' },
        { value: content.stats.cities, label: 'Cities' },
      ]
    : [];

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="About Us"
        subtitle="Nagpur Prime overview"
        rightIcon={<Info size={18} color={colors.primary} />}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: insets.bottom + 60,
        }}
      >
        {/* Loading */}
        {isLoading && <AboutSkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center py-24">
            <Building2 size={40} color={colors.textPlaceholder} />
            <Text className="text-slate-900 font-black text-lg mt-4">
              Failed to load
            </Text>
            <Text className="text-slate-400 font-medium text-sm mt-2 text-center">
              Could not fetch about us info. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              activeOpacity={0.8}
              className="mt-6 flex-row items-center bg-orange-500 px-6 py-3 rounded-xl"
            >
              <RefreshCw size={14} color="white" />
              <Text className="text-white font-black text-xs ml-2 uppercase tracking-widest">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {!isLoading && !isError && content && (
          <>
            {/* Brand Card */}
            <Animated.View
              entering={FadeInDown.duration(200)}
              className="bg-white p-8 rounded-xl items-center border border-slate-200 mb-8"
            >
              <View className="bg-orange-50 w-20 h-20 rounded-xl items-center justify-center mb-5 rotate-3 border border-orange-100">
                <Building2 size={40} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text className="text-3xl font-black text-slate-900 tracking-tighter">
                Nagpur Prime
              </Text>
              <Text className="text-orange-500 font-black text-[10px] uppercase tracking-[4px] mt-1">
                Property Portal
              </Text>
              <View className="mt-6 bg-slate-900 px-4 py-2 rounded-xl flex-row items-center">
                <Zap size={12} color={colors.primary} fill={colors.primary} />
                <Text className="text-white font-black text-[11px] ml-2 uppercase tracking-widest">
                  Version 1.0.0
                </Text>
              </View>
            </Animated.View>

            {/* Tagline banner */}
            {Boolean(content.tagline) && (
              <Animated.View
                entering={FadeInDown.delay(60).duration(200)}
                className="bg-orange-50 border border-orange-100 rounded-xl px-6 py-4 mb-8"
              >
                <Text className="text-orange-600 font-black text-center text-[15px] tracking-tight italic">
                  "{content.tagline}"
                </Text>
              </Animated.View>
            )}

            {/* Mission */}
            <SectionDivider label="Our Mission" />
            <Animated.View
              entering={FadeInDown.delay(80).duration(200)}
              className="bg-white p-6 rounded-xl border border-slate-200 mb-8"
            >
              <Text className="text-slate-500 leading-6 text-[15px] font-medium italic">
                "{content.mission}"
              </Text>
            </Animated.View>

            {/* What we offer */}
            {content.whatWeOffer?.length > 0 && (
              <>
                <View className="mb-5">
                  <SectionDivider label="Premium Features" />
                </View>
                <View className="mb-8 px-2">
                  {content.whatWeOffer.map((item, i) => (
                    <FeatureItem key={i} text={item} index={i} />
                  ))}
                </View>
              </>
            )}

            {/* Stats Row */}
            {stats.length > 0 && (
              <View className="flex-row mb-10">
                {stats.map((s, i) => (
                  <StatBox key={i} value={s.value} label={s.label} index={i} />
                ))}
              </View>
            )}

            {/* Contact Info */}
            {content.contactInfo && (
              <>
                <View className="mb-5">
                  <SectionDivider label="Get in Touch" />
                </View>
                <Animated.View
                  entering={FadeInDown.delay(120).duration(200)}
                  className="bg-slate-900 rounded-xl p-8 mb-10 relative overflow-hidden"
                >
                  <View className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 rounded-full" />

                  {Boolean(content.contactInfo.phone) && (
                    <TouchableOpacity
                      className="flex-row items-center mb-6"
                      onPress={() =>
                        Linking.openURL(`tel:${content.contactInfo.phone}`)
                      }
                    >
                      <Phone size={20} color={colors.primary} />
                      <Text className="ml-4 text-white font-bold tracking-tight">
                        {content.contactInfo.phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {Boolean(content.contactInfo.website) && (
                    <TouchableOpacity
                      className="flex-row items-center mb-6"
                      onPress={() =>
                        Linking.openURL(`https://${content.contactInfo.website}`)
                      }
                    >
                      <Globe size={20} color={colors.primary} />
                      <Text className="ml-4 text-white font-bold tracking-tight">
                        {content.contactInfo.website}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {Boolean(content.contactInfo.email) && (
                    <TouchableOpacity
                      className="flex-row items-center mb-6"
                      onPress={() =>
                        Linking.openURL(`mailto:${content.contactInfo.email}`)
                      }
                    >
                      <Mail size={20} color={colors.primary} />
                      <Text className="ml-4 text-white font-bold tracking-tight">
                        {content.contactInfo.email}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {Boolean(content.contactInfo.address) && (
                    <View className="flex-row items-center">
                      <MapPin size={20} color={colors.primary} />
                      <Text className="ml-4 text-white font-bold tracking-tight">
                        {content.contactInfo.address}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </>
            )}

            <Text className="text-center text-slate-300 font-black text-[10px] uppercase tracking-[3px] mb-4">
              © 2026 Nagpur Prime Property
            </Text>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
