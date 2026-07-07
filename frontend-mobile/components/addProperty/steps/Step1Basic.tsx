import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import colors from '@/theme/colors';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    LISTING_CATEGORIES,
    PROPERTY_GROUPS,
    VALID_COMBINATIONS,
    getPropertyTypesByGroup,
} from "../../../lib/propertyTypes";
import { useAddPropertyStore } from "../../../store/addPropertyStore";

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  resale: "home-outline",
  rental: "key-outline",
  new: "business-outline",
};
const CATEGORY_DESCS: Record<string, string> = {
  resale: "Buy & Sell",
  rental: "Rent Out",
  new: "New Project",
};
const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  flat: "business-outline",
  villa: "home-outline",
  builder_floor: "layers-outline",
  penthouse: "diamond-outline",
  office: "briefcase-outline",
  shop: "bag-handle-outline",
  showroom: "storefront-outline",
  warehouse: "cube-outline",
  res_plot: "map-outline",
  agri_land: "leaf-outline",
};

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 shadow-sm"
      style={{ elevation: 3 }}
    >
      <View className="flex-row items-center gap-2 mb-3.5">
        <View className="w-1 h-[18px] bg-orange-500 rounded-sm" />
        {icon && <Ionicons name={icon} size={15} color={colors.primary} />}
        <Text className="text-xs font-extrabold text-gray-700 tracking-widest uppercase">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function ErrorRow({ msg }: { msg: string }) {
  return (
    <View className="flex-row items-center gap-1.5 mt-1.5">
      <Ionicons name="alert-circle" size={13} color="#EF4444" />
      <Text className="text-red-500 text-xs flex-1">{msg}</Text>
    </View>
  );
}

function CategoryCard({
  value,
  label,
  selected,
  onPress,
}: {
  value: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const iconName = CATEGORY_ICONS[value] ?? "help-circle-outline";
  const desc = CATEGORY_DESCS[value] ?? "";
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-1 items-center py-4 px-2 rounded-2xl mx-1 border-[1.5px]
        ${selected ? "bg-orange-50 border-orange-500" : "bg-gray-50 border-gray-200"}`}
      style={
        selected
            ? {
              elevation: 4,
              shadowColor: colors.shadowPrimary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.22,
              shadowRadius: 8,
            }
          : undefined
      }
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center mb-2.5 border-[1.5px]
        ${selected ? "bg-orange-500 border-orange-500" : "bg-white border-gray-200"}`}
        style={
          selected
            ? {
                elevation: 3,
                shadowColor: colors.shadowPrimary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.45,
                shadowRadius: 6,
              }
            : undefined
        }
      >
          <Ionicons
            name={iconName}
            size={22}
            color={selected ? colors.white : colors.inactive}
          />
      </View>
      <Text
        className={`text-xs font-extrabold ${selected ? "text-orange-700" : "text-gray-700"}`}
      >
        {label}
      </Text>
      <Text
        className={`text-[10px] mt-0.5 ${selected ? "text-orange-500" : "text-gray-400"}`}
      >
        {desc}
      </Text>
    </TouchableOpacity>
  );
}

