import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  RefreshCw,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import ScreenHeader from "@/components/common/ScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import SectionDivider from "@/components/common/SectionDivider";
import colors from "@/theme/colors";
import { useContactUs } from "@/hooks/useSupportAndLegalHooks";
import type { FAQ } from "@/services/supportAndLegalService";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ width = '100%', height = 14 }: { width?: any; height?: number }) => (
  <View style={{ width, height, backgroundColor: '#F1F5F9', borderRadius: 8, marginBottom: 8 }} />
);

function ContactSkeleton() {
  return (
    <View>
      {/* Contact cards */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, marginTop: 8 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: '31%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF7ED', marginBottom: 12 }} />
            <SkeletonBlock width={50} height={10} />
          </View>
        ))}
      </View>
      {/* FAQ skeletons */}
      <SkeletonBlock width="40%" height={12} />
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <SkeletonBlock width="80%" height={14} />
        </View>
      ))}
    </View>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

const FaqItem = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQ;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onToggle}
    style={[styles.faqCard, isOpen && styles.faqCardActive]}
  >
    <View className="flex-row justify-between items-center p-5">
      <Text
        className={`font-bold flex-1 pr-3 text-[14px] leading-5 ${
          isOpen ? "text-orange-600" : "text-slate-800"
        }`}
      >
        {item.question}
      </Text>
      <View className={isOpen ? "bg-orange-500 p-1 rounded-full" : ""}>
        {isOpen ? (
          <ChevronUp size={16} color={colors.white} />
        ) : (
          <ChevronDown size={18} color={colors.primary} />
        )}
      </View>
    </View>
    {isOpen && (
      <Animated.View
        entering={FadeInDown.duration(250)}
        className="px-5 pb-5 pt-1"
      >
        <Text className="text-slate-500 text-[13px] leading-5 font-medium border-t border-orange-50 pt-3">
          {item.answer}
        </Text>
      </Animated.View>
    )}
  </TouchableOpacity>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HelpSupport() {
  const insets = useSafeAreaInsets();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const { data, isLoading, isError, refetch } = useContactUs();

  const page = data?.data;
  const content = page?.content;

  // Build contact channel buttons from API data
  const contactChannels = content
    ? [
        {
          icon: Phone,
          label: "Call",
          url: `tel:${content.phone}`,
        },
        {
          icon: Mail,
          label: "Email",
          url: `mailto:${content.email}`,
        },
        {
          icon: MessageCircle,
          label: "WhatsApp",
          url: `https://wa.me/${content.whatsapp.replace(/[^0-9]/g, "")}`,
        },
      ]
    : [];

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Help & Support"
        subtitle="We're happy to assist"
        rightIcon={<LifeBuoy size={18} color={colors.primary} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Loading */}
        {isLoading && <ContactSkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center py-24">
            <LifeBuoy size={40} color={colors.textPlaceholder} />
            <Text className="text-slate-900 font-black text-lg mt-4">
              Failed to load
            </Text>
            <Text className="text-slate-400 font-medium text-sm mt-2 text-center">
              Could not fetch support info. Please try again.
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
            {/* Contact Channels */}
            <SectionDivider label="Contact Channels" className="mt-2" />
            <View className="flex-row justify-between mb-8">
              {contactChannels.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => Linking.openURL(item.url)}
                  activeOpacity={0.75}
                  className="bg-white rounded-xl p-4 w-[31%] items-center border border-slate-100"
                >
                  <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center mb-3">
                    <item.icon size={22} color={colors.primary} />
                  </View>
                  <Text className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FAQ Section */}
            <SectionDivider label="Frequently Asked" />
            {(content.faqs ?? []).map((item, index) => (
              <FaqItem
                key={item.id}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}

            {/* Support Hours */}
            <View className="bg-slate-900 rounded-xl p-6 mt-8 relative overflow-hidden mb-2">
              <View className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 rounded-full" />

              <View className="flex-row items-center mb-4">
                <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                <Text className="font-black text-orange-500 uppercase tracking-widest text-[10px]">
                  Support Availability
                </Text>
              </View>

              {/* Parse "Monday - Saturday, 9:00 AM - 7:00 PM IST" */}
              {(() => {
                const parts = (content.supportHours ?? "").split(",");
                const days = parts[0]?.trim() ?? "";
                const hours = parts[1]?.trim() ?? "";
                return (
                  <>
                    <Text className="text-white font-black text-xl tracking-tight">
                      {days}
                    </Text>
                    {Boolean(hours) && (
                      <Text className="text-slate-400 font-bold text-sm mt-1">
                        {hours}
                      </Text>
                    )}
                  </>
                );
              })()}

              <TouchableOpacity
                className="mt-6 bg-orange-500 py-3 rounded-xl items-center"
                activeOpacity={0.8}
                onPress={() => Linking.openURL(`tel:${content.phone}`)}
              >
                <Text className="text-white font-black text-xs uppercase tracking-widest">
                  Call Support Now
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  faqCardActive: {
    borderColor: colors.primary,
  },
});
