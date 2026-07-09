// components/ui/BoostOverlay.tsx
//
// STYLING APPROACH:
//   ✅ NativeWind className  → layout, flex, padding, colors, radius, text (on plain View/Text)
//   ✅ StyleSheet            → shadows, elevation, letterSpacing, borderWidth details
//   ✅ Inline style          → dynamic/variant runtime values only
//   ❌ Never className on Animated.View (breaks with style array)

import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/theme/colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
  ZoomIn,
} from "react-native-reanimated";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BoostPlan {
  id:       string;
  label:    string;
  duration: string;
  price:    string;
  badge?:   string; // e.g. "Popular"
}

interface BoostOverlayProps {
  visible:       boolean;
  propertyTitle: string;
  onConfirm:     (plan: BoostPlan) => void;
  onCancel:      () => void;
  isAlreadyFeatured?: boolean;
  onRemoveFeature?: () => void;
}

// ─── Plans ────────────────────────────────────────────────────────────────────
const BOOST_PLANS: BoostPlan[] = [
  { id: "7d",  label: "Basic Boost",   duration: "7 days",  price: "₹199",  },
  { id: "15d", label: "Power Boost",   duration: "15 days", price: "₹349",  badge: "Popular" },
  { id: "30d", label: "Premium Boost", duration: "30 days", price: "₹599",  badge: "Best Value" },
];