function TypeChip({
  value,
  label,
  selected,
  disabled,
  onPress,
}: {
  value: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const iconName = TYPE_ICONS[value] ?? "help-circle-outline";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={`flex-row items-center px-3 py-2.5 rounded-xl mr-2 mb-2 border-[1.5px]
        ${selected ? "bg-orange-500 border-orange-500" : disabled ? "bg-gray-50 border-gray-100 opacity-40" : "bg-white border-gray-200"}`}
      style={
          selected
          ? {
              elevation: 3,
                shadowColor: colors.shadowPrimary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            }
          : undefined
      }
    >
      <Ionicons
        name={iconName}
        size={13}
        color={selected ? "#fff" : disabled ? "#D1D5DB" : "#6B7280"}
        style={{ marginRight: 5 }}
      />
      <Text
        className={`text-xs font-semibold ${selected ? "text-white" : disabled ? "text-gray-400" : "text-gray-700"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PremiumInput({
  icon,
  value,
  placeholder,
  onChangeText,
  multiline,
  maxLength,
  hasError,
  charCount,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  placeholder: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  maxLength?: number;
  hasError?: boolean;
  charCount?: { current: number; max: number };
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
      className={`border-[1.5px] rounded-xl ${borderCls}`}
      style={
        focused
          ? {
              shadowColor: colors.shadowPrimary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }
          : undefined
      }
    >
      {multiline ? (
        <View className="flex-row items-start p-3.5 gap-2.5">
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.inactive}
            style={{ marginTop: 2 }}
          />
          <TextInput
            ref={inputRef}
            className="flex-1 text-gray-900 text-sm"
            placeholder={placeholder}
            placeholderTextColor={colors.inactive}
            value={value}
            onChangeText={onChangeText}
            multiline
            numberOfLines={5}
            maxLength={maxLength}
            style={{
              minHeight: 120,
              textAlignVertical: "top",
              paddingBottom: 24,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
      ) : (
        <View
          className="flex-row items-center px-3.5 gap-2.5"
          style={{ height: 52 }}
        >
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.inactive}
          />
          <TextInput
            ref={inputRef}
            className="flex-1 text-gray-900 text-sm"
            style={{ height: 52 }}
            placeholder={placeholder}
            placeholderTextColor={colors.inactive}
            value={value}
            onChangeText={onChangeText}
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
      )}
      {charCount && (
        <View className="absolute bottom-2 right-3">
          <Text className="text-gray-400 text-[10px]">
            {charCount.current}/{charCount.max}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function Step1Basic() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const errors = useAddPropertyStore((s) => s.errors);
  const updateStep1 = useAddPropertyStore((s) => s.updateStep1);
  const setListingCategory = useAddPropertyStore((s) => s.setListingCategory);
  const setPropertyType = useAddPropertyStore((s) => s.setPropertyType);
  const { title, listingCategory, propertyType, description } = step1;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero header */}
      <View
        className="bg-white rounded-2xl p-5 mb-3 border border-orange-200 flex-row items-center gap-3.5"
        style={{
          elevation: 4,
          shadowColor: colors.shadowPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        }}
      >
        <View
          className="w-14 h-14 rounded-full bg-orange-500 items-center justify-center"
          style={{
            elevation: 6,
            shadowColor: colors.shadowPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="home" size={28} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-gray-900">
            List Your Property
          </Text>
          <Text className="text-sm text-gray-500 mt-1 leading-5">
            Start with the basics — what are you listing?
          </Text>
        </View>
      </View>

      {/* Listing Category */}
      <SectionCard title="Listing Category" icon="grid-outline">
        <View className="flex-row">
          {LISTING_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.value}
              value={cat.value}
              label={cat.label}
              selected={listingCategory === cat.value}
              onPress={() => setListingCategory(cat.value)}
            />
          ))}
        </View>
        {errors.listingCategory && <ErrorRow msg={errors.listingCategory} />}
      </SectionCard>

      {/* Property Type */}
      <SectionCard title="Property Type" icon="layers-outline">
        {!listingCategory ? (
          <View className="flex-row items-center gap-2.5 bg-orange-50 border border-orange-200 rounded-xl p-3.5">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text className="text-sm text-orange-700 flex-1 font-medium">
              Select a listing category above first
            </Text>
          </View>
        ) : (
          PROPERTY_GROUPS.map((g) => {
            const types = getPropertyTypesByGroup(g.group);
            return (
              <View key={g.group} className="mb-3.5">
                <View className="flex-row items-center gap-2 mb-2.5">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                    {g.label}
                  </Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>
                <View className="flex-row flex-wrap">
                  {types.map((t) => {
                    const isDisabled = !VALID_COMBINATIONS[t.value].includes(
                      listingCategory!,
                    );
                    return (
                      <TypeChip
                        key={t.value}
                        value={t.value}
                        label={t.label}
                        selected={propertyType === t.value}
                        disabled={isDisabled}
                        onPress={() => setPropertyType(t.value)}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
        {errors.propertyType && <ErrorRow msg={errors.propertyType} />}
      </SectionCard>

      {/* Title */}
      <SectionCard title="Property Title" icon="create-outline">
        <PremiumInput
          icon="create-outline"
          value={title}
          placeholder="e.g. 3BHK Premium Flat in Dharampeth"
          onChangeText={(t) => updateStep1({ title: t })}
          maxLength={100}
          hasError={!!errors.title}
          charCount={{ current: title.length, max: 100 }}
        />
        {errors.title ? (
          <ErrorRow msg={errors.title} />
        ) : (
          <Text className="text-gray-400 text-xs mt-1.5">
            Be specific — this is your listing headline
          </Text>
        )}
      </SectionCard>

      {/* Description */}
      <SectionCard title="Description" icon="document-text-outline">
        <PremiumInput
          icon="document-text-outline"
          value={description}
          placeholder="Describe the property — highlights, nearby landmarks, condition…"
          onChangeText={(t) => updateStep1({ description: t })}
          multiline
          maxLength={2000}
          hasError={!!errors.description}
          charCount={{ current: description.length, max: 2000 }}
        />
        {errors.description ? (
          <ErrorRow msg={errors.description} />
        ) : (
          <Text className="text-gray-400 text-xs mt-1.5">
            Min 10 characters
          </Text>
        )}
      </SectionCard>
    </ScrollView>
  );
}
