import React from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { ShieldCheck, FileText, Zap, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import ScreenHeader from '@/shared/components/ScreenHeader';
import ScreenWrapper from '@/shared/components/ScreenWrapper';
import SectionDivider from '@/shared/components/SectionDivider';
import colors from '@/theme/colors';
import { useTermsAndConditions } from '@/hooks/useSupportAndLegalHooks';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseHtmlSections(html: string): { title: string; content: string }[] {
  const withoutH2 = html.replace(/<h2[^>]*>.*?<\/h2>/gi, '');
  const rawSections = withoutH2.split(/<h3[^>]*>/i).filter(Boolean);

  return rawSections.map((section) => {
    const titleMatch = section.match(/^(.*?)<\/h3>/i);
    const rawTitle = titleMatch ? titleMatch[1] : '';
    const contentMatch = section.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const rawContent = contentMatch
      .map((p) => p.replace(/<[^>]+>/g, ''))
      .join(' ');
    return {
      title: decodeEntities(rawTitle.replace(/<[^>]+>/g, '').trim()),
      content: decodeEntities(rawContent.trim()),
    };
  }).filter((s) => s.title);
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Sub-Component ────────────────────────────────────────────────────────────

const Section = ({
  title,
  content,
  index,
}: {
  title: string;
  content: string;
  index: number;
}) => (
  <Animated.View
    entering={FadeInDown.delay(Math.min(index * 40, 120)).duration(200)}
    className="mb-8"
  >
    <View className="flex-row items-center mb-3">
      <View className="w-8 h-8 rounded-xl bg-orange-50 items-center justify-center mr-3">
        <Text className="text-orange-500 font-black text-xs">{index}</Text>
      </View>
      <Text className="text-lg font-black text-slate-900 tracking-tight flex-1">
        {title}
      </Text>
    </View>
    <Text className="text-slate-500 leading-6 text-[14px] font-medium ml-11">
      {content}
    </Text>
  </Animated.View>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ width = '100%', height = 14 }: { width?: any; height?: number }) => (
  <View style={{ width, height, backgroundColor: '#F1F5F9', borderRadius: 8, marginBottom: 8 }} />
);

function TermsSkeleton() {
  return (
    <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
      <SkeletonBlock width="40%" height={12} />
      <SkeletonBlock width="70%" height={32} />
      <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <SkeletonBlock height={14} />
        <SkeletonBlock width="85%" height={14} />
      </View>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#FFF7ED', marginRight: 12 }} />
            <SkeletonBlock width="55%" height={16} />
          </View>
          <View style={{ marginLeft: 44 }}>
            <SkeletonBlock height={12} />
            <SkeletonBlock width="85%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TermsAndConditions() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useTermsAndConditions();

  const page = data?.data;
  const sections = page ? parseHtmlSections(page.content) : [];

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Terms & Conditions"
        subtitle="Platform usage rules"
        rightIcon={<ShieldCheck size={18} color={colors.primary} />}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Loading */}
        {isLoading && <TermsSkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center py-24">
            <FileText size={40} color={colors.textPlaceholder} />
            <Text className="text-slate-900 font-black text-lg mt-4">
              Failed to load
            </Text>
            <Text className="text-slate-400 font-medium text-sm mt-2 text-center">
              Could not fetch terms and conditions. Please try again.
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
        {!isLoading && !isError && page && (
          <>
            <SectionDivider label="Legals" />

            <Text className="text-slate-400 font-bold text-[12px] mb-2 uppercase tracking-widest">
              Last updated: {formatDate(page.lastUpdated)}
            </Text>

            <Text className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">
              Terms &{'\n'}Conditions
            </Text>

            {/* Quick Summary Banner */}
            <Animated.View
              entering={FadeInDown.delay(60).duration(200)}
              className="bg-slate-900 rounded-xl p-6 mb-10 relative overflow-hidden"
            >
              <View className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 rounded-full" />
              <View className="flex-row items-center mb-2">
                <Zap size={14} color={colors.primary} strokeWidth={3} />
                <Text className="text-orange-500 font-black text-[10px] uppercase tracking-widest ml-2">
                  Quick Summary
                </Text>
              </View>
              <Text className="text-white font-bold text-[13px] leading-5">
                By using Nagpur Prime, you agree to our platform rules. We
                connect you with verified brokers but are not party to financial
                transactions.
              </Text>
            </Animated.View>

            {/* Sections from API */}
            {sections.map((s, i) => (
              <Section key={i} index={i + 1} title={s.title} content={s.content} />
            ))}

            <View className="mt-10 pt-10 border-t border-orange-100 items-center">
              <FileText size={20} color={colors.textPlaceholder} />
              <Text className="text-slate-300 font-black text-[10px] uppercase tracking-[3px] mt-4">
                Nagpur Prime Property
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