// ─── Spring Button (safe — no className on Animated.View) ─────────────────────
function SpringButton({
  onPress,
  buttonStyle,
  children,
}: {
  onPress:     () => void;
  buttonStyle: object | object[];
  children:    React.ReactNode;
}) {
  const scale    = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={()  => { scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1.00, { damping: 12, stiffness: 260 }); }}
      onPress={onPress}
      style={{ flex: 1 }}
    >
      <Animated.View style={[animStyle, buttonStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan:     BoostPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  const scale    = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={()  => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1.00, { damping: 12, stiffness: 260 }); }}
      onPress={onSelect}
    >
      {/* ✅ Animated.View — StyleSheet only, no className */}
      <Animated.View
        style={[
          styles.planCard,
          selected && styles.planCardSelected,
          selected && { borderColor: colors.primary, shadowColor: colors.primary },
          animStyle,
        ]}
      >
        {/* Left: radio + label */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 10 }}>
          {/* Radio dot — inline style for dynamic color */}
          <View style={[styles.radio, selected && { borderColor: colors.primary }]}>
            {selected && <View style={styles.radioDot} />}
          </View>

          <View>
            {/* ✅ plain Text — className safe */}
            <Text className="text-[14px] font-bold text-slate-800">{plan.label}</Text>
            <Text className="text-[11px] text-slate-400 font-medium mt-0.5">{plan.duration}</Text>
          </View>
        </View>

        {/* Right: price + optional badge */}
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text className="text-[15px] font-black text-orange-500">{plan.price}</Text>
          {plan.badge && (
            // ✅ plain View — className safe
            <View className="bg-orange-500 px-2 py-0.5 rounded-full">
              <Text className="text-white text-[9px] font-bold uppercase" style={styles.badgeText}>
                {plan.badge}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Boost Overlay ────────────────────────────────────────────────────────────
const BoostOverlay = ({
  visible,
  propertyTitle,
  onConfirm,
  onCancel,
  isAlreadyFeatured = false,
  onRemoveFeature,
}: BoostOverlayProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("15d");
  const selectedPlan = BOOST_PLANS.find((p) => p.id === selectedPlanId)!;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>

      {/* ── Backdrop ── */}
      <Animated.View
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(180)}
        className="flex-1 items-center justify-center px-5"
        style={styles.backdrop}
      >
        {/* ── Card ── */}
        <Animated.View
          entering={ZoomIn.springify().damping(16).stiffness(180)}
          className="w-full bg-white rounded-3xl overflow-hidden"
          style={styles.card}
        >
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />

          <View className="px-6 pt-7 pb-6">

            {/* ── Header ── */}
            <View className="items-center mb-5">
              {/* Icon ring — StyleSheet + inline for colors */}
              <View style={styles.iconRing}>
                <Ionicons name="rocket-outline" size={34} color={colors.primary} />
              </View>

              <Text className="text-[20px] font-black text-slate-900 text-center" style={styles.title}>
                {isAlreadyFeatured ? "Your Listing is Featured!" : "Boost Your Listing"}
              </Text>
              {/* ✅ plain Text — className safe */}
              <Text className="text-[13px] text-slate-400 text-center mt-1.5 px-4 leading-5">
                {isAlreadyFeatured
                  ? `${propertyTitle} is currently active in featured listings.`
                  : `Get more eyes on ${propertyTitle}`}
              </Text>
            </View>

            {/* ── Benefits strip ── */}
            <View className="flex-row bg-orange-50 rounded-2xl px-4 py-3 mb-5 gap-4">
              {[
                { icon: "eye-outline",       label: "10× Views"    },
                { icon: "trending-up-outline",label: "Top Search"  },
                { icon: "star-outline",       label: "Featured Tag" },
              ].map(({ icon, label }) => (
                <View key={label} className="flex-1 items-center gap-1">
                  <Ionicons name={icon as any} size={18} color={colors.primary} />
                  <Text className="text-[10px] font-bold text-orange-600 text-center" style={styles.badgeText}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* ── Plan cards ── */}
            <View style={{ gap: 8, marginBottom: 20 }}>
              {BOOST_PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlanId === plan.id}
                  onSelect={() => setSelectedPlanId(plan.id)}
                />
              ))}
            </View>

            {/* ── Divider ── */}
            <View className="w-full h-px bg-gray-100 mb-5" />

            {/* ── Remove Feature button ── */}
            {isAlreadyFeatured && onRemoveFeature && (
              <SpringButton
                onPress={onRemoveFeature}
                buttonStyle={{
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  width: "100%",
                }}
              >
                <View className="flex-row items-center justify-center gap-1.5">
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text className="text-red-600 text-[15px] font-bold">Remove Feature</Text>
                </View>
              </SpringButton>
            )}

            {/* ── Buttons ── */}
            <View className="flex-row gap-3">

              {/* Cancel */}
              <SpringButton onPress={onCancel} buttonStyle={styles.cancelBtn}>
                <View className="flex-row items-center justify-center gap-1.5">
                  <Ionicons name="close-outline" size={18} color="#6B7280" />
                  <Text className="text-gray-600 text-[15px] font-semibold">Cancel</Text>
                </View>
              </SpringButton>

              {/* Confirm — inline backgroundColor + shadowColor */}
              <SpringButton
                onPress={() => onConfirm(selectedPlan)}
                buttonStyle={[
                  styles.confirmBtn,
                  { backgroundColor: colors.primary, shadowColor: colors.primary },
                ]}
              >
                <View className="flex-row items-center justify-center gap-1.5">
                  <Ionicons name="rocket-outline" size={16} color="#fff" />
                  <Text className="text-white text-[15px] font-bold">
                    Boost · {selectedPlan.price}
                  </Text>
                </View>
              </SpringButton>

            </View>

          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.50)" },

  card: {
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius:  40,
    elevation:     24,
  },

  accentBar: { height: 4, width: "100%" },

  iconRing: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: colors.primaryLight,
    borderWidth:     3,
    borderColor:     colors.primaryMuted,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
    shadowColor:     colors.primary,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.15,
    shadowRadius:    12,
    elevation:       4,
  },

  title:     { letterSpacing: -0.4 },
  badgeText: { letterSpacing: 0.8 },

  planCard: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius:    16,
    backgroundColor: colors.background,
    borderWidth:     1.5,
    borderColor:     colors.borderLight,
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.04,
    shadowRadius:    6,
    elevation:       1,
  },

  planCardSelected: {
    backgroundColor: colors.primaryLight,
    shadowOpacity:   0.18,
    shadowRadius:    12,
    elevation:       5,
  },

  radio: {
    width:           20,
    height:          20,
    borderRadius:    10,
    borderWidth:     2,
    borderColor:     colors.textPlaceholder,
    alignItems:      "center",
    justifyContent:  "center",
  },

  radioDot: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: colors.primary,
  },

  cancelBtn: {
    height:          52,
    borderRadius:    16,
    backgroundColor: colors.background,
    borderWidth:     1,
    borderColor:     colors.border,
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.05,
    shadowRadius:    6,
    elevation:       2,
  },

  confirmBtn: {
    height:          52,
    borderRadius:    16,
    alignItems:      "center",
    justifyContent:  "center",
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.38,
    shadowRadius:    14,
    elevation:       10,
  },
});

export default BoostOverlay;