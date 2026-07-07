import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import { Tag, Key, Building2, List, Check } from 'lucide-react-native';

export default function WizardCategoryScreen() {
  const step1 = useAddPropertyStore((s) => s.step1);
  const setListingCategory = useAddPropertyStore((s) => s.setListingCategory);

  // Local state to allow visual selection before confirming via Continue
  const [selected, setSelected] = useState<'resale' | 'rental' | 'new' | null>(
    step1.listingCategory
  );

  const handleSelect = (category: 'resale' | 'rental' | 'new') => {
    setSelected(category);
  };

  const handleContinue = () => {
    if (selected) {
      setListingCategory(selected);
    }
  };

  const categories = [
    {
      value: 'resale' as const,
      label: 'Resale',
      desc: 'Selling a pre-owned property',
      badge: 'Total price + price/sq.ft',
      icon: Tag,
    },
    {
      value: 'rental' as const,
      label: 'Rental',
      desc: 'Putting a property on rent',
      badge: 'Monthly rent + deposit',
      icon: Key,
    },
    {
      value: 'new' as const,
      label: 'New project',
      desc: 'Builder or under-construction',
      badge: 'Starting price + booking',
      icon: Building2,
    },
  ];

  return (
    <View style={{ backgroundColor: '#FFFDFA' }} className="flex-1 justify-between px-6">
      {/* Upper Section */}
      <View className="flex-1 justify-center py-4">
        {/* Step Badge */}
        <View className="flex-row mb-4 mt-2">
          <View
            style={{
              backgroundColor: '#FCF5EC',
              borderColor: 'rgba(249, 115, 22, 0.15)',
            }}
            className="flex-row items-center border rounded-full px-3.5 py-1.5 gap-1.5"
          >
            <List size={13} color="#E06C35" strokeWidth={2.5} />
            <Text className="text-orange-600 text-[10px] font-black uppercase tracking-wider">
              Step 2 of 11
            </Text>
          </View>
        </View>

        {/* Hero Title & Subtext */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            What kind of listing do you want to post?
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            This sets the pricing model and fields shown.
          </Text>
        </View>

        {/* Categories List */}
        <View className="flex-col gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selected === cat.value;

            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.9}
                onPress={() => handleSelect(cat.value)}
                style={{
                  borderColor: isSelected ? '#EB7F3E' : '#EBE4DB',
                  backgroundColor: isSelected ? '#FEF7F2' : '#FFFFFF',
                  borderWidth: isSelected ? 1.5 : 1,
                  borderRadius: 16,
                }}
                className="flex-row items-center justify-between p-4"
              >
                {/* Left Side Info */}
                <View className="flex-row items-center flex-1 pr-2">
                  {/* Icon Block */}
                  <View
                    style={{ backgroundColor: '#FAF1E8' }}
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  >
                    <Icon size={22} color="#EB7F3E" strokeWidth={2} />
                  </View>

                  {/* Text labels */}
                  <View className="flex-1 items-start">
                    <Text className="text-[#222222] font-bold text-[16px] mb-0.5">
                      {cat.label}
                    </Text>
                    <Text className="text-[#6B6B6B] text-[13px] mb-2.5">
                      {cat.desc}
                    </Text>
                    
                    {/* Orange Inline Pill Badge */}
                    <View
                      style={{
                        borderColor: '#F0D5C1',
                        backgroundColor: '#FFF8F2',
                      }}
                      className="border rounded-full px-2.5 py-1"
                    >
                      <Text style={{ color: '#AF5D2E' }} className="text-[11px] font-bold">
                        {cat.badge}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right Selection Circle */}
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: isSelected ? 0 : 1.5,
                    borderColor: '#D4CDC4',
                    backgroundColor: isSelected ? '#EB7F3E' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && (
                    <Check size={14} color="#FFF" strokeWidth={3} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Sticky Action Area */}
      <View className="pt-4">
        <TouchableOpacity
          disabled={!selected}
          onPress={handleContinue}
          activeOpacity={0.85}
          style={{
            backgroundColor: selected ? '#EB7F3E' : 'transparent',
            borderColor: selected ? '#EB7F3E' : '#F2EBE3',
            borderWidth: 1.5,
            borderRadius: 12,
          }}
          className="w-full h-[52px] flex-row items-center justify-center mb-3"
        >
          <Text
            style={{ color: selected ? '#FFFFFF' : '#FFFFFF' }}
            className="font-bold text-[16px]"
          >
            Continue
          </Text>
        </TouchableOpacity>
        <Text className="text-[#B09880] text-[13px] font-medium text-center">
          Tap a card to select
        </Text>
      </View>
    </View>
  );
}

