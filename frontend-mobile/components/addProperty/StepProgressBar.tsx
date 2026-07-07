import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import { useAddPropertyStore } from '@/store/addPropertyStore';

export type WizardPhase =
  | 'listed_by'
  | 'category'
  | 'type'
  | 'basic_info'
  | 'locality'
  | 'map'
  | 'details_a'
  | 'details_b'
  | 'pricing'
  | 'photos'
  | 'review';

interface Props {
  currentPhase: WizardPhase;
  onBack: () => void;
  categoryLabel: string | null;
}

export const PHASES: Record<WizardPhase, { label: string; step: number; count: number }> = {
  listed_by:  { label: 'Listed By',        step: 1,  count: 11 },
  category:   { label: 'Listing Category', step: 2,  count: 11 },
  type:       { label: 'Property Type',    step: 3,  count: 11 },
  basic_info: { label: 'Basic Info',       step: 4,  count: 11 },
  locality:   { label: 'Select Locality',  step: 6,  count: 11 },
  map:        { label: 'Pick Location',    step: 5,  count: 11 },
  details_a:  { label: 'Layout & Area',    step: 7,  count: 11 },
  details_b:  { label: 'Property Info',    step: 8,  count: 11 },
  pricing:    { label: 'Pricing & Terms',  step: 9,  count: 11 },
  photos:     { label: 'Upload Photos',    step: 10, count: 11 },
  review:     { label: 'Review & Publish', step: 11, count: 11 },
};

export default function StepProgressBar({ currentPhase, onBack, categoryLabel }: Props) {
  const phaseInfo = PHASES[currentPhase] || PHASES.category;
  const progressPercent = (phaseInfo.step / phaseInfo.count) * 100;
  const showBack = true;
  const editingPropertyId = useAddPropertyStore((s) => s.editingPropertyId);

  return (
    <View
      style={{ backgroundColor: '#FFFDFA' }}
      className="border-b border-orange-100/50"
    >
      {/* Premium Header Bar */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={{ backgroundColor: '#F0EBE1' }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
          >
            <ArrowLeft size={20} color="#333333" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-[#1A1A1A] text-[18px] font-bold tracking-tight">
            {editingPropertyId ? 'Edit listing' : 'Add new listing'}
          </Text>
        </View>
      </View>

      {/* Sleek Progress Line */}
      <View className="w-full bg-[#EBE4DB]" style={{ height: 4 }}>
        <View
          style={{
            width: `${progressPercent > 100 ? 100 : progressPercent}%`,
            backgroundColor: '#EB7F3E',
          }}
          className="h-full"
        />
      </View>
    </View>
  );
}
