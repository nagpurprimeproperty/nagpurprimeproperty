import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAddPropertyStore } from '@/store/addPropertyStore';
import type { PropertyListedBy } from '@/store/addPropertyStore';
import { User, Briefcase, HardHat, List, Check } from 'lucide-react-native';

const LISTED_BY_OPTIONS: {
  value: PropertyListedBy;
  label: string;
  desc: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  {
    value: 'Owner',
    label: 'Owner',
    desc: 'Listing directly by the property owner',
    badge: 'No brokerage fee',
    icon: User,
  },
  {
    value: 'Broker',
    label: 'Broker',
    desc: 'Listed by a registered property broker',
    badge: 'Professional agent',
    icon: Briefcase,
  },
  {
    value: 'Builder',
    label: 'Builder',
    desc: 'Listed by developer or construction firm',
    badge: 'New project / developer',
    icon: HardHat,
  },
];

export default function WizardListedByScreen() {
  const step0 = useAddPropertyStore((s) => s.step0);
  const updateStep0 = useAddPropertyStore((s) => s.updateStep0);
  const goToPhase = useAddPropertyStore((s) => s.goToPhase);

  const [selected, setSelected] = useState<PropertyListedBy | null>(
    step0.propertyListedBy
  );

  const handleSelect = (value: PropertyListedBy) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (selected) {
      updateStep0({ propertyListedBy: selected });
      goToPhase('category');
    }
  };

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
              Step 1 of 11
            </Text>
          </View>
        </View>

        {/* Hero Title & Subtext */}
        <View className="mb-6">
          <Text className="text-[26px] font-bold text-[#1A1A1A] tracking-tight leading-[34px]">
            Property Listed By
          </Text>
          <Text className="text-[#6B6B6B] text-[15px] font-medium mt-2">
            Who is listing this property? This helps buyers trust the source.
          </Text>
        </View>

        {/* Options List */}
        <View className="flex-col gap-4">
          {LISTED_BY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.9}
                onPress={() => handleSelect(option.value)}
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
                      {option.label}
                    </Text>
                    <Text className="text-[#6B6B6B] text-[13px] mb-2.5">
                      {option.desc}
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
                        {option.badge}
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
            backgroundColor: selected ? '#EB7F3E' : '#F0EAE3',
            borderColor: selected ? '#EB7F3E' : '#F2EBE3',
            borderWidth: 1.5,
            borderRadius: 12,
          }}
          className="w-full h-[52px] flex-row items-center justify-center mb-3"
        >
          <Text
            style={{ color: selected ? '#FFFFFF' : '#C4A98A' }}
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
