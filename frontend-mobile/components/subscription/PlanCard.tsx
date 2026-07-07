import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Data ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    listings: "5 listings",
    price: "399",
    features: ["List up to 5 properties", "Basic support", "Analytics"],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium Plan",
    listings: "20 listings",
    price: "899",
    features: [
      "List up to 20 properties",
      "Boost 3 properties",
      "Priority support",
      "Advanced analytics",
    ],
    popular: true,
  },
  {
    id: "featured",
    name: "Featured Plan",
    listings: "Unlimited",
    price: "1799",
    features: [
      "Unlimited listings",
      "Unlimited boosts",
      "Top placement",
      "24/7 Premium support",
    ],
    popular: false,
  },
];

// ─── Sub-Component ────────────────────────────────────────────────────────────

const PlanCard = ({ plan, isSelected, onSelect }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      className={`mb-5 p-6 rounded-[32px] bg-white border-2 relative ${
        isSelected ? "border-[#FF7A22]" : "border-slate-100"
      }`}
      style={{}}
    >
      {plan.popular && (
        <View className="absolute -top-4 left-6 bg-[#FFB340] px-3 py-1 rounded-lg">
          <Text className="text-white text-[10px] font-black uppercase">
            Most Popular
          </Text>
        </View>
      )}

      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-2xl font-black text-slate-900">
            {plan.name}
          </Text>
          <Text className="text-slate-400 font-bold text-sm mt-1">
            {plan.listings}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[28px] font-black text-[#FF7A22]">
            ₹{plan.price}
          </Text>
          <Text className="text-slate-400 font-bold text-[10px]">/month</Text>
        </View>
      </View>

      <View className="mt-6">
        {plan.features.map((feature: string, index: number) => (
          <View key={index} className="flex-row items-center mb-3">
            <View className="bg-emerald-50 w-5 h-5 rounded-full items-center justify-center mr-3">
              <Ionicons name="checkmark" size={12} color="#10B981" />
            </View>
            <Text className="text-slate-600 font-medium text-[14px]">
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Radio Selection Indicator */}
      <View
        className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 items-center justify-center ${
          isSelected ? "border-[#FF7A22] bg-[#FF7A22]" : "border-slate-200"
        }`}
      >
        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("premium");

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100"
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <Text className="text-xl font-black text-slate-900">
            Choose a Plan
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 pt-4">
          <Text className="text-center text-slate-400 font-medium text-[15px] mb-8 leading-6">
            Unlock posting & boosting. Cancel anytime.
          </Text>

          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Button */}
      <View className="absolute bottom-8 left-6 right-6">
        <TouchableOpacity
          activeOpacity={0.9}
          className="bg-[#FF7A22] h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/40"
        >
          <Text className="text-white text-lg font-black">Activate Plan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
