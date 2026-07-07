import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { Search, MapPin, Check, List, ArrowRight } from 'lucide-react-native';
import colors from '@/theme/colors';
import shadows from '@/theme/shadows';

// Standard Nagpur popular localities list for instant offline search filtering
const NAGPUR_LOCALITIES = [
  'Manish Nagar',
  'Dharampeth',
  'Sadar',
  'Wardha Road',
  'Besa',
  'Nandanvan',
  'Shankar Nagar',
  'Sitabuldi',
  'Pratap Nagar',
  'Trimurti Nagar',
  'Civil Lines',
  'Ramdaspeth',
  'Hudkeshwar',
  'Beltarodi',
  'Jaitala',
  'Mankapur',
  'Ganeshpeth',
  'Somalwada',
  'Khamla',
  'Lakadganj',
  'Jaripatka',
  'Kamptee Road',
];

export default function WizardLocalityScreen() {
  const step2 = useAddPropertyStore((s) => s.step2);
  const updateStep2 = useAddPropertyStore((s) => s.updateStep2);
  const goToPhase = useAddPropertyStore((s) => s.goToPhase);
  const { width } = useWindowDimensions();

  const [query, setQuery] = useState(step2.locality || '');

  const filteredLocalities = NAGPUR_LOCALITIES.filter((loc) =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  // If query is not empty and not matching any, allow custom entry
  const displayList = [...filteredLocalities];
  if (query.trim() && !filteredLocalities.some((l) => l.toLowerCase() === query.trim().toLowerCase())) {
    displayList.push(query.trim());
  }

  const handleSelect = (locality: string) => {
    updateStep2({ locality });
  };

  const handleContinue = () => {
    if (step2.locality) {
      goToPhase('details_a');
    }
  };

  return (
    <View style={{ backgroundColor: '#FFFDFA' }} className="flex-1">
      {/* Title Section */}
      <View className="px-6 pt-5 mb-4">
        {/* Step Badge */}
        <View className="flex-row mb-4">
          <View
            style={{
              backgroundColor: '#FCF5EC',
              borderColor: 'rgba(249, 115, 22, 0.15)',
            }}
            className="flex-row items-center border rounded-full px-3.5 py-1.5 gap-1.5"
          >
            <List size={13} color={colors.primary} strokeWidth={2.5} />
            <Text className="text-orange-600 text-[10px] font-bold uppercase tracking-wider">
              Step 6 of 11
            </Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <View className="mb-4">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Select locality
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Where is your property located?
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View className="px-2 mb-4">
        <View
          style={{ backgroundColor: '#FFFFFF' }}
          className="flex-row items-center border border-[#E2E8F0] rounded-xl px-4 py-4"
        >
          <Search size={18} color={colors.textLight} className="mr-3" strokeWidth={2.5} />
          <TextInput
            placeholder="Search locality (e.g. Manish Nagar)"
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={colors.textLight}
            className="flex-1 text-slate-800 text-sm font-semibold p-0"
            style={{ outlineStyle: 'none' } as any}
          />
        </View>
      </View>

      {/* Search Results List */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 110 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => {
          const isSelected = step2.locality === item;
          return (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
              style={{
                height: 58,
                backgroundColor: isSelected ? '#FCF5EC' : '#FFFFFF',
                borderColor: isSelected ? colors.primary : '#F1F5F9',
                borderWidth: isSelected ? 1.8 : 1,
              }}
              className="flex-row items-center justify-between rounded-xl px-5"
            >
              <View className="flex-row items-center flex-1 pr-3">
                <MapPin size={18} color={isSelected ? colors.primary : colors.textMuted} className="mr-3" strokeWidth={2.5} />
                <Text
                  style={{
                    color: isSelected ? colors.primaryDark : colors.text,
                  }}
                  className="text-sm font-semibold flex-1"
                >
                  {item}
                </Text>
              </View>

              {isSelected ? (
                <View
                  style={{ backgroundColor: colors.primary }}
                  className="w-6 h-6 rounded-full items-center justify-center"
                >
                  <Check size={13} color="#FFF" strokeWidth={3.5} />
                </View>
              ) : (
                <Text className="text-slate-400 text-xs font-bold">Nagpur</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Sticky Bottom Button */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: 'rgba(241, 245, 249, 0.8)',
          backgroundColor: '#FFFFFF',
        }}
        className="absolute bottom-0 left-0 right-0 p-5"
      >
        <TouchableOpacity
          disabled={!step2.locality}
          onPress={handleContinue}
          activeOpacity={0.85}
          style={{
            backgroundColor: step2.locality ? '#1E293B' : 'rgba(203, 213, 225, 0.6)',
          }}
          className="w-full h-14 rounded-2xl flex-row items-center justify-center"
        >
          <Text className="text-white font-black text-sm tracking-wider mr-2">
            Continue
          </Text>
          <ArrowRight size={16} color="#FFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

