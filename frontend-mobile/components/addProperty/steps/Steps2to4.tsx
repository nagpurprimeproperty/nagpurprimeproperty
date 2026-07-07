import { Ionicons } from "@expo/vector-icons";
import colors from '@/theme/colors';
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { NAGPUR_LOCALITIES } from "../../../lib/constants";
import { getStep3Fields, getStep4Fields } from "../../../lib/fieldMatrix";
import { useAddPropertyStore } from "../../../store/addPropertyStore";
import DynamicField from "../fields/DynamicField";

// ── Shared primitives ─────────────────────────────────────────────────────────
function StepHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-orange-200 flex-row items-center gap-3.5"
      style={{
        elevation: 4,
        shadowColor: colors.shadowPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      }}
    >
      <View
        className="w-12 h-12 rounded-full bg-orange-500 items-center justify-center"
        style={{
          elevation: 6,
          shadowColor: colors.shadowPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        }}
      >
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-extrabold text-gray-900">{title}</Text>
        <Text className="text-[13px] text-gray-500 mt-0.5">{subtitle}</Text>
      </View>
    </View>
  );
}

function SectionCard({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 shadow-sm"
      style={{ elevation: 3 }}
    >
      <View
        className={`flex-row items-center gap-2 ${subtitle ? "mb-1" : "mb-3.5"}`}
      >
        <View className="w-1 h-[18px] bg-orange-500 rounded-sm" />
        {icon && <Ionicons name={icon} size={15} color={colors.primary} />}
        <Text className="text-xs font-extrabold text-gray-700 tracking-widest uppercase">
          {title}
        </Text>
      </View>
      {subtitle && (
        <Text className="text-xs text-gray-400 mb-3.5 ml-3">{subtitle}</Text>
      )}
      {children}
    </View>
  );
}

function InputRow({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-1 mb-2">
        <Text className="text-[13px] font-bold text-gray-700">{label}</Text>
        {required ? (
          <Text className="text-orange-500 text-sm font-extrabold">*</Text>
        ) : (
          <Text className="text-gray-400 text-xs">(optional)</Text>
        )}
      </View>
      {children}
      {error && (
        <View className="flex-row items-center gap-1 mt-1">
          <Ionicons name="alert-circle" size={13} color="#EF4444" />
          <Text className="text-xs text-red-500 flex-1">{error}</Text>
        </View>
      )}
    </View>
  );
}

function PremiumTextInput({
  icon,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  maxLength,
  hasError,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  placeholder: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  maxLength?: number;
  hasError?: boolean;
}) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const borderCls = hasError
    ? "border-red-400 bg-red-50"
    : focused
      ? "border-orange-500 bg-white"
      : "border-gray-200 bg-white";
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      className={`flex-row items-center px-3.5 gap-2.5 border-[1.5px] rounded-xl ${borderCls}`}
      style={[
        { height: 52 },
        focused
                ? {
                    shadowColor: colors.shadowPrimary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                  }
          : {},
      ]}
    >
      <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.inactive} />
      <TextInput
        ref={inputRef}
        className="flex-1 text-gray-900 text-sm"
        style={{ height: 52 }}
        placeholder={placeholder}
                placeholderTextColor={colors.inactive}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </TouchableOpacity>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 shadow-sm"
      style={{ elevation: 3 }}
    >
      <View className="flex-row items-center gap-2 mb-3.5">
        <View className="w-1 h-[18px] bg-orange-500 rounded-sm" />
        <Text className="text-xs font-extrabold text-gray-700 tracking-widest uppercase">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function EmptyStepState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-200 items-center justify-center mb-4">
        <Ionicons name="arrow-up-circle-outline" size={40} color={colors.primary} />
      </View>
      <Text className="text-base font-bold text-gray-700 text-center leading-6">
        {message}
      </Text>
    </View>
  );
}

