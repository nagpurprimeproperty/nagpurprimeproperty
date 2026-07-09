import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { X } from "lucide-react-native";
import SectionDivider from "@/shared/components/SectionDivider";
import colors from "@/theme/colors";
import shadows from "@/theme/shadows";

const FilterChip = ({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`px-5 py-2.5 rounded-full mr-2 mb-3 border ${
      isSelected
        ? "bg-orange-500 border-orange-500"
        : "bg-slate-50 border-slate-100"
    }`}
  >
    <Text
      className={`font-bold text-[13px] ${
        isSelected ? "text-white" : "text-slate-500"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

type FilterValues = {
  listingCategory: string;
  propertyType: string;
  bhk: string;
  budgetFrom: string;
  budgetTo: string;
  selectedAmenities: string[];
};

type FilterModalProps = {
  initialValues: FilterValues;
  onApply: (values: FilterValues) => void;
  onClear: () => void;
  onClose: () => void;
};

const AMENITIES_LIST = [
  'Parking (2-wheeler)',
  'Parking (4-wheeler)',
  'Lift/Elevator',
  '24x7 Security',
  'CCTV Surveillance',
  'Gym/Fitness Centre',
  'Swimming Pool',
  'Garden/Park',
  "Children's Play Area",
  'Clubhouse',
  'Power Backup',
  'Rainwater Harvesting',
  'Fire Safety',
  'Intercom',
  'Visitor Parking',
  'Water Storage',
  'Piped Gas',
  'Sewage Treatment',
  'Gas Connection',
  'Water Connection',
  'Electricity Connection',
  'Water Supply',
  'Other Amenities',
];

export const FilterModal = ({
  initialValues,
  onApply,
  onClear,
  onClose,
}: FilterModalProps) => {
  const [listingCategory, setListingCategory] = useState(initialValues.listingCategory);
  const [propertyType, setPropertyType] = useState(initialValues.propertyType);
  const [bhk, setBhk] = useState(initialValues.bhk);

  // Convert raw values (e.g. 2000000) to Lakhs (e.g. 20) for user inputs
  const initialMinLakhs = initialValues.budgetFrom ? String(Number(initialValues.budgetFrom) / 100000) : "";
  const initialMaxLakhs = initialValues.budgetTo ? String(Number(initialValues.budgetTo) / 100000) : "";

  const [budgetFromText, setBudgetFromText] = useState(initialMinLakhs);
  const [budgetToText, setBudgetToText] = useState(initialMaxLakhs);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialValues.selectedAmenities);

  // Keep local states in sync when initialValues change
  useEffect(() => {
    setListingCategory(initialValues.listingCategory);
    setPropertyType(initialValues.propertyType);
    setBhk(initialValues.bhk);
    setBudgetFromText(initialValues.budgetFrom ? String(Number(initialValues.budgetFrom) / 100000) : "");
    setBudgetToText(initialValues.budgetTo ? String(Number(initialValues.budgetTo) / 100000) : "");
    setSelectedAmenities(initialValues.selectedAmenities);
  }, [initialValues]);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleApply = () => {
    // Convert Lakhs values back to raw pricing integers for backend querying
    const rawBudgetFrom = budgetFromText ? String(Number(budgetFromText) * 100000) : "";
    const rawBudgetTo = budgetToText ? String(Number(budgetToText) * 100000) : "";

    onApply({
      listingCategory,
      propertyType,
      bhk,
      budgetFrom: rawBudgetFrom,
      budgetTo: rawBudgetTo,
      selectedAmenities,
    });
  };

  const handleClear = () => {
    setListingCategory("All");
    setPropertyType("All");
    setBhk("Any");
    setBudgetFromText("");
    setBudgetToText("");
    setSelectedAmenities([]);
    onClear();
  };

  return (
    <View className="flex-1 px-6" style={{ flex: 1 }}>
      <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
        <Text className="text-xl font-black text-slate-900 tracking-tight">
          Filters
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center"
        >
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ flex: 1, marginTop: 16 }}
      >
        <SectionDivider label="Listing Category" className="mb-3" />
        <View className="flex-row flex-wrap">
          {["All", "Resale", "Rental", "New"].map((lc) => (
            <FilterChip
              key={lc}
              label={lc}
              isSelected={listingCategory === lc}
              onPress={() => setListingCategory(lc)}
            />
          ))}
        </View>

        <SectionDivider label="Property Type" className="mt-4 mb-3" />
        <View className="flex-row flex-wrap">
          {["All", "Flat", "Villa", "Plot", "Commercial"].map((t) => (
            <FilterChip
              key={t}
              label={t}
              isSelected={propertyType === t}
              onPress={() => setPropertyType(t)}
            />
          ))}
        </View>

        <SectionDivider label="BHK" className="mt-4 mb-3" />
        <View className="flex-row flex-wrap">
          {["Any", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"].map((b) => (
            <FilterChip
              key={b}
              label={b}
              isSelected={bhk === b}
              onPress={() => setBhk(b)}
            />
          ))}
        </View>

        <SectionDivider label="Budget (Lakhs)" className="mt-4 mb-3" />
        <View className="flex-row items-center justify-between">
          <TextInput
            placeholder="Min"
            placeholderTextColor={colors.textPlaceholder}
            className="bg-slate-50 flex-1 p-4 rounded-xl border border-slate-100 font-bold text-slate-900"
            keyboardType="numeric"
            value={budgetFromText}
            onChangeText={setBudgetFromText}
          />
          <Text className="mx-4 font-bold text-slate-300">—</Text>
          <TextInput
            placeholder="Max"
            placeholderTextColor={colors.textPlaceholder}
            className="bg-slate-50 flex-1 p-4 rounded-xl border border-slate-100 font-bold text-slate-900"
            keyboardType="numeric"
            value={budgetToText}
            onChangeText={setBudgetToText}
          />
        </View>

        <SectionDivider label="Amenities" className="mt-6 mb-3" />
        <View className="flex-row flex-wrap">
          {AMENITIES_LIST.map((a) => (
            <FilterChip
              key={a}
              label={a}
              isSelected={selectedAmenities.includes(a)}
              onPress={() => toggleAmenity(a)}
            />
          ))}
        </View>
      </BottomSheetScrollView>

      <View className="flex-row gap-4 py-6 border-t border-slate-100">
        <TouchableOpacity
          onPress={handleClear}
          className="flex-1 bg-slate-100 py-4 rounded-2xl items-center"
        >
          <Text className="font-black text-slate-900">Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApply}
          style={shadows.button}
          className="flex-[1.5] bg-orange-500 py-4 rounded-2xl items-center"
        >
          <Text className="font-black text-white">Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