// ── STEP 2 ────────────────────────────────────────────────────────────────────
export function Step2Location() {
  const step2 = useAddPropertyStore((s) => s.step2);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep2 = useAddPropertyStore((s) => s.updateStep2);
  const router = useRouter();
  const [localitySearch, setLocalitySearch] = useState("");
  const [showLocalities, setShowLocalities] = useState(false);
  const localitySearchRef = useRef<TextInput>(null);
  const filteredLocalities = NAGPUR_LOCALITIES.filter((l) =>
    l.toLowerCase().includes(localitySearch.toLowerCase()),
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StepHeader
        icon="location"
        title="Location"
        subtitle="Where is the property located?"
      />

      {/* City */}
      <SectionCard title="City" icon="business-outline">
        <View
          className="flex-row items-center border-[1.5px] rounded-xl px-3.5 gap-2.5 bg-orange-50 border-orange-200"
          style={{ height: 52 }}
        >
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text className="text-gray-700 flex-1 text-sm font-semibold">
            Nagpur
          </Text>
          <View className="bg-orange-500 rounded-lg px-2.5 py-1">
            <Text className="text-white text-[10px] font-bold tracking-wide">
              FIXED
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Locality */}
      <SectionCard
        title="Locality"
        icon="map-outline"
        subtitle="Select from 25 Nagpur areas"
      >
        <InputRow label="Locality" required error={errors.locality}>
          <TouchableOpacity
            onPress={() => {
              setShowLocalities(!showLocalities);
              if (!showLocalities)
                setTimeout(() => localitySearchRef.current?.focus(), 150);
            }}
            activeOpacity={0.8}
            className={`flex-row items-center border-[1.5px] rounded-xl px-3.5 gap-2.5
              ${errors.locality ? "border-red-400 bg-red-50" : showLocalities ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white"}`}
            style={[
              { height: 52 },
              showLocalities
                ? {
                    shadowColor: colors.shadowPrimary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                  }
                : {},
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={showLocalities ? colors.primary : colors.inactive}
            />
            <Text
              className={`flex-1 text-sm ${step2.locality ? "text-gray-900" : "text-gray-400"}`}
            >
              {step2.locality || "Search locality…"}
            </Text>
            <Ionicons
              name={showLocalities ? "chevron-up" : "chevron-down"}
              size={16}
              color={showLocalities ? colors.primary : colors.inactive}
            />
          </TouchableOpacity>

          {showLocalities && (
            <View
              className="mt-1.5 border-[1.5px] border-orange-200 rounded-2xl overflow-hidden bg-white"
              style={{
                elevation: 6,
                shadowColor: colors.shadowPrimary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 10,
              }}
            >
              <View className="flex-row items-center gap-2 border-b border-gray-200 bg-orange-50 px-3.5">
                <Ionicons name="search-outline" size={15} color={colors.primary} />
                <TextInput
                  ref={localitySearchRef}
                  className="flex-1 text-gray-900 text-[13px]"
                  style={{ height: 46 }}
                  placeholder="Search localities…"
                  placeholderTextColor={colors.inactive}
                  value={localitySearch}
                  onChangeText={setLocalitySearch}
                />
                {localitySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setLocalitySearch("")}>
                    <Ionicons name="close-circle" size={16} color={colors.inactive} />
                  </TouchableOpacity>
                )}
              </View>
              {filteredLocalities.length === 0 ? (
                <View className="items-center py-4">
                  <Ionicons name="search-outline" size={22} color={colors.inactive} />
                  <Text className="text-gray-400 text-[13px] mt-1.5">
                    No localities found
                  </Text>
                </View>
              ) : (
                filteredLocalities.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    activeOpacity={0.8}
                    onPress={() => {
                      updateStep2({ locality: loc });
                      setShowLocalities(false);
                      setLocalitySearch("");
                    }}
                    className={`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-50
                      ${step2.locality === loc ? "bg-orange-50" : "bg-white"}`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={step2.locality === loc ? colors.primary : colors.inactive}
                      />
                      <Text
                        className={`text-sm ${step2.locality === loc ? "font-bold text-orange-700" : "text-gray-900"}`}
                      >
                        {loc}
                      </Text>
                    </View>
                    {step2.locality === loc && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </InputRow>

        <InputRow label="Sub-Locality">
          <PremiumTextInput
            icon="map-outline"
            value={step2.subLocality}
            placeholder="e.g. near Poonam Chambers"
            onChangeText={(t) => updateStep2({ subLocality: t })}
            maxLength={100}
          />
        </InputRow>
        <InputRow label="Landmark">
          <PremiumTextInput
            icon="flag-outline"
            value={step2.landmark}
            placeholder="e.g. opposite Empress Mall"
            onChangeText={(t) => updateStep2({ landmark: t })}
            maxLength={100}
          />
        </InputRow>
        <InputRow label="Pin Code">
          <PremiumTextInput
            icon="mail-outline"
            value={step2.pinCode}
            placeholder="440001 – 440037"
            onChangeText={(t) => updateStep2({ pinCode: t })}
            keyboardType="numeric"
            maxLength={6}
          />
        </InputRow>
      </SectionCard>

      {/* Map Pin */}
      <SectionCard
        title="Map Pin"
        icon="navigate-outline"
        subtitle="Required — drop a pin on the map"
      >
        {step2.latitude ? (
          <View className="bg-green-50 border-[1.5px] border-green-200 rounded-2xl p-4">
            <View className="flex-row items-center gap-3 mb-3">
              <View
                className="w-11 h-11 rounded-full bg-emerald-500 items-center justify-center"
                style={{
                  elevation: 6,
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                }}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-green-800 font-extrabold text-sm">
                  Location Pinned ✓
                </Text>
                <Text className="text-green-700 text-xs mt-0.5">
                  Pin dropped successfully
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/mapPicker" as any)}
                className="bg-white border-[1.5px] border-green-200 rounded-xl px-3 py-2 flex-row items-center gap-1"
              >
                <Ionicons name="pencil-outline" size={13} color="#10B981" />
                <Text className="text-emerald-600 text-xs font-bold">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-2">
              {[
                { label: "Lat", val: step2.latitude.toFixed(6) },
                { label: "Lng", val: step2.longitude?.toFixed(6) ?? "—" },
              ].map((c) => (
                <View
                  key={c.label}
                  className="flex-1 flex-row items-center gap-1.5 bg-white border border-green-200 rounded-xl px-2.5 py-2"
                >
                  <Ionicons name="navigate-outline" size={12} color="#10B981" />
                  <Text
                    className="text-xs text-green-800 font-semibold"
                    numberOfLines={1}
                  >
                    {c.label}: {c.val}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/mapPicker" as any)}
            activeOpacity={0.8}
            className="border-2 border-dashed border-orange-200 rounded-2xl h-40 items-center justify-center bg-orange-50"
          >
              <View
                className="w-16 h-16 rounded-full bg-white border-2 border-orange-200 items-center justify-center mb-3"
                style={{
                  elevation: 4,
                  shadowColor: colors.shadowPrimary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                }}
              >
                <Ionicons name="map" size={30} color={colors.primary} />
              </View>
            <Text className="text-orange-700 font-extrabold text-[15px]">
              Tap to Open Map
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              Drop a pin on your property location
            </Text>
          </TouchableOpacity>
        )}
        {errors.mapPin && (
          <View className="flex-row items-center gap-1 mt-2">
            <Ionicons name="alert-circle" size={13} color="#EF4444" />
            <Text className="text-xs text-red-500 flex-1">{errors.mapPin}</Text>
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
}

// ── STEP 3 ────────────────────────────────────────────────────────────────────
export function Step3Details() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const step3 = useAddPropertyStore((s) => s.step3);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep3 = useAddPropertyStore((s) => s.updateStep3);
  const { listingCategory, propertyType } = step1;
  if (!listingCategory || !propertyType)
    return (
      <EmptyStepState message="Go back and select a Listing Category and Property Type first" />
    );
  const sections = getStep3Fields(listingCategory, propertyType);
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StepHeader
        icon="list"
        title="Property Details"
        subtitle={`${propertyType.replace(/_/g, " ")} · ${listingCategory}`}
      />
      {sections.map((section) => (
        <DetailCard key={section.title} title={section.title}>
          {section.fields.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={step3[field.key]}
              allValues={step3}
              onChange={updateStep3}
              error={errors[field.key]}
            />
          ))}
        </DetailCard>
      ))}
    </ScrollView>
  );
}

// ── STEP 4 ────────────────────────────────────────────────────────────────────
export function Step4Pricing() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const step3 = useAddPropertyStore((s) => s.step3);
  const step4 = useAddPropertyStore((s) => s.step4);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep4 = useAddPropertyStore((s) => s.updateStep4);
  const { listingCategory, propertyType } = step1;
  if (!listingCategory || !propertyType)
    return <EmptyStepState message="Complete Step 1 first to set up pricing" />;
  const sections = getStep4Fields(listingCategory, propertyType);
  const allValues = { ...step3, ...step4 };
  const subtitle =
    listingCategory === "rental"
      ? "Rental pricing & availability"
      : listingCategory === "new"
        ? "Project pricing details"
        : "Resale pricing details";
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StepHeader
        icon="pricetag"
        title="Pricing & Availability"
        subtitle={subtitle}
      />
      {sections.map((section) => (
        <DetailCard key={section.title} title={section.title}>
          {section.fields.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={step4[field.key]}
              allValues={allValues}
              onChange={updateStep4}
              error={errors[field.key]}
            />
          ))}
        </DetailCard>
      ))}
    </ScrollView>
  );
}
